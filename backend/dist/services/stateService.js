import { createSemesterRepository } from "../repositories/semesterRepository.js";
import { createStateRepository } from "../repositories/stateRepository.js";
import { createCalendarService } from "./calendarService.js";
export function createStateService(prisma) {
    const semesterRepo = createSemesterRepository(prisma);
    const stateRepo = createStateRepository(prisma);
    const calendarService = createCalendarService(prisma);
    async function compile(userId) {
        // MVP: "active" semester = most recently started one for this user.
        // Multi-semester selection is a future-phase concern.
        const semesters = await semesterRepo.listForUser(userId);
        const activeSemester = semesters[0] ?? null;
        if (!activeSemester) {
            return {
                activeSemesterId: null,
                summary: { hasActiveSemester: false },
            };
        }
        const daySummary = await calendarService.getDaySummaryForSemester(userId, activeSemester.id);
        return {
            activeSemesterId: activeSemester.id,
            summary: {
                hasActiveSemester: true,
                semesterName: activeSemester.name,
                timezone: daySummary.timezone,
                asOf: daySummary.asOf,
                currentClass: daySummary.currentClass,
                nextClass: daySummary.nextClass,
                todaySchedule: daySummary.todaySchedule,
                freeWindows: daySummary.freeWindows,
            },
        };
    }
    return {
        /** GET /api/v1/state — returns the cached compiled state, computing it on first access. */
        async getState(userId) {
            const existing = await stateRepo.findForUser(userId);
            if (existing)
                return existing;
            return this.recompute(userId);
        },
        /** GET /api/v1/state/detail — reserved for richer detail in later phases. */
        async getStateDetail(userId) {
            return this.getState(userId);
        },
        /** POST /api/v1/state/recompute — forces a fresh compile and persists it. */
        async recompute(userId) {
            const compiled = await compile(userId);
            return stateRepo.upsert(userId, compiled.activeSemesterId, compiled.summary);
        },
    };
}
//# sourceMappingURL=stateService.js.map