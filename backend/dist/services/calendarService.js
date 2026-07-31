import { DateTime } from "luxon";
import { createCalendarEventRepository } from "../repositories/calendarEventRepository.js";
import { createSemesterRepository } from "../repositories/semesterRepository.js";
import { computeDaySummary, expandCalendarEvents, MAX_CALENDAR_RANGE_DAYS, } from "./calendarLogic.js";
import { AppError } from "../lib/errors.js";
function toRaw(event) {
    return {
        id: event.id,
        subjectId: event.subjectId,
        title: event.title,
        kind: event.kind,
        location: event.location,
        sessionType: event.sessionType,
        dayOfWeek: event.dayOfWeek,
        startTime: event.startTime,
        endTime: event.endTime,
        startAt: event.startAt,
        endAt: event.endAt,
    };
}
function serializeOccurrence(occ) {
    return {
        eventId: occ.eventId,
        subjectId: occ.subjectId,
        title: occ.title,
        location: occ.location,
        sessionType: occ.sessionType,
        start: occ.start.toISO(),
        end: occ.end.toISO(),
    };
}
export function createCalendarService(prisma) {
    const semesterRepo = createSemesterRepository(prisma);
    const eventRepo = createCalendarEventRepository(prisma);
    return {
        /** Backs GET /api/v1/state's currentClass/nextClass/todaySchedule/freeWindows. */
        async getDaySummaryForSemester(userId, semesterId) {
            const semester = await semesterRepo.findByIdForUser(semesterId, userId);
            if (!semester)
                throw AppError.notFound("Semester not found.");
            const now = DateTime.now().setZone(semester.timezone);
            const events = (await eventRepo.listForSemester(semesterId, userId)).map(toRaw);
            const summary = computeDaySummary(events, now, semester.timezone);
            return {
                timezone: semester.timezone,
                asOf: now.toISO(),
                currentClass: summary.currentClass ? serializeOccurrence(summary.currentClass) : null,
                nextClass: summary.nextClass ? serializeOccurrence(summary.nextClass) : null,
                todaySchedule: summary.todaySchedule.map(serializeOccurrence),
                freeWindows: summary.freeWindows.map((w) => ({
                    start: w.start.toISO(),
                    end: w.end.toISO(),
                })),
            };
        },
        /** Backs GET /api/v1/calendar/events. Enforces the 180-day MVP range cap. */
        async getEventsInRange(userId, semesterId, rangeStartIso, rangeEndIso) {
            const semester = await semesterRepo.findByIdForUser(semesterId, userId);
            if (!semester)
                throw AppError.notFound("Semester not found.");
            const rangeStart = DateTime.fromISO(rangeStartIso, { zone: semester.timezone });
            const rangeEnd = DateTime.fromISO(rangeEndIso, { zone: semester.timezone });
            if (!rangeStart.isValid || !rangeEnd.isValid) {
                throw AppError.validation("start and end must be valid ISO 8601 datetimes.");
            }
            if (rangeEnd <= rangeStart) {
                throw AppError.validation("end must be after start.");
            }
            const spanDays = rangeEnd.diff(rangeStart, "days").days;
            if (spanDays > MAX_CALENDAR_RANGE_DAYS) {
                throw AppError.validation(`Calendar range cannot exceed ${MAX_CALENDAR_RANGE_DAYS} days in the MVP.`);
            }
            const raw = (await eventRepo.listInRange(userId, semesterId, rangeStart.toJSDate(), rangeEnd.toJSDate())).map(toRaw);
            const occurrences = expandCalendarEvents(raw, rangeStart, rangeEnd, semester.timezone);
            return {
                timezone: semester.timezone,
                rangeStart: rangeStart.toISO(),
                rangeEnd: rangeEnd.toISO(),
                events: occurrences.map(serializeOccurrence),
            };
        },
    };
}
//# sourceMappingURL=calendarService.js.map