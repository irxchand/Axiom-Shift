# Semester Operations Command Center

## Mission
Semester Operations Command Center is the unified backbone for academic operations, planning, and evaluation. This is NOT a "digital twin." It is a command center that operates on canonical state, integrating timetable logic, marks tracking, risk heuristic calculation, and automated agent workflows.

## Architecture Boundaries
- **Canonical State**: The central state object is `SemesterOperationsState`.
- **Frontend Layer**: Calls backend APIs only. No direct browser framework or agent logic in the UI.
- **Backend Layer**: Handles database interaction, state compilation, and validation. The backend domain **never imports Playwright or browser internals**.
- **Browser Automation Framework**: Wraps local Playwright functionality (`BrowserFrameworkAdapter`).
- **Agent Integration**: `Master Orchestrator` routes requests. AI Agents interact with the system via structured JSON responses and proposed commands. No agent directly mutates the DB without going through command handlers.

## Code Ownership Matrix
- **Person 1 (Chief Architect)**: `interfaces/`, `docs/`, `browser/`, `services/browser/`, `configs/`, root repo files, PR templates, and merge rules. (Shared: `agents/master-orchestrator`, `deployment/`, DTO review).
- **Person 2 (AI Systems)**: Agent prompts (`agents/`), agent registry, connected chat agent setup, planning/evaluation/risk logic, and knowledge metadata.
- **Person 3 (Frontend)**: Command center UI (`frontend/`), onboarding screens, timetable/calendar UI, grades/risk views, chat UI.
- **Person 4 (Infrastructure/Backend)**: Backend API (`backend/`), database schema (`database/`), auth, workers, document handoff plumbing, notifications, Docker/CI/testing (`deployment/`).

## Rule: No Local Document Storage (Transient Handoff Only)
**CRITICAL**: Uploaded academic files are transient handoff material only.
- Do not build local RAG over uploaded files.
- Raw uploaded files must be deleted immediately after source workspace handoff.
- The system only retains metadata regarding external source workspaces.
