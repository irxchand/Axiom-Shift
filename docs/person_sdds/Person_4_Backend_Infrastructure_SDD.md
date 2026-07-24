# Person 4 SDD
# Backend APIs, Database, Infrastructure, Workers, Auth, Notifications, Testing

Version: 1.0  
Project: Semester Operations Command Center  
Primary source docs:

- `docs/Semester_Operations_Command_Center_SDD.md`
- `docs/Phase_Wise_Execution_Plan.md`
- `interfaces/Interface.md`

## 1. Mission

Person 4 owns the backend and infrastructure that makes the command center real. Your job is to turn architecture into reliable APIs, database state, background jobs, auth, notifications, tests, and deployable services.

You own:

- backend API,
- database schema,
- migrations,
- repositories,
- auth,
- command/query handlers,
- Redis/BullMQ workers,
- document handoff service,
- transient staging cleanup,
- notification service,
- Docker Compose,
- CI,
- deployment scripts,
- backend and integration tests.

## 2. Core Rules For Your AI Coding Model

Give these rules to any AI model working under Person 4:

```text
You are implementing backend and infrastructure for Semester Operations Command Center.
Use Fastify, TypeScript, Zod, Prisma, PostgreSQL, Redis/BullMQ unless explicitly told otherwise.
All public endpoints are under /api/v1.
All write endpoints require Idempotency-Key.
All responses include requestId.
Use the shared error envelope.
Do not use /twin or /documents routes.
Use /state and /document-handoffs.
Uploaded files are transient staging only and must be deleted after handoff or expiry.
Do not parse/store lecture source text, chunks, or embeddings.
Do not import Playwright or browser internals into backend domain code.
Call BrowserFrameworkAdapter only from service/worker boundary.
```

## 3. Ownership Boundaries

### You Own

Folders:

- `backend/`
- `database/`
- `deployment/`
- `tests/api`
- `tests/integration`
- `workers/` if separate from backend

Shared:

- `shared/` schemas with Person 1.
- evaluation formulas with Person 2.
- API consumption with Person 3.
- browser worker integration with Person 1.

### You Must Not Own

- browser framework internals,
- frontend UI,
- prompt engineering,
- final API contract changes without Person 1.

## 4. Backend Architecture

Recommended stack:

- Node.js LTS,
- TypeScript,
- Fastify,
- Zod,
- Prisma,
- PostgreSQL,
- Redis,
- BullMQ,
- Server-Sent Events for job/chat progress.

Layering:

```text
routes -> validators -> command/query handlers -> domain services -> repositories -> database
workers -> services -> repositories -> database
```

No route should directly contain business logic beyond validation and dispatch.

## 5. Required Cross-Cutting Middleware

Every API request must have:

- request ID,
- auth context,
- user ownership check,
- structured logging,
- error envelope,
- idempotency handling for writes,
- validation using Zod.

Error envelope:

```json
{
  "requestId": "req_01",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "details": []
  }
}
```

## 6. Phase Responsibilities

## Phase 0: Setup and Contracts

### Your Tasks

- Create Docker Compose.
- Create backend app.
- Add `/health`.
- Add Prisma.
- Add Redis client.
- Add `.env.example`.
- Add CI skeleton.

### AI Prompt To Use

```text
Create the backend infrastructure skeleton for Semester Operations Command Center.
Use Fastify, TypeScript, Prisma, PostgreSQL, Redis, BullMQ, and Zod.
Add /health, requestId middleware, error envelope, env validation, and Docker Compose.
Do not implement product endpoints yet.
```

### Check The AI Output For

- backend starts,
- `/health` works,
- `.env.example` exists,
- Docker Compose starts Postgres and Redis,
- no product logic yet,
- no browser imports.

### Done Criteria

- `docker compose up` works,
- backend connects to DB and Redis,
- CI can run typecheck/build.

## Phase 1: Static Command Center Support

### Your Tasks

- Define shared seed schemas.
- Create sample seed data format.
- Help Person 3 keep seed shape compatible with future API.

### Done Criteria

- seed data maps cleanly to database schema.

## Phase 2: Backend State Backbone

This is your first major implementation phase.

### Your Tasks

Implement tables:

- users,
- student_profiles,
- semester_operations_states,
- semesters,
- subjects,
- calendar_events,
- source_workspaces,
- document_handoffs,
- audit_logs,
- outbox_events.

