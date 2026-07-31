export function createStateRepository(prisma) {
    return {
        findForUser(userId) {
            return prisma.semesterOperationsState.findUnique({ where: { userId } });
        },
        upsert(userId, activeSemesterId, summary) {
            return prisma.semesterOperationsState.upsert({
                where: { userId },
                create: { userId, activeSemesterId, summary },
                update: { activeSemesterId, summary, computedAt: new Date() },
            });
        },
    };
}
//# sourceMappingURL=stateRepository.js.map