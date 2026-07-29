import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import {
  computeDaySummary,
  expandCalendarEvents,
  detectOverlaps,
  isHoliday,
  type RawCalendarEvent,
} from "../../src/services/calendarLogic.js";

const TZ = "Asia/Kolkata";

const mondayClass: RawCalendarEvent = {
  id: "evt_1",
  subjectId: "sub_os",
  title: "CS301 LECTURE",
  kind: "RECURRING_CLASS",
  location: "Room 204",
  sessionType: "LECTURE",
  dayOfWeek: "MONDAY",
  startTime: "09:00",
  endTime: "10:00",
  startAt: null,
  endAt: null,
};

describe("expandCalendarEvents", () => {
  it("expands a weekly recurring class into one occurrence per matching weekday in range", () => {
    const rangeStart = DateTime.fromISO("2026-02-02T00:00:00", { zone: TZ }); // a Monday
    const rangeEnd = rangeStart.plus({ days: 14 });

    const occurrences = expandCalendarEvents([mondayClass], rangeStart, rangeEnd, TZ);

    expect(occurrences).toHaveLength(2);
    expect(occurrences[0].start.weekdayLong).toBe("Monday");
  });

  it("returns nothing for an empty event list", () => {
    const rangeStart = DateTime.fromISO("2026-02-02T00:00:00", { zone: TZ });
    const rangeEnd = rangeStart.plus({ days: 7 });
    expect(expandCalendarEvents([], rangeStart, rangeEnd, TZ)).toHaveLength(0);
  });
});

describe("computeDaySummary — before/during/after class", () => {
  const monday9am = DateTime.fromISO("2026-02-02T09:00:00", { zone: TZ });

  it("reports currentClass when now is inside the class window, and nextClass points to next week's occurrence", () => {
    const now = monday9am.plus({ minutes: 30 }); // 09:30, class runs 09:00-10:00
    const summary = computeDaySummary([mondayClass], now, TZ);
    expect(summary.currentClass?.eventId).toBe("evt_1");
    expect(summary.nextClass?.eventId).toBe("evt_1");
    expect(summary.nextClass?.start.toISODate()).toBe(monday9am.plus({ weeks: 1 }).toISODate());
  });

  it("reports nextClass, not currentClass, just before the class starts", () => {
    const now = monday9am.minus({ minutes: 5 }); // 08:55
    const summary = computeDaySummary([mondayClass], now, TZ);
    expect(summary.currentClass).toBeNull();
    expect(summary.nextClass?.eventId).toBe("evt_1");
  });

  it("reports neither currentClass nor a same-day nextClass right after the class ends", () => {
    const now = monday9am.plus({ hours: 1, minutes: 5 }); // 10:05, class ended at 10:00
    const summary = computeDaySummary([mondayClass], now, TZ);
    expect(summary.currentClass).toBeNull();
    expect(summary.nextClass?.start.toISODate()).not.toBe(now.toISODate());
  });

  it("handles an empty day with no classes at all", () => {
    const tuesday = monday9am.plus({ days: 1 });
    const summary = computeDaySummary([mondayClass], tuesday, TZ);
    expect(summary.todaySchedule).toHaveLength(0);
    expect(summary.currentClass).toBeNull();
  });

  it("computes free windows around a single class inside the day window", () => {
    const now = monday9am.minus({ hours: 1 }); // 08:00
    const summary = computeDaySummary([mondayClass], now, TZ, { startHour: 8, endHour: 20 });
    expect(summary.freeWindows.length).toBeGreaterThanOrEqual(2);
    expect(summary.freeWindows[0].end.toISO()).toBe(monday9am.toISO());
  });

  it("respects an explicit timezone rather than server-local time", () => {
    const utcEquivalent = monday9am.setZone("utc");
    const summaryIST = computeDaySummary([mondayClass], monday9am, TZ);
    const summaryFromUtcInput = computeDaySummary([mondayClass], utcEquivalent.setZone(TZ), TZ);
    expect(summaryIST.currentClass?.eventId).toBe(summaryFromUtcInput.currentClass?.eventId);
  });
});

describe("isHoliday", () => {
  it("matches a date present in the holiday list", () => {
    const date = DateTime.fromISO("2026-01-26", { zone: TZ });
    expect(isHoliday(date, ["2026-01-26"])).toBe(true);
  });

  it("does not match a date absent from the holiday list", () => {
    const date = DateTime.fromISO("2026-01-27", { zone: TZ });
    expect(isHoliday(date, ["2026-01-26"])).toBe(false);
  });
});

