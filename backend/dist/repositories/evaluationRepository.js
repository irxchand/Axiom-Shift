export function createEvaluationRepository(prisma) {
    return {
        findPlanForSubject(subjectId, userId) {
            return prisma.evaluationPlan.findFirst({
                where: { subjectId, userId },
                include: { components: true },
            });
        },
        createPlan(data) {
            return prisma.evaluationPlan.create({
                data: {
                    userId: data.userId,
                    subjectId: data.subjectId,
                    components: { create: data.components },
                },
                include: { components: true },
            });
        },
    };
}
export function createAssessmentRepository(prisma) {
    return {
        findByIdForUser(id, userId) {
            return prisma.assessment.findFirst({
                where: { id, userId },
                include: { marks: true, evaluationComponent: true },
            });
        },
        listForSubject(subjectId, userId) {
            return prisma.assessment.findMany({
                where: { subjectId, userId },
                include: { marks: true, evaluationComponent: true },
            });
        },
        create(data) {
            return prisma.assessment.create({ data });
        },
    };
}
export function createMarkRepository(prisma) {
    return {
        upsertForAssessment(assessmentId, userId, obtainedMarks) {
            return prisma.mark.upsert({
                where: { assessmentId },
                create: { assessmentId, userId, obtainedMarks },
                update: { obtainedMarks },
            });
        },
    };
}
export function createRiskRepository(prisma) {
    return {
        findForSubject(subjectId, userId) {
            return prisma.riskScore.findFirst({ where: { subjectId, userId } });
        },
        listForUser(userId) {
            return prisma.riskScore.findMany({ where: { userId } });
        },
        upsert(data) {
            return prisma.riskScore.upsert({
                where: { subjectId: data.subjectId },
                create: data,
                update: {
                    severity: data.severity,
                    score: data.score,
                    drivers: data.drivers,
                    recommended: data.recommended,
                    computedAt: new Date(),
                },
            });
        },
    };
}
//# sourceMappingURL=evaluationRepository.js.map