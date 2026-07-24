# Person 3 SDD
# Frontend, Command Center UI, Calendar, Visualization, Chat

Version: 1.0  
Project: Semester Operations Command Center  
Primary source docs:

- `docs/Semester_Operations_Command_Center_SDD.md`
- `docs/Phase_Wise_Execution_Plan.md`
- `interfaces/Interface.md`

## 1. Mission

Person 3 owns the user experience. Your job is to make the product feel like a real semester command center from the first screen.

You own:

- frontend app,
- dashboard layout,
- current/next class UI,
- timetable/calendar UI,
- subject views,
- grades/risk views,
- source workspace status UI,
- onboarding screens,
- chat UI,
- visualization,
- responsive design,
- frontend smoke tests.

The frontend must make the system useful early, even before AI and browser automation are fully connected.

## 2. Core Rules For Your AI Coding Model

Give these rules to any AI model working under Person 3:

```text
You are building the frontend for Semester Operations Command Center.
Build the usable command center, not a landing page.
Do not put business logic in the frontend.
Do not compute SGPA, risk, marks needed, or current/next class if backend provides it.
Do not call BrowserFrameworkAdapter directly.
Do not call agents directly.
Use backend APIs and shared DTOs.
Uploaded files are transient handoff material; UI should show status, not local content.
Use a dark mission-control UI that is dense, readable, and operational.
Do not overuse marketing copy or provider names.
```

## 3. Ownership Boundaries

### You Own

Folders:

- `frontend/`
- `frontend/src/components`
- `frontend/src/routes`
- `frontend/src/api`
- `frontend/src/styles`
- `frontend/src/features`
- `tests/ui`

Shared:

- `shared/` DTO usage with all.
- UI labels and status copy with Person 1.
- chart/visualization data needs with Person 2.

### You Must Not Own

- backend formulas,
- database schema,
- browser framework,
- agent prompts,
- file handoff implementation.

## 4. Frontend Architecture

Recommended stack:

- React,
- TypeScript,
- Vite,
- TanStack Query,
- Zustand only for local UI state,
- Tailwind CSS or CSS modules,
- React Flow or Cytoscape.js for concept graph if implemented,
- Recharts for simple charts.

### Route Structure

```text
/
  command-center
  onboarding
  subjects
  subjects/:subjectId
  calendar
  grades
  planning
  chat
  notifications
  settings
```

### Feature Folder Structure

```text
frontend/src/
  api/
  app/
  components/
  features/
    command-center/
    onboarding/
    timetable/
    subjects/
    grades/
    planning/
    chat/
    notifications/
    settings/
  styles/
  test/
```

## 5. Phase Responsibilities

## Phase 0: Setup and Contracts

### Your Tasks

- Create Vite React TypeScript app.
- Add routing.
- Add base layout.
- Add API client placeholder.
- Add visual design tokens.

### AI Prompt To Use

```text
Create the frontend shell for Semester Operations Command Center using React, TypeScript, and Vite.
Build a command-center layout with left navigation, top command bar, main content area, and optional right context panel.
Do not create a marketing landing page.
Use placeholder data only.
Do not implement business calculations.
```

### Check The AI Output For

- first screen is an app, not a hero page,
- no backend logic in UI,
- clean folder structure,
- responsive layout,
- no hardcoded provider-specific branding.

### Done Criteria

- app runs,
- routes work,
- layout works on desktop and mobile width.

## Phase 1: Static Command Center

### Your Tasks

Build the first useful screen using seed data.

Components:

- `CommandCenterPage`,
- `CurrentClassCard`,
- `NextClassCard`,
- `TodaySchedulePanel`,
- `PriorityList`,
- `SubjectStatusGrid`,
- `RiskSummaryCards`,
- `SourceWorkspaceStatusPanel`.

### AI Prompt To Use

```text
Build the static Command Center dashboard using seed data.
It should show current class, next class, today's schedule, top priorities, subjects, evaluation placeholders, risk placeholders, and source workspace status placeholders.
Use a dense dark mission-control layout.
Do not make a landing page.
Do not compute final grade or risk; display provided values.
```

### Check The AI Output For

- dashboard is useful without clicking,
- current/next class visually prominent,
- text fits on mobile,
- cards are not nested inside cards,
- status colors are clear,
- no decorative clutter.

### Done Criteria

- dashboard shows real seed semester data.
- mobile layout is usable.
- no console errors.

## Phase 2: Backend State Backbone

### Your Tasks

- Replace seed reads with API calls.
- Add loading/error/empty states.
- Add auth screens if backend auth exists.

API usage:

- `GET /api/v1/state`
- `GET /api/v1/state/detail`
- `GET /api/v1/semesters`
- `GET /api/v1/calendar/events`

### AI Prompt To Use

```text
Replace seed data in the frontend with typed API calls using TanStack Query.
Add loading, error, empty, and retry states.
Do not change backend contracts.
Do not compute domain values in the frontend.
```

### Check The AI Output For

- no duplicated API logic,
- errors shown cleanly,
- API responses typed,
- app survives backend failure,
- no direct DB/browser calls.

### Done Criteria

- dashboard loads from backend.
- seed fallback is clearly isolated or removed.

## Phase 3: Timetable and Calendar Intelligence

### Your Tasks

Build:

- weekly timetable view,
- today timeline,
- current/next class display,
- calendar event list,
- free windows display.

### UI Requirements

- fast scanning,
- clear time blocks,
- subject colors,
- room/faculty metadata,
- mobile horizontal day tabs or compact list.

### AI Prompt To Use

```text
Build timetable and calendar views for Semester Operations Command Center.
Consume backend-provided currentClass, nextClass, todaySchedule, upcomingEvents, and freeWindows.
Do not recompute recurring timetable logic in the frontend.
Make the UI dense, readable, and responsive.
```

### Check The AI Output For

- current/next class comes from API,
- no timezone hacks in UI,
- timetable fits mobile,
- class metadata is readable,
- empty days look intentional.

### Done Criteria

- user can understand today and week in under 10 seconds.

## Phase 4: Evaluation, Marks, GPA, and Risk

### Your Tasks

Build:

- grades page,
- subject evaluation table,
- marks entry form,
- SGPA scenario display,
- risk cards,
- marks-needed display.

### API Usage

- `GET /subjects/{subjectId}/evaluation-plan`
- `POST /assessments`
- `PATCH /assessments/{assessmentId}/marks`
- `GET /grades/sgpa-scenarios`
- `GET /risk`

### AI Prompt To Use

```text
Build the grades and risk UI.
Display evaluation plans, assessments, marks obtained, marks lost, target progress, SGPA scenarios, and risk cards.
Use backend-computed values.
Do not implement SGPA, risk, or marks-needed formulas in the frontend.
```

### Check The AI Output For

- no formula logic in UI,
- marks form validates basic input only,
- risk card explains drivers,
- tables are readable on mobile,
- empty and loading states exist.

### Done Criteria

- user can enter marks,
- risk updates after API refresh,
- UI shows why a risk exists.

## Phase 5: Browser Framework Adapter and Account Connection

### Your Tasks

Build connection UI only. Do not call browser framework directly.

Screens/components:

- `ConnectionsPage`,
- `ProviderConnectionCard`,
- `ManualLoginStatus`,
- `CookiesImportForm`,
- `BrowserSessionStatusBadge`.

### API Usage

Backend endpoints may wrap:

- initialize browser session,
- import cookies,
- get connection status.

### AI Prompt To Use

```text
Build account connection UI for connected chat workspace and source notebook workspace.
The UI should show connection status, manual login needed state, cookies.json import action, and retry.
Call backend APIs only.
Do not call BrowserFrameworkAdapter directly.
Do not expose profile paths or cookie contents.
```

### Check The AI Output For

- cookies are not displayed after selection,
- status is clear,
- manual login flow is understandable,
- no browser framework import in frontend,
- error states include retry.

### Done Criteria

- user can see whether workspace connection is ready.

## Phase 6: Source Workspace Handoff

### Your Tasks

Build source handoff UI:

- upload file per subject,
- show queued/uploading/completed/failed/expired,
- retry,
- manual workspace link fallback,
- cleanup status message.

### API Usage

- `POST /document-handoffs`
- `GET /document-handoffs`
- `POST /document-handoffs/{id}/retry`
- `POST /source-workspaces/{id}/sources`
- `GET /source-workspaces/{id}/status`

### AI Prompt To Use

```text
Build source workspace handoff UI.
Users can choose a subject, upload a file, see transient handoff status, retry failures, and add a manual workspace link.
Do not display or store document content.
Do not imply files are stored permanently.
```

### Check The AI Output For

- copy says transient upload/handoff,
- no document preview,
- status visible,
- retry available,
- failure state actionable.

### Done Criteria

- user can upload and see status through completion/failure.

## Phase 7: Connected Chat Agents

### Your Tasks

Build chat UI:

- conversation list,
- message stream,
- agent progress states,
- structured output cards,
- proposed action confirmation UI.

### AI Prompt To Use

```text
Build chat UI for connected chat agents.
Show user messages, agent progress, final response, warnings, confidence, evidence, and proposed actions.
Use backend chat APIs and SSE stream.
Do not call connected chat provider or BrowserFrameworkAdapter directly.
```

### Check The AI Output For

- streaming/progress works,
- invalid/failure states shown,
- proposed actions require confirmation,
- evidence displayed when provided,
- UI does not overclaim source access.

### Done Criteria

- user can ask “What should I study today?”
- UI displays agent answer and proposed plan.

## Phase 8: Study Planning and Recommendations

### Your Tasks

Build:

- planning page,
- daily plan card,
- weekly plan timeline,
- accept/edit plan actions,
- reason/evidence display.

### AI Prompt To Use

```text
Build study planning UI.
Display generated tasks, time blocks, reasons, evidence refs, and accept/edit actions.
Accepted plan items should call backend APIs.
Do not mutate calendar locally without backend confirmation.
```

### Check The AI Output For

- every plan item has reason,
- accept/edit flow is clear,
- conflict states shown,
- frontend does not invent tasks.

### Done Criteria

- user can generate, inspect, and accept a study plan.

## Phase 9: Notifications and Daily Briefing

### Your Tasks

Build:

- notification inbox,
- alert cards,
- daily briefing card,
- dismiss/snooze actions.

### Check The AI Output For

- alerts are concise,
- priority/severity clear,
- no notification spam UI,
- dismiss/snooze calls backend.

## Phase 10: Demo Hardening

### Your Tasks

- visual polish,
- responsive testing,
- error-state polish,
- empty-state polish,
- demo flow cleanup.

### Manual UI Test Checklist

- 1366px desktop,
- 1024px tablet,
- 390px mobile,
- dashboard no overflow,
- timetable readable,
- grades table usable,
- chat messages wrap,
- buttons text does not overflow,
- loading states visible,
- error states actionable.

## 6. Frontend Evaluation Checklist

Use this checklist to evaluate AI-generated frontend work.

### Product Fit

- Does it look like a command center?
- Is the first screen useful?
- Is it dense but readable?
- Does it avoid marketing/landing-page layout?

### Architecture

- API calls are centralized.
- DTOs are typed.
- no browser framework calls.
- no agent direct calls.
- no business math in UI.

### UX

- loading state,
- empty state,
- error state,
- retry state,
- mobile state,
- disabled state.

### Visual Quality

- no text overflow,
- no incoherent overlaps,
- consistent spacing,
- restrained dark theme,
- no decorative clutter,
- clear hierarchy.

### Data Safety

- no document previews,
- no cookie display,
- no profile paths,
- no provider secrets.

## 7. What To Reject Immediately

Reject AI output that:

- builds a landing page instead of the app,
- computes SGPA/risk in frontend,
- calls `BrowserFrameworkAdapter`,
- stores uploaded files in frontend,
- displays cookies,
- hardcodes agent chat URLs in UI,
- breaks mobile layout,
- creates decorative UI instead of operational UI,
- hides errors.

## 8. Success Definition

Person 3 succeeds when the frontend lets a student:

- open the command center,
- see today/current/next,
- inspect subjects,
- track grades/risk,
- connect workspaces,
- upload handoff files,
- chat with agent workflows,
- accept a study plan,
- understand what to do next.

