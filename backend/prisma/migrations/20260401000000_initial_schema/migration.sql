
CREATE TYPE "Weekday" AS ENUM ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY');
CREATE TYPE "SessionType" AS ENUM ('LECTURE','LAB','TUTORIAL','OTHER');
CREATE TYPE "CalendarEventKind" AS ENUM ('RECURRING_CLASS','ONE_OFF');
CREATE TYPE "RiskSeverity" AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL');

CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "student_profiles" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "displayName" TEXT,
  "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "semester_operations_states" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "activeSemesterId" TEXT,
  "summary" JSONB NOT NULL,
  "computedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE "semesters" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX "semesters_userId_idx" ON "semesters"("userId");

CREATE TABLE "subjects" (
  "id" TEXT PRIMARY KEY,
  "semesterId" TEXT NOT NULL REFERENCES "semesters"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "credits" DOUBLE PRECISION,
  "color" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE("semesterId", "code")
);
CREATE INDEX "subjects_userId_idx" ON "subjects"("userId");

CREATE TABLE "calendar_events" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "semesterId" TEXT NOT NULL REFERENCES "semesters"("id") ON DELETE CASCADE,
  "subjectId" TEXT REFERENCES "subjects"("id") ON DELETE SET NULL,
  "kind" "CalendarEventKind" NOT NULL,
  "title" TEXT NOT NULL,
  "sessionType" "SessionType" NOT NULL DEFAULT 'OTHER',
  "location" TEXT,
  "dayOfWeek" "Weekday",
  "startTime" TEXT,
  "endTime" TEXT,
  "startAt" TIMESTAMP,
  "endAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX "calendar_events_userId_idx" ON "calendar_events"("userId");
CREATE INDEX "calendar_events_semesterId_idx" ON "calendar_events"("semesterId");
CREATE INDEX "calendar_events_subjectId_idx" ON "calendar_events"("subjectId");

CREATE TABLE "source_workspaces" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL REFERENCES "subjects"("id") ON DELETE CASCADE,
  "status" TEXT NOT NULL DEFAULT 'NOT_CONNECTED',
  "lastSyncedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX "source_workspaces_userId_idx" ON "source_workspaces"("userId");
CREATE INDEX "source_workspaces_subjectId_idx" ON "source_workspaces"("subjectId");

CREATE TABLE "document_handoffs" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "workspaceId" TEXT REFERENCES "source_workspaces"("id") ON DELETE SET NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "filename" TEXT,
  "fileSizeBytes" INTEGER,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX "document_handoffs_userId_idx" ON "document_handoffs"("userId");
CREATE INDEX "document_handoffs_workspaceId_idx" ON "document_handoffs"("workspaceId");

CREATE TABLE "audit_logs" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
  "action" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

CREATE TABLE "outbox_events" (
  "id" TEXT PRIMARY KEY,
  "eventType" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "processedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX "outbox_events_processedAt_idx" ON "outbox_events"("processedAt");

CREATE TABLE "idempotency_keys" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "route" TEXT NOT NULL,
  "statusCode" INTEGER NOT NULL,
  "responseBody" JSONB NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE("userId", "key", "route")
);

CREATE TABLE "evaluation_plans" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "subjectId" TEXT UNIQUE NOT NULL REFERENCES "subjects"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX "evaluation_plans_userId_idx" ON "evaluation_plans"("userId");

CREATE TABLE "evaluation_components" (
  "id" TEXT PRIMARY KEY,
  "evaluationPlanId" TEXT NOT NULL REFERENCES "evaluation_plans"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "weightPercent" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX "evaluation_components_evaluationPlanId_idx" ON "evaluation_components"("evaluationPlanId");

CREATE TABLE "assessments" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL REFERENCES "subjects"("id") ON DELETE CASCADE,
  "evaluationComponentId" TEXT NOT NULL REFERENCES "evaluation_components"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "dueDate" TIMESTAMP,
  "maxMarks" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX "assessments_userId_idx" ON "assessments"("userId");
CREATE INDEX "assessments_subjectId_idx" ON "assessments"("subjectId");
CREATE INDEX "assessments_evaluationComponentId_idx" ON "assessments"("evaluationComponentId");

CREATE TABLE "marks" (
  "id" TEXT PRIMARY KEY,
  "assessmentId" TEXT UNIQUE NOT NULL REFERENCES "assessments"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL,
  "obtainedMarks" DOUBLE PRECISION,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX "marks_userId_idx" ON "marks"("userId");

CREATE TABLE "goals" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "targetPercent" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX "goals_userId_idx" ON "goals"("userId");
CREATE INDEX "goals_subjectId_idx" ON "goals"("subjectId");

CREATE TABLE "risk_scores" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "subjectId" TEXT UNIQUE NOT NULL REFERENCES "subjects"("id") ON DELETE CASCADE,
  "severity" "RiskSeverity" NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "drivers" JSONB NOT NULL,
  "recommended" JSONB NOT NULL,
  "computedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX "risk_scores_userId_idx" ON "risk_scores"("userId");

CREATE TABLE "predictions" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "requiredAvg" DOUBLE PRECISION NOT NULL,
  "scenario" JSONB NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX "predictions_userId_idx" ON "predictions"("userId");
CREATE INDEX "predictions_subjectId_idx" ON "predictions"("subjectId");