describe("holiday handling in recurrence expansion", () => {
  it("skips a recurring class occurrence that falls on a holiday", () => {
    const rangeStart = DateTime.fromISO("2026-02-02T00:00:00", { zone: TZ }); // Monday
    const rangeEnd = rangeStart.plus({ days: 14 }); // covers two Mondays

    const secondMonday = rangeStart.plus({ weeks: 1 }).toISODate() as string;

    const occurrences = expandCalendarEvents([mondayClass], rangeStart, rangeEnd, TZ, [
      secondMonday,
    ]);

    // Only the first Monday's occurrence should remain.
    expect(occurrences).toHaveLength(1);
    expect(occurrences[0].start.toISODate()).toBe(rangeStart.toISODate());
  });

  it("does NOT skip a ONE_OFF event on a holiday — explicit scheduling is intentional", () => {
    const holidayDate = "2026-01-26";
    const oneOffOnHoliday: RawCalendarEvent = {
      id: "evt_special",
      subjectId: null,
      title: "Special makeup session",
      kind: "ONE_OFF",
      location: null,
      sessionType: "OTHER",
      dayOfWeek: null,
      startTime: null,
      endTime: null,
      startAt: DateTime.fromISO(`${holidayDate}T10:00:00`, { zone: TZ }).toJSDate(),
      endAt: DateTime.fromISO(`${holidayDate}T11:00:00`, { zone: TZ }).toJSDate(),
    };

    const rangeStart = DateTime.fromISO(`${holidayDate}T00:00:00`, { zone: TZ });
    const rangeEnd = rangeStart.endOf("day");

    const occurrences = expandCalendarEvents([oneOffOnHoliday], rangeStart, rangeEnd, TZ, [
      holidayDate,
    ]);
    expect(occurrences).toHaveLength(1);
  });

  it("an entirely holiday-covered day reports no classes and no risk of a false currentClass", () => {
    const monday9am = DateTime.fromISO("2026-02-02T09:00:00", { zone: TZ });
    const holidayMonday = monday9am.toISODate() as string;
    const summary = computeDaySummary(
      [mondayClass],
      monday9am.plus({ minutes: 30 }),
      TZ,
      { startHour: 8, endHour: 20 },
      [holidayMonday],
    );
    expect(summary.currentClass).toBeNull();
    expect(summary.todaySchedule).toHaveLength(0);
  });
});

describe("detectOverlaps", () => {
  const TZ2 = "Asia/Kolkata";

  it("flags two occurrences whose time ranges overlap", () => {
    const base = DateTime.fromISO("2026-02-02T09:00:00", { zone: TZ2 });
    const occA = {
      eventId: "a",
      subjectId: "s1",
      title: "A",
      location: null,
      sessionType: "LECTURE",
      start: base,
      end: base.plus({ hours: 1 }), // 09:00-10:00
    };
    const occB = {
      eventId: "b",
      subjectId: "s2",
      title: "B",
      location: null,
      sessionType: "LECTURE",
      start: base.plus({ minutes: 30 }),
      end: base.plus({ hours: 1, minutes: 30 }), // 09:30-10:30 — overlaps A
    };

    const overlaps = detectOverlaps([occA, occB]);
    expect(overlaps).toHaveLength(1);
    expect([overlaps[0].a.eventId, overlaps[0].b.eventId].sort()).toEqual(["a", "b"]);
  });

  it("does not flag back-to-back (non-overlapping, touching) occurrences", () => {
    const base = DateTime.fromISO("2026-02-02T09:00:00", { zone: TZ2 });
    const occA = {
      eventId: "a",
      subjectId: "s1",
      title: "A",
      location: null,
      sessionType: "LECTURE",
      start: base,
      end: base.plus({ hours: 1 }), // ends 10:00
    };
    const occB = {
      eventId: "b",
      subjectId: "s2",
      title: "B",
      location: null,
      sessionType: "LECTURE",
      start: base.plus({ hours: 1 }), // starts exactly at 10:00
      end: base.plus({ hours: 2 }),
    };

    expect(detectOverlaps([occA, occB])).toHaveLength(0);
  });

  it("returns no overlaps for a single occurrence or an empty list", () => {
    expect(detectOverlaps([])).toHaveLength(0);
  });
});
