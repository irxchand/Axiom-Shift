import { createEvaluationRepository, createAssessmentRepository, createMarkRepository, createRiskRepository, } from "../repositories/evaluationRepository.js";
import { createSemesterRepository, createSubjectRepository, } from "../repositories/semesterRepository.js";
import { computeMarksLost, computeOverallScore, computeRequiredFutureAverage, computeRiskSeverity, computeSgpaScenario, computeSgpaOutlook, } from "./evaluationLogic.js";
import { AppError } from "../lib/errors.js";
const DEFAULT_TARGET_PERCENT = 75;
/** Shared by risk recompute and SGPA outlook — both need a subject's secured/remaining weight. */
async function getOverallScoreForSubject(client, subjectId, userId) {
    const evaluationRepo = createEvaluationRepository(client);
    const assessmentRepo = createAssessmentRepository(client);
    const plan = await evaluationRepo.findPlanForSubject(subjectId, userId);
    if (!plan)
        return null; // no plan yet — nothing to score
    const assessments = await assessmentRepo.listForSubject(subjectId, userId);
    const components = plan.components.map((component) => ({
        id: component.id,
        weightPercent: component.weightPercent,
        assessments: assessments
            .filter((a) => a.evaluationComponentId === component.id)
            .map((a) => ({
            id: a.id,
            maxMarks: a.maxMarks,
            obtainedMarks: a.marks?.obtainedMarks ?? null,
        })),
    }));
    return { overall: computeOverallScore(components), assessments };
}
async function recomputeRiskForSubjectWithClient(client, subjectId, userId) {
    const riskRepo = createRiskRepository(client);
    const result = await getOverallScoreForSubject(client, subjectId, userId);
    if (!result)
        return null;
    const { overall, assessments } = result;
    const requiredFutureAverage = computeRequiredFutureAverage(DEFAULT_TARGET_PERCENT, overall);
    const nextDeadline = assessments
        .filter((a) => !a.marks || a.marks.obtainedMarks === null)
        .map((a) => a.dueDate)
        .filter((d) => d !== null)
        .sort((a, b) => a.getTime() - b.getTime())[0];
    const daysToNextDeadline = nextDeadline
        ? Math.ceil((nextDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;
    const risk = computeRiskSeverity({
        securedWeightedPercent: overall.securedWeightedPercent,
        remainingWeightPercent: overall.remainingWeightPercent,
        requiredFutureAverage,
        daysToNextDeadline,
    });
    const saved = await riskRepo.upsert({
        userId,
        subjectId,
        severity: risk.severity,
        score: risk.score,
        drivers: risk.drivers,
        recommended: risk.recommendedActions,
    });
    return { saved, risk };
}
export function createEvaluationService(prisma) {
    const evaluationRepo = createEvaluationRepository(prisma);
    const assessmentRepo = createAssessmentRepository(prisma);
    const riskRepo = createRiskRepository(prisma);
    const subjectRepo = createSubjectRepository(prisma);
    const semesterRepo = createSemesterRepository(prisma);
    async function requireOwnedSubject(subjectId, userId) {
        const subject = await subjectRepo.findByIdForUser(subjectId, userId);
        if (!subject)
            throw AppError.notFound("Subject not found.");
        return subject;
    }
    return {
        async createEvaluationPlan(userId, subjectId, components) {
            await requireOwnedSubject(subjectId, userId);
            const totalWeight = components.reduce((sum, c) => sum + c.weightPercent, 0);
            if (Math.abs(totalWeight - 100) > 0.01) {
                throw AppError.validation("Evaluation component weights must sum to 100.");
            }
            const existing = await evaluationRepo.findPlanForSubject(subjectId, userId);
            if (existing) {
                throw AppError.conflict("This subject already has an evaluation plan.");
            }
            return evaluationRepo.createPlan({ userId, subjectId, components });
        },
        async getEvaluationPlan(userId, subjectId) {
            await requireOwnedSubject(subjectId, userId);
            const plan = await evaluationRepo.findPlanForSubject(subjectId, userId);
            if (!plan)
                throw AppError.notFound("No evaluation plan exists for this subject yet.");
            return plan;
        },
        async createAssessment(userId, input) {
            await requireOwnedSubject(input.subjectId, userId);
            if (input.maxMarks <= 0) {
                throw AppError.validation("maxMarks must be greater than 0.");
            }
            return assessmentRepo.create({
                userId,
                subjectId: input.subjectId,
                evaluationComponentId: input.evaluationComponentId,
                title: input.title,
                dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
                maxMarks: input.maxMarks,
            });
        },
        /**
         * Updates marks, recomputes risk, and writes an audit log entry — all in
         * a single transaction, per the SDD's "transaction around marks update
         * and risk recompute event" check. SGPA is intentionally NOT persisted
         * here: it's computed on demand in getSgpaScenarios from the same
         * source-of-truth marks/plan data, so there's no cached copy to go stale.
         */
        async updateMarks(userId, assessmentId, obtainedMarks) {
            const assessment = await assessmentRepo.findByIdForUser(assessmentId, userId);
            if (!assessment)
                throw AppError.notFound("Assessment not found.");
            if (obtainedMarks !== null) {
                if (obtainedMarks < 0 || obtainedMarks > assessment.maxMarks) {
                    throw AppError.validation(`obtainedMarks must be between 0 and ${assessment.maxMarks}.`);
                }
            }
            return prisma.$transaction(async (tx) => {
                const client = tx;
                const txMarkRepo = createMarkRepository(client);
                const mark = await txMarkRepo.upsertForAssessment(assessmentId, userId, obtainedMarks);
                const riskResult = await recomputeRiskForSubjectWithClient(client, assessment.subjectId, userId);
                await client.auditLog.create({
                    data: {
                        userId,
                        action: "UPDATE_MARKS",
                        metadata: {
                            assessmentId,
                            subjectId: assessment.subjectId,
                            obtainedMarks,
                            riskSeverity: riskResult?.risk.severity ?? null,
                        },
                    },
                });
                return { mark, risk: riskResult?.saved ?? null };
            });
        },
        async getRiskForUser(userId) {
            return riskRepo.listForUser(userId);
        },
        async recomputeRisk(userId, subjectId) {
            await requireOwnedSubject(subjectId, userId);
            const result = await recomputeRiskForSubjectWithClient(prisma, subjectId, userId);
            if (!result) {
                throw AppError.validation("Cannot compute risk before an evaluation plan exists.");
            }
            return result.saved;
        },
        /**
         * Returns both a single-target scenario (per-subject projected percent)
         * AND the current / best-case / worst-case SGPA outlook, computed from
         * actual secured vs. remaining weight per subject.
         */
        async getSgpaScenarios(userId, targetPercentBySubject) {
            const semesters = await semesterRepo.listForUser(userId);
            const activeSemester = semesters[0];
            if (!activeSemester)
                throw AppError.notFound("No semester found for this user.");
            const subjects = await subjectRepo.listForSemester(activeSemester.id, userId);
            const gradedSubjects = subjects.filter((s) => s.credits !== null);
            const scenarioInputs = gradedSubjects.map((s) => ({
                subjectId: s.id,
                credits: s.credits,
                projectedPercent: targetPercentBySubject[s.id] ?? DEFAULT_TARGET_PERCENT,
            }));
            const outlookInputs = [];
            for (const s of gradedSubjects) {
                const result = await getOverallScoreForSubject(prisma, s.id, userId);
                outlookInputs.push({
                    subjectId: s.id,
                    credits: s.credits,
                    securedWeightedPercent: result?.overall.securedWeightedPercent ?? 0,
                    // No plan yet -> treat the whole subject as "remaining" (100% ungraded).
                    remainingWeightPercent: result?.overall.remainingWeightPercent ?? 100,
                });
            }
            return {
                scenario: computeSgpaScenario(scenarioInputs),
                outlook: computeSgpaOutlook(outlookInputs),
            };
        },
        computeMarksLostForAssessments: computeMarksLost,
    };
}
//# sourceMappingURL=evaluationService.js.map