export function createSemesterRepository(prisma) {
    return {
        listForUser(userId) {
            return prisma.semester.findMany({
                where: { userId },
                orderBy: { startDate: "desc" },
            });
        },
        // Ownership check happens right here: querying by (id, userId) together
        // means a semester belonging to another user simply doesn't match — the
        // caller sees NOT_FOUND, never another user's data.
        findByIdForUser(id, userId) {
            return prisma.semester.findFirst({ where: { id, userId } });
        },
        create(data) {
            return prisma.semester.create({ data });
        },
    };
}
export function createSubjectRepository(prisma) {
    return {
        listForSemester(semesterId, userId) {
            return prisma.subject.findMany({
                where: { semesterId, userId },
                orderBy: { code: "asc" },
            });
        },
        findByCode(semesterId, code) {
            return prisma.subject.findFirst({ where: { semesterId, code } });
        },
        findByIdForUser(id, userId) {
            return prisma.subject.findFirst({ where: { id, userId } });
        },
        create(data) {
            return prisma.subject.create({ data });
        },
    };
}
//# sourceMappingURL=semesterRepository.js.map