Implement APIs:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/state`
- `GET /api/v1/state/detail`
- `POST /api/v1/state/recompute`
- `POST /api/v1/semesters`
- `GET /api/v1/semesters`
- `POST /api/v1/semesters/{semesterId}/subjects`
- `POST /api/v1/timetable/import`
- `GET /api/v1/calendar/events`

### AI Prompt To Use

```text
Implement backend state backbone for Semester Operations Command Center.
Use /api/v1/state endpoints, not /twin.
Add Prisma models for users, profiles, semester_operations_states, semesters, subjects, calendar_events, source_workspaces, document_handoffs, audit_logs, and outbox_events.
Use Zod validation, requestId, error envelope, auth middleware, ownership checks, and idempotency for writes.
```

### Check The AI Output For

- no `/twin`,
- ownership checks exist,
- migrations created,
- idempotency on writes,
- tests for validation,
- state summary endpoint works.

### Done Criteria

- frontend can load real state from API.
- database survives restart.

## Phase 3: Timetable and Calendar Intelligence

### Your Tasks

- Implement recurrence expansion.
- Compute current class.
- Compute next class.
- Compute free windows.
- Provide calendar queries.

### Important Rules

- Timezone must be explicit.
- Frontend should not compute current/next class.
- Calendar date ranges max 180 days in MVP.

### AI Prompt To Use

```text
Implement timetable and calendar query services.
Given recurring timetable entries and one-off calendar events, compute currentClass, nextClass, todaySchedule, upcomingEvents, and freeWindows.
Use the user's timezone.
Expose results through /api/v1/state and /api/v1/calendar/events.
```

### Check The AI Output For

- timezone tests,
- edge cases before/after class,
- empty day handling,
- recurrence expansion not too broad,
- no frontend-only logic.

### Done Criteria

- API can answer “what is happening now?”

## Phase 4: Evaluation, Marks, GPA, and Risk

### Your Tasks

Implement tables:

- evaluation_plans,
- assessments,
- marks,
- goals,
- risk_scores,
- predictions.

Implement APIs:

- `POST /api/v1/subjects/{subjectId}/evaluation-plan`
- `GET /api/v1/subjects/{subjectId}/evaluation-plan`
- `POST /api/v1/assessments`
- `PATCH /api/v1/assessments/{assessmentId}/marks`
- `GET /api/v1/grades/sgpa-scenarios`
- `GET /api/v1/risk`
- `POST /api/v1/risk/recompute`

### Formula Rules

- numeric formulas are deterministic TypeScript,
- no LLM calls,
- no frontend formula dependency.

### AI Prompt To Use

```text
Implement evaluation, marks, SGPA scenario, and risk APIs.
Use deterministic formulas from Person 2.
Add unit tests for marks lost, required future average, SGPA scenario, and risk severity.
Do not use an LLM.
Return risk drivers and recommended actions in API responses.
```

### Check The AI Output For

- pure formula functions,
- unit tests,
- transaction around marks update and risk recompute event,
- risk explanations include drivers,
- invalid marks rejected.

### Done Criteria

- marks update triggers risk recompute.
- frontend can display grade/risk data.

## Phase 5: Browser Framework Adapter Integration

### Your Tasks

- Implement TypeScript `BrowserFrameworkAdapter`.
- Call Python CLI from worker/service boundary.
- Capture stdout JSON.
- Capture stderr logs.
- Convert exit codes to typed errors.

### AI Prompt To Use

```text
Implement BrowserFrameworkAdapter.ts.
It should call the Python browser_framework_cli.py with JSON input, parse JSON stdout, capture stderr logs, enforce timeout, and return typed results.
Do not import Playwright.
Do not expose cookies, selectors, or profile paths in API responses.
```

### Check The AI Output For

- no Playwright imports,
- timeout handling,
- stdout JSON parsing,
- stderr not exposed to user directly,
- typed errors,
- worker-safe execution.

### Done Criteria

- backend worker can call `sendChatMessage`.
- adapter mock works in tests.

## Phase 6: Source Workspace Handoff

This is your highest data-safety phase.

### Your Tasks

Implement:

- `DocumentHandoffService`,
- transient file staging,
- cleanup job,
- handoff retry,
- source workspace status persistence.

APIs:

- `POST /api/v1/document-handoffs`
- `GET /api/v1/document-handoffs`
- `GET /api/v1/document-handoffs/{id}`
- `DELETE /api/v1/document-handoffs/{id}`
- `POST /api/v1/document-handoffs/{id}/retry`
- `POST /api/v1/source-workspaces`
- `POST /api/v1/source-workspaces/{id}/sources`
- `GET /api/v1/source-workspaces/{id}/status`

### AI Prompt To Use

```text
Implement DocumentHandoffService.
Files are transient only: upload to staging, enqueue handoff job, call SourceNotebookService/BrowserFrameworkAdapter, then delete staged file after success or expiry.
Store metadata/status only.
Do not parse document text.
Do not store document chunks or embeddings.
Add cleanup worker for expired staged files.
```

### Check The AI Output For

- files deleted after success,
- expiry cleanup exists,
- raw file path nulled after cleanup,
- no parser/chunker,
- retry handles missing staged file,
- max file size enforced.

### Done Criteria

- successful handoff leaves no local raw file.
- failed handoff has visible status and retry path.

## Phase 7: Connected Chat Agents

### Your Tasks

- Implement `ConnectedChatService`.
- Implement `AgentRunner`.
- Store `agent_runs`.
- Validate JSON output.
- Retry once with repair prompt.
- Expose chat APIs and SSE progress.

### AI Prompt To Use

```text
Implement ConnectedChatService and AgentRunner.
Load agent config from configs/agents.registry.json.
Send agentTask envelope through BrowserFrameworkAdapter.
Validate response against Zod schema.
Retry once with repair prompt if invalid.
Store agent_runs metadata.
Expose chat message endpoint and SSE progress.
Agents must not mutate DB directly.
```

### Check The AI Output For

- registry-driven,
- no hardcoded chat URLs,
- schema validation,
- repair retry,
- SSE progress,
- proposed commands are returned to command handlers.

### Done Criteria

- one Planning Agent run completes and validates.

## Phase 8: Study Planning and Recommendations

### Your Tasks

- Persist study plans.
- Persist tasks.
- Accept/edit plan APIs.
- Create calendar events after confirmation.

### AI Prompt To Use

```text
Implement planning APIs.
Generate plan via deterministic fallback and optional Planning Agent result.
Persist plan and tasks.
Only create calendar events after user accepts the plan.
Return reasons and evidence refs for each task.
```

### Check The AI Output For

- no autonomous calendar writes,
- task status transitions valid,
- plan reasons persisted,
- evidence refs stored.

### Done Criteria

- accepted plan appears in calendar.

## Phase 9: Notifications and Daily Briefing

### Your Tasks

- notifications table,
- in-app notification API,
- scheduler worker,
- dedupe keys,
- risk/deadline triggers.

### AI Prompt To Use

```text
Implement in-app notifications and daily briefing.
Create notifications for upcoming assessments, high risk changes, source workspace handoff failures, and accepted plan tasks.
Use dedupe keys.
Expose list, dismiss, snooze, and test endpoints.
```

### Check The AI Output For

- dedupe works,
- no spam,
- timezone aware,
- dismiss/snooze persisted.

## Phase 10: Demo Hardening and Deployment

### Your Tasks

- Docker Compose finalization.
- seed reset script.
- smoke tests.
- deployment README.
- CI pipeline.
- demo environment variables.

### Smoke Test Path

1. register/login,
2. create semester,
3. import timetable,
4. view state,
5. record marks,
6. recompute risk,
7. create source handoff,
8. call browser adapter mock,
9. run one agent,
10. generate plan.

### Done Criteria

- smoke test passes.
- Docker setup documented.
- no secrets in repo.

## 7. Backend Evaluation Checklist

Use this checklist for AI-generated backend work.

### API

- correct route names,
- `/state`, not `/twin`,
- `/document-handoffs`, not `/documents`,
- request validation,
- response DTOs,
- error envelope,
- auth and ownership checks.

### Persistence

- migration exists,
- indexes exist for common queries,
- foreign keys correct,
- no raw lecture content stored,
- transactions where needed.

### Jobs

- retries bounded,
- idempotency respected,
- status persisted,
- errors typed.

### Security

- no cookies in DB,
- no profile paths in responses,
- no secrets in logs,
- file cleanup enforced.

### Testing

- unit tests for formulas,
- API tests for validation/auth,
- integration tests for DB flows,
- worker tests with mocked browser adapter.

## 8. What To Reject Immediately

Reject AI output that:

- creates `/twin` routes,
- creates `/documents` as permanent storage,
- parses lecture files into chunks,
- stores embeddings for uploaded lecture content,
- imports Playwright in backend domain,
- skips ownership checks,
- skips idempotency,
- hides errors,
- commits `.env` or cookies,
- computes grades in SQL strings without tests.

## 9. Success Definition

Person 4 succeeds when:

- APIs are reliable,
- DB schema supports all MVP flows,
- workers process async jobs,
- transient files are cleaned up,
- browser adapter is callable from backend,
- agent runs are persisted,
- notifications work,
- demo can run from Docker/README.

