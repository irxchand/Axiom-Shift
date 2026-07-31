export function createCalendarEventRepository(prisma) {
    return {
        listForSemester(semesterId, userId) {
            return prisma.calendarEvent.findMany({
                where: { semesterId, userId },
            });
        },
        // Bounded read: callers (the route layer) enforce the 180-day max range
        // before calling this.
        listInRange(userId, semesterId, rangeStart, rangeEnd) {
            return prisma.calendarEvent.findMany({
                where: {
                    userId,
                    semesterId,
                    OR: [
                        { kind: "RECURRING_CLASS" },
                        {
                            kind: "ONE_OFF",
                            startAt: { gte: rangeStart, lte: rangeEnd },
                        },
                    ],
                },
            });
        },
        createRecurringClass(data) {
            return prisma.calendarEvent.create({
                data: {
                    userId: data.userId,
                    semesterId: data.semesterId,
                    subjectId: data.subjectId,
                    kind: "RECURRING_CLASS",
                    title: data.title,
                    dayOfWeek: data.dayOfWeek,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    location: data.location,
                    sessionType: data.sessionType,
                },
            });
        },
        createManyRecurringClasses(rows) {
            return prisma.calendarEvent.createMany({
                data: rows.map((data) => ({
                    userId: data.userId,
                    semesterId: data.semesterId,
                    subjectId: data.subjectId,
                    kind: "RECURRING_CLASS",
                    title: data.title,
                    dayOfWeek: data.dayOfWeek,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    location: data.location,
                    sessionType: data.sessionType,
                })),
            });
        },
    };
}
//# sourceMappingURL=calendarEventRepository.js.map