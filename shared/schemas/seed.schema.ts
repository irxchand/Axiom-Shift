// Shared seed data contract for Phase 1 (Static Command Center).
//
// Person 3 consumes this shape as `frontend/src/seed/semester.seed.ts`.
// Person 4 keeps this shape 1:1 compatible with the Prisma models introduced
// in Phase 2 (semesters, subjects, calendar_events/timetable, evaluation_plans,
// assessments, marks, source_workspaces) so that swapping the seed file for a
// real `GET /api/v1/state` response later requires no frontend reshaping.
//
// Naming rule: use `SemesterOperationsState`, never `twin`.

import { z } from "zod";

export const WeekdaySchema = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

// HH:MM, 24-hour, no timezone offset here — timezone lives on the semester/user.
const TimeOfDaySchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Expected HH:MM 24-hour time");

export const SubjectSeedSchema = z.object({
  id: z.string(),
  code: z.string().min(1),
  name: z.string().min(1),
  credits: z.number().positive().optional(),
  color: z.string().optional(), // for UI subject cards
});

export const TimetableEntrySeedSchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  dayOfWeek: WeekdaySchema,
  startTime: TimeOfDaySchema,
  endTime: TimeOfDaySchema,
  location: z.string().optional(),
  sessionType: z.enum(["LECTURE", "LAB", "TUTORIAL", "OTHER"]).default("LECTURE"),
});

export const EvaluationComponentSchema = z.object({
  id: z.string(),
  name: z.string().min(1), // e.g. "Midterm", "Assignment 2"
  weightPercent: z.number().min(0).max(100),
});

export const EvaluationPlanSeedSchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  components: z.array(EvaluationComponentSchema),
});

export const AssessmentSeedSchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  evaluationComponentId: z.string(),
  title: z.string().min(1),
  dueDate: z.string().datetime().optional(),
  maxMarks: z.number().positive(),
});

export const MarkSeedSchema = z.object({
  id: z.string(),
  assessmentId: z.string(),
  obtainedMarks: z.number().min(0).nullable(), // null = not yet graded
});

export const SourceWorkspaceSeedSchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  status: z.enum(["NOT_CONNECTED", "PENDING", "READY", "FAILED"]).default("NOT_CONNECTED"),
  lastSyncedAt: z.string().datetime().optional(),
});

export const SemesterSeedSchema = z.object({
  id: z.string(),
  name: z.string().min(1), // e.g. "Semester 4"
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timezone: z.string().default("Asia/Kolkata"),
});

// Top-level seed document. This is the shape both
// `frontend/src/seed/semester.seed.ts` and, later, `GET /api/v1/state`
// must agree on.
export const SemesterSeedDataSchema = z.object({
  semester: SemesterSeedSchema,
  subjects: z.array(SubjectSeedSchema),
  timetable: z.array(TimetableEntrySeedSchema),
  evaluationPlans: z.array(EvaluationPlanSeedSchema),
  assessments: z.array(AssessmentSeedSchema),
  marks: z.array(MarkSeedSchema),
  sourceWorkspaces: z.array(SourceWorkspaceSeedSchema),
});

export type Weekday = z.infer<typeof WeekdaySchema>;
export type SubjectSeed = z.infer<typeof SubjectSeedSchema>;
export type TimetableEntrySeed = z.infer<typeof TimetableEntrySeedSchema>;
export type EvaluationPlanSeed = z.infer<typeof EvaluationPlanSeedSchema>;
export type AssessmentSeed = z.infer<typeof AssessmentSeedSchema>;
export type MarkSeed = z.infer<typeof MarkSeedSchema>;
export type SourceWorkspaceSeed = z.infer<typeof SourceWorkspaceSeedSchema>;
export type SemesterSeed = z.infer<typeof SemesterSeedSchema>;
export type SemesterSeedData = z.infer<typeof SemesterSeedDataSchema>;
