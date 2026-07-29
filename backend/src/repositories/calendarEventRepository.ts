import type { PrismaClient, CalendarEventKind, SessionType, Weekday } from "@prisma/client";

export interface CreateRecurringClassInput {
  userId: string;
  semesterId: string;
  subjectId: string;
  title: string;
  dayOfWeek: Weekday;
  startTime: string;
  endTime: string;
  location?: string;
  sessionType: SessionType;
}

export function createCalendarEventRepository(prisma: PrismaClient) {
  return {
    listForSemester(semesterId: string, userId: string) {
      return prisma.calendarEvent.findMany({
        where: { semesterId, userId },
      });
    },
    // Bounded read: callers (the route layer) enforce the 180-day max range
    // before calling this.
    listInRange(userId: string, semesterId: string, rangeStart: Date, rangeEnd: Date) {
      return prisma.calendarEvent.findMany({
        where: {
          userId,
          semesterId,
          OR: [
            { kind: "RECURRING_CLASS" as CalendarEventKind },
            {
              kind: "ONE_OFF" as CalendarEventKind,
              startAt: { gte: rangeStart, lte: rangeEnd },
            },
          ],
        },
      });
    },
    createRecurringClass(data: CreateRecurringClassInput) {
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
    createManyRecurringClasses(rows: CreateRecurringClassInput[]) {
      return prisma.calendarEvent.createMany({
        data: rows.map((data) => ({
          userId: data.userId,
          semesterId: data.semesterId,
          subjectId: data.subjectId,
          kind: "RECURRING_CLASS" as CalendarEventKind,
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
