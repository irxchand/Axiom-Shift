import { createSemesterRepository, createSubjectRepository, } from "../repositories/semesterRepository.js";
import { createCalendarEventRepository } from "../repositories/calendarEventRepository.js";
import { AppError } from "../lib/errors.js";
export function createTimetableService(prisma) {
    const semesterRepo = createSemesterRepository(prisma);
    const subjectRepo = createSubjectRepository(prisma);
    const eventRepo = createCalendarEventRepository(prisma);
    return {
        async importEntries(userId, semesterId, entries) {
            const semester = await semesterRepo.findByIdForUser(semesterId, userId);
            if (!semester)
                throw AppError.notFound("Semester not found.");
            if (entries.length === 0) {
                throw AppError.validation("At least one timetable entry is required.");
            }
            // Reject overlapping entries on the same day within this import batch —
            // almost always a data-entry mistake (e.g. wrong end time).
            const byDay = new Map();
            for (const entry of entries) {
                const list = byDay.get(entry.dayOfWeek) ?? [];
                list.push(entry);
                byDay.set(entry.dayOfWeek, list);
            }
            for (const [day, dayEntries] of byDay) {
                const sorted = [...dayEntries].sort((a, b) => a.startTime.localeCompare(b.startTime));
                for (let i = 0; i < sorted.length - 1; i++) {
                    if (sorted[i].endTime > sorted[i + 1].startTime) {
                        throw AppError.validation(`Overlapping timetable entries on ${day}: "${sorted[i].subjectCode}" ` +
                            `(${sorted[i].startTime}-${sorted[i].endTime}) overlaps ` +
                            `"${sorted[i + 1].subjectCode}" (${sorted[i + 1].startTime}-${sorted[i + 1].endTime}).`);
                    }
                }
            }
            const rows = [];
            for (const entry of entries) {
                const subject = await subjectRepo.findByCode(semesterId, entry.subjectCode);
                if (!subject) {
                    throw AppError.validation(`Unknown subject code "${entry.subjectCode}" in this semester.`, [{ subjectCode: entry.subjectCode }]);
                }
                if (entry.endTime <= entry.startTime) {
                    throw AppError.validation(`Entry for "${entry.subjectCode}" has endTime <= startTime.`);
                }
                rows.push({
                    userId,
                    semesterId,
                    subjectId: subject.id,
                    title: `${subject.code} ${entry.sessionType ?? "LECTURE"}`.trim(),
                    dayOfWeek: entry.dayOfWeek,
                    startTime: entry.startTime,
                    endTime: entry.endTime,
                    location: entry.location,
                    sessionType: entry.sessionType ?? "LECTURE",
                });
            }
            const result = await eventRepo.createManyRecurringClasses(rows);
            return { imported: result.count };
        },
    };
}
//# sourceMappingURL=timetableService.js.map