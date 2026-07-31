import { DateTime } from "luxon";
const WEEKDAY_TO_LUXON = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 7,
};
/**
 * Expands recurring + one-off events into concrete occurrences within
 * [rangeStart, rangeEnd), in the given IANA timezone. Timezone is always
 * explicit — callers must pass the semester's timezone, never rely on
 * server-local time.
 *
 * `holidayDates` are ISO date strings ("YYYY-MM-DD") in the same timezone;
 * a RECURRING_CLASS occurrence is skipped entirely on those dates (a
 * one-off ONE_OFF event is never auto-skipped — if someone explicitly
 * scheduled something on a holiday, that's a deliberate choice, not noise).
 */
export function expandCalendarEvents(events, rangeStart, rangeEnd, timezone, holidayDates = []) {
    const holidaySet = new Set(holidayDates);
    const occurrences = [];
    for (const event of events) {
        if (event.kind === "ONE_OFF") {
            if (!event.startAt || !event.endAt)
                continue;
            const start = DateTime.fromJSDate(event.startAt, { zone: timezone });
            const end = DateTime.fromJSDate(event.endAt, { zone: timezone });
            if (end <= rangeStart || start >= rangeEnd)
                continue;
            occurrences.push(toOccurrence(event, start, end));
            continue;
        }
        if (!event.dayOfWeek || !event.startTime || !event.endTime)
            continue;
        const targetWeekday = WEEKDAY_TO_LUXON[event.dayOfWeek];
        let cursor = rangeStart.startOf("day");
        const end = rangeEnd.startOf("day");
        while (cursor <= end) {
            if (cursor.weekday === targetWeekday && !holidaySet.has(cursor.toISODate() ?? "")) {
                const [startHour, startMin] = event.startTime.split(":").map(Number);
                const [endHour, endMin] = event.endTime.split(":").map(Number);
                const start = cursor.set({ hour: startHour, minute: startMin, second: 0, millisecond: 0 });
                const occEnd = cursor.set({ hour: endHour, minute: endMin, second: 0, millisecond: 0 });
                if (occEnd > rangeStart && start < rangeEnd) {
                    occurrences.push(toOccurrence(event, start, occEnd));
                }
            }
            cursor = cursor.plus({ days: 1 });
        }
    }
    return occurrences.sort((a, b) => a.start.toMillis() - b.start.toMillis());
}
function toOccurrence(event, start, end) {
    return {
        eventId: event.id,
        subjectId: event.subjectId,
        title: event.title,
        location: event.location,
        sessionType: event.sessionType,
        start,
        end,
    };
}
/**
 * Computes currentClass / nextClass / todaySchedule / freeWindows as of `now`.
 * `now` must already be in the target timezone (semester tz).
 */
export function computeDaySummary(events, now, timezone, dayWindow = { startHour: 8, endHour: 20 }, holidayDates = []) {
    const dayStart = now.startOf("day");
    const dayEnd = now.endOf("day");
    // Look a week ahead for "next class" so a Friday evening query still finds
    // Monday morning's first class instead of returning null.
    const lookaheadEnd = now.plus({ days: 7 });
    const todayOccurrences = expandCalendarEvents(events, dayStart, dayEnd, timezone, holidayDates);
    const lookaheadOccurrences = expandCalendarEvents(events, dayStart, lookaheadEnd, timezone, holidayDates);
    const currentClass = todayOccurrences.find((occ) => occ.start <= now && now < occ.end) ?? null;
    const nextClass = lookaheadOccurrences.find((occ) => occ.start > now) ?? null;
    const freeWindows = computeFreeWindows(todayOccurrences, now, dayWindow);
    return {
        currentClass,
        nextClass,
        todaySchedule: todayOccurrences,
        freeWindows,
    };
}
/**
 * Gaps in today's schedule within [dayWindow.startHour, dayWindow.endHour),
 * clipped to not start in the past relative to `now`.
 */
function computeFreeWindows(todayOccurrences, now, dayWindow) {
    const windowStart = now.set({ hour: dayWindow.startHour, minute: 0, second: 0, millisecond: 0 });
    const windowEnd = now.set({ hour: dayWindow.endHour, minute: 0, second: 0, millisecond: 0 });
    const busy = todayOccurrences
        .filter((occ) => occ.end > windowStart && occ.start < windowEnd)
        .sort((a, b) => a.start.toMillis() - b.start.toMillis());
    const free = [];
    let cursor = windowStart > now ? windowStart : now;
    for (const occ of busy) {
        if (occ.start > cursor) {
            free.push({ start: cursor, end: occ.start });
        }
        if (occ.end > cursor) {
            cursor = occ.end;
        }
    }
    if (cursor < windowEnd) {
        free.push({ start: cursor, end: windowEnd });
    }
    return free.filter((w) => w.end > w.start);
}
/** Hard MVP limit per the SDD: "Calendar date ranges max 180 days in MVP." */
export const MAX_CALENDAR_RANGE_DAYS = 180;
/** Whether a given date (in the semester's timezone) is a listed holiday. */
export function isHoliday(date, holidayDates) {
    const iso = date.toISODate();
    return iso !== null && holidayDates.includes(iso);
}
/**
 * Detects pairs of occurrences whose time ranges overlap. Used to validate
 * timetable imports (two recurring classes claiming the same time slot is
 * almost always a data-entry mistake, not intentional).
 */
export function detectOverlaps(occurrences) {
    const sorted = [...occurrences].sort((a, b) => a.start.toMillis() - b.start.toMillis());
    const overlaps = [];
    for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
            const a = sorted[i];
            const b = sorted[j];
            if (b.start >= a.end)
                break; // sorted by start — no further j can overlap a
            if (b.start < a.end && a.start < b.end) {
                overlaps.push({ a, b });
            }
        }
    }
    return overlaps;
}
//# sourceMappingURL=calendarLogic.js.map