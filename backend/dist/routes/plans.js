import { z } from 'zod';
import { PlanningService } from '../services/planningService.js';
import { rankSubjectsByUrgency, generateDeterministicReason } from '../modules/planning/planning.fallback.js';
const AcceptPlanSchema = z.object({
    planId: z.string()
});
export default async function plansRoutes(app) {
    const planningService = new PlanningService(app.prisma);
    app.post('/api/v1/plans/generate', async (request, reply) => {
        // Generate a deterministic plan using planning.fallback.ts logic
        const userId = request.userId;
        const semester = await app.prisma.semester.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { subjects: true }
        });
        if (!semester) {
            return reply.code(404).send({ error: { message: "Active semester not found" } });
        }
        // Build the context for the deterministic fallback
        const subjectsContext = (semester.subjects || []).map((sub) => {
            // Normally we would get real risk and assessments. Mocking for now.
            return {
                subjectId: sub.id,
                subjectName: sub.name,
                risk: {
                    id: '1',
                    subjectId: sub.id,
                    severity: 'HIGH',
                    score: 80,
                    drivers: ['Low midterm score'],
                    generatedAt: new Date()
                },
                upcomingAssessments: [],
                marksLost: 10
            };
        });
        const ranked = rankSubjectsByUrgency(subjectsContext);
        const topSubject = ranked[0];
        const tasks = [];
        if (topSubject) {
            const now = new Date();
            tasks.push({
                subjectId: topSubject.subjectId,
                title: `Focus Block: ${topSubject.subjectName}`,
                reason: generateDeterministicReason(topSubject),
                evidenceRefs: [],
                startAt: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour from now
                endAt: new Date(now.getTime() + 120 * 60 * 1000) // 2 hours from now
            });
        }
        const plan = await planningService.createProposedPlan(userId, semester.id, tasks, 'DETERMINISTIC_FALLBACK');
        return { data: plan };
    });
    app.get('/api/v1/plans/current', async (request, reply) => {
        const userId = request.userId;
        const plan = await app.prisma.studyPlan.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { tasks: true }
        });
        return { data: plan || null };
    });
    app.post('/api/v1/plans/:planId/accept', async (request, reply) => {
        const { planId } = AcceptPlanSchema.parse(request.params);
        const userId = request.userId;
        const acceptedPlan = await planningService.acceptPlan(planId, userId);
        return { data: acceptedPlan };
    });
}
//# sourceMappingURL=plans.js.map