export class PlanningService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createProposedPlan(userId, semesterId, tasks, source) {
        return this.prisma.studyPlan.create({
            data: {
                userId,
                semesterId,
                title: `Study Plan - ${new Date().toISOString().split('T')[0]}`,
                generatedBy: source,
                status: 'PROPOSED',
                tasks: {
                    create: tasks.map((t) => ({
                        subjectId: t.subjectId,
                        title: t.title,
                        reason: t.reason,
                        evidenceRefs: t.evidenceRefs,
                        startAt: t.startAt,
                        endAt: t.endAt
                    }))
                }
            },
            include: { tasks: true }
        });
    }
    async acceptPlan(planId, userId) {
        return this.prisma.$transaction(async (tx) => {
            const plan = await tx.studyPlan.findFirst({
                where: { id: planId, userId },
                include: { tasks: true }
            });
            if (!plan)
                throw new Error('Plan not found.');
            // Convert tasks into calendar events upon explicit user acceptance
            for (const task of plan.tasks) {
                const event = await tx.calendarEvent.create({
                    data: {
                        userId,
                        semesterId: plan.semesterId,
                        subjectId: task.subjectId,
                        kind: 'ONE_OFF',
                        title: task.title,
                        eventType: 'STUDY_SESSION',
                        startAt: task.startAt,
                        endAt: task.endAt,
                        source: 'PLANNING_AGENT',
                        status: 'SCHEDULED',
                        metadata: { reason: task.reason, evidenceRefs: task.evidenceRefs }
                    }
                });
                await tx.studyTask.update({
                    where: { id: task.id },
                    data: { calendarEventId: event.id }
                });
            }
            return tx.studyPlan.update({
                where: { id: planId },
                data: { status: 'ACCEPTED' },
                include: { tasks: true }
            });
        });
    }
}
//# sourceMappingURL=planningService.js.map