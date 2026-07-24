# Person 1 SDD
# Chief Architect, Browser Framework Owner, Integration Lead

Version: 1.0  
Project: Semester Operations Command Center  
Primary source docs:

- `docs/Semester_Operations_Command_Center_SDD.md`
- `docs/Phase_Wise_Execution_Plan.md`
- `interfaces/Interface.md`

## 1. Mission

Person 1 owns architecture integrity. Your job is not to build every feature. Your job is to make sure every feature lands in the correct place, talks through the correct contract, and does not break the core rules.

You own:

- architecture,
- repository structure,
- interface governance,
- Browser Automation Framework,
- `BrowserFrameworkAdapter`,
- connected chat/source workspace integration boundary,
- Master Orchestrator integration,
- code review,
- CI/CD approval,
- final merge,
- deployment readiness,
- documentation consistency.

No one else edits Browser Automation Framework internals or browser contracts without your approval.

## 2. Core Rules For Your AI Coding Model

Give these rules to any AI model working under Person 1:

```text
You are implementing architecture and integration code for Semester Operations Command Center.
Do not build product features outside Person 1 ownership.
Do not redesign the Browser Automation Framework.
Wrap the existing Playwright framework through BrowserFrameworkAdapter.
Never expose selectors, cookies, profile paths, Playwright objects, or browser internals outside the browser boundary.
All cross-module work must use interfaces from interfaces/Interface.md.
Uploaded academic files are transient handoff material only.
Do not build local RAG over uploaded files.
Do not allow frontend or agents to call the browser framework directly.
Prefer small vertical integration slices over broad rewrites.
```

## 3. Ownership Boundaries

### You Own

Folders:

- `interfaces/`
- `docs/`
- `browser/`
- `services/browser/`
- `configs/agents.registry.example.json`
- root repo files
- PR template and merge rules

Shared ownership:

- `agents/master-orchestrator` with Person 2.
- `deployment/` review with Person 4.
- shared DTO review with all.

### You Must Not Own Alone

- frontend UI implementation,
- grade/risk formulas,
- database migrations except review,
- notification implementation,
- all prompt engineering.

## 4. Architecture Invariants

These must never be violated:

- canonical state object is `SemesterOperationsState`.
- frontend calls backend APIs only.
- backend domain never imports Playwright.
- agents never mutate DB directly.
- `SourceNotebookService` calls `BrowserFrameworkAdapter`.
- `ConnectedChatService` calls `BrowserFrameworkAdapter`.
- `BrowserFrameworkAdapter` wraps the local Playwright framework.
- raw uploaded files are deleted after source workspace handoff.
- provider cookies are secrets and never committed.
- AI agents return structured JSON and proposed commands.

## 5. Phase Responsibilities

## Phase 0: Setup and Contracts

### Your Tasks

- Create final monorepo structure.
- Freeze names:
  - product: Semester Operations Command Center,
  - aggregate: `SemesterOperationsState`,
  - browser boundary: `BrowserFrameworkAdapter`,
  - external source tool: Source Notebook Workspace,
  - connected chat tool: Connected AI Chat Workspace.
- Create PR template.
- Create code ownership matrix.
- Ensure `interfaces/Interface.md` is treated as contract source.
- Create `configs/agents.registry.example.json`.

### AI Prompt To Use

```text
Create the repository governance artifacts for Semester Operations Command Center.
Use the existing SDD and Interface.md as source of truth.
Add README sections for architecture boundaries, branch workflow, code ownership, and no-local-document-storage rule.
Do not scaffold feature code beyond empty folders and README files.
```

### Check The AI Output For

- Does it use the correct product name?
- Does it avoid "digital twin" naming?
- Does it create the required folders?
- Does it mention transient document handoff?
- Does it keep Browser Framework ownership restricted?
- Did it accidentally add implementation code where only docs were requested?

### Done Criteria

- repo folders exist,
- docs are linked,
- interface file is referenced,
- code ownership is clear,
- all teammates can start.

## Phase 1: Static Command Center

### Your Tasks

- Review seed DTOs created by Person 3 and Person 4.
- Ensure frontend seed shape matches future backend API shape.
- Prevent frontend from inventing domain-only fields without shared schemas.

### AI Prompt To Use

```text
Review the frontend seed DTOs against interfaces/Interface.md.
Return a compatibility report listing fields that match, fields that should be renamed, and fields that should move to backend.
Do not modify frontend UI.
```

### Check The AI Output For

- Does it preserve API compatibility?
- Does it identify frontend business logic risk?
- Does it avoid unnecessary abstraction?

### Done Criteria

- seed data shape can become API response shape with minimal changes.

## Phase 2: Backend State Backbone

### Your Tasks

- Review API route names.
- Review error envelope.
- Review DTOs.
- Ensure `/state`, not `/twin`.
- Ensure document endpoints use `/document-handoffs`, not `/documents`.
- Ensure source workspace endpoints use `/source-workspaces`.

### AI Prompt To Use

```text
Review backend API route implementation against interfaces/Interface.md.
Check route names, DTO names, idempotency headers, error envelope, auth boundary, and ownership checks.
Return blocking issues first.
Do not rewrite implementation unless asked.
```

### Check The AI Output For

- Does it catch stale `/twin` or `/documents` routes?
- Does it verify `Idempotency-Key` for writes?
- Does it check ownership filtering by `userId`?
- Does it check consistent `requestId`?

### Done Criteria

- API contracts match `interfaces/Interface.md`.
- no stale BrowserService or Digital Twin language in code.

## Phase 3: Timetable and Calendar Intelligence

### Your Tasks

- Approve state projection fields:
  - `currentClass`,
  - `nextClass`,
  - `todaySchedule`,
  - `upcomingEvents`,
  - `freeWindows`.
- Ensure frontend displays backend-computed state.

### Check The AI Output For

- no duplicated current/next class logic in frontend,
- timezone handled explicitly,
- recurrence expansion belongs to backend.

## Phase 4: Evaluation, Marks, GPA, and Risk

### Your Tasks

- Review formulas for deterministic implementation.
- Ensure AI/LLM is not used for numeric grade math.
- Ensure all risk cards have evidence references.

### Check The AI Output For

- tests for marks lost,
- tests for marks needed,
- tests for SGPA scenario,
- risk explanation includes driver data,
- no hallucinated advice.

## Phase 5: Browser Framework Adapter and Account Connection

This is your highest-risk implementation phase.

### Your Tasks

Refactor existing `Browser API/poc.py` into:

```text
browser/
  framework/
    adapter_loader.py
    browser_session.py
    chat_runtime.py
    response_collector.py
    source_workspace_runtime.py
  runner/
    browser_framework_cli.py
  adapters/
    connected_chat.adapter.json
    source_workspace.adapter.json
```

CLI commands:

- `initialize-session`
- `import-cookies`
- `open-target`
- `send-chat-message`
- `list-recent-chats`
- `create-source-workspace`
- `upload-source`
- `query-source-workspace`
- `status`

### Required CLI Behavior

- JSON input from stdin or file.
- JSON output to stdout only.
- logs to stderr or log file.
- exit code nonzero on failure.
- never print cookies.
- never print profile paths in normal responses.

### AI Prompt To Use

```text
Refactor Browser API/poc.py into importable browser framework modules without changing behavior.
Keep persistent profile login, optional cookies.json import, target URL mode, new chat mode, recent chat listing, human-like typing, and response stability detection.
Add a JSON CLI wrapper with commands initialize-session, import-cookies, open-target, send-chat-message, list-recent-chats, status.
Do not expose Playwright objects outside browser/framework.
Do not hardcode product-domain logic.
```

### Check The AI Output For

- Did it preserve `launch_persistent_context`?
- Did it preserve `cookies.json` import?
- Did it preserve headful mode defaults?
- Did it preserve target URL mode?
- Did it preserve response stability checks?
- Does stdout contain only JSON?
- Are selectors still adapter-driven?
- Are profile dirs gitignored?
- Does error output avoid leaking secrets?

### Done Criteria

- backend worker can call `send-chat-message`.
- CLI can open a target chat URL.
- CLI can import cookies from a local path.
- CLI can report `READY`/`AWAITING_LOGIN`/`EXPIRED`.

## Phase 6: Source Workspace Handoff

### Your Tasks

- Extend Browser Framework for source workspace upload.
- Keep upload behavior adapter-driven.
- Provide manual fallback if automation fails.
- Ensure raw file path is accepted only as transient input.

### AI Prompt To Use

```text
Add source workspace upload support to the Browser Framework adapter.
The input is a transient local file path and workspace URL or creation request.
Upload the file through the authenticated browser profile.
Return only operation status and external source metadata.
Do not parse file content.
Do not store file content.
Do not expose selectors outside adapter JSON.
```

### Check The AI Output For

- no file parsing,
- no file copy to permanent storage,
- upload status is structured,
- failure includes `HUMAN_LOGIN_REQUIRED` or `EXTERNAL_SITE_CHANGED` where appropriate,
- cleanup remains Person 4's backend responsibility.

## Phase 7: Connected Chat Agents

### Your Tasks

- Ensure `ConnectedChatService` uses `BrowserFrameworkAdapter`.
- Ensure agent URLs are registry-driven.
- Ensure Master Orchestrator can route but not bypass command handlers.

### AI Prompt To Use

```text
Implement the integration boundary for connected chat agents.
Read configs/agents.registry.json, open the target chat URL through BrowserFrameworkAdapter, send the agentTask envelope, collect response text, and return it to AgentRunner.
Do not parse business logic here.
Do not call browser framework directly from agents.
```

### Check The AI Output For

- registry-driven URLs,
- no hardcoded chat IDs,
- one call path through adapter,
- structured error handling,
- no direct DB mutation by browser layer.

## Phase 8: Study Planning and Recommendations

### Your Tasks

- Review orchestration flow from Master -> Planning Agent -> proposed commands -> command handlers.
- Prevent autonomous writes without confirmation.

### Check The AI Output For

- planning output is structured,
- accepted plans become tasks/events only through backend commands,
- recommendation reasons cite state fields.

## Phase 9: Notifications and Daily Briefing

### Your Tasks

- Review event triggers.
- Ensure notifications are deduped.
- Ensure briefing uses state summary, not raw documents.

## Phase 10: Demo Hardening and Deployment

### Your Tasks

- Own final integration.
- Freeze demo branch.
- Create runbook.
- Verify browser profiles.
- Verify no raw uploaded files remain after handoff.
- Verify source workspace manual fallback.

### Final Demo Checklist

- Login works.
- Command center loads.
- Current/next class works.
- Marks update risk.
- Browser adapter can send one chat message.
- Source handoff succeeds or manual fallback works.
- One agent returns valid JSON.
- Plan is generated.
- No secrets are committed.
- No raw academic file persists after handoff.

## 6. Review Checklist For AI-Generated Code

Use this checklist on every AI-generated PR:

### Architecture

- Does the change belong to the claimed folder?
- Does it use the right service/interface?
- Does it bypass a boundary?
- Does it introduce new architecture without approval?

### Naming

- Uses Semester Operations Command Center.
- Uses `SemesterOperationsState`.
- Does not use Digital Twin.
- Does not expose provider names unnecessarily.

### Browser Boundary

- No frontend browser calls.
- No agent browser calls.
- No backend domain Playwright imports.
- No selector leakage.
- No cookie leakage.

### Data Handling

- No raw lecture content stored.
- transient staging cleaned up.
- metadata is enough for audit/status.

### Reliability

- errors are typed,
- retries are bounded,
- idempotency is respected,
- status is visible.

### Tests

- unit tests for pure functions,
- smoke tests for CLI,
- integration test uses mocks where real browser is unavailable.

## 7. What To Reject Immediately

Reject any AI output that:

- redesigns the Browser Automation Framework,
- adds local RAG over uploaded academic files,
- stores cookies in DB,
- commits browser profiles,
- puts grade math in frontend,
- uses `/twin` or `/documents` routes,
- calls the browser from UI,
- creates autonomous destructive agent actions,
- hides errors behind generic `500`.

## 8. Success Definition

Person 1 succeeds when the other three people can build independently without architectural drift, and the final demo has one clean path:

```text
state -> dashboard -> marks/risk -> browser framework -> source handoff or chat agent -> plan
```

