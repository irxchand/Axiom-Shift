# Person 2 SDD
# AI Systems, Agents, Prompts, Planning, Evaluation, Knowledge Metadata

Version: 1.0  
Project: Semester Operations Command Center  
Primary source docs:

- `docs/Semester_Operations_Command_Center_SDD.md`
- `docs/Phase_Wise_Execution_Plan.md`
- `interfaces/Interface.md`

## 1. Mission

Person 2 owns the intelligent behavior of the system. Your job is to make the system reason well over semester operations state without hallucinating, over-storing, or bypassing product boundaries.

You own:

- agent design,
- prompt engineering,
- connected chat agent setup,
- agent output schemas,
- planning logic,
- evaluation/marks/risk logic,
- knowledge metadata model,
- source workspace query behavior,
- agent tests and prompt evaluations.

Your AI coding model must understand that MVP agents are not model API microservices. They are dedicated conversations in the user's connected AI chat workspace, driven through the Browser Automation Framework.

## 2. Core Rules For Your AI Coding Model

Give these rules to any AI model working under Person 2:

```text
You are implementing AI systems for Semester Operations Command Center.
Do not build local RAG over uploaded lecture files.
Do not store raw academic document text, chunks, or embeddings.
Do not mutate the database directly from agents.
Agents return structured JSON with confidence, evidence, warnings, and proposedCommands.
Numerical grade, SGPA, marks, and risk calculations must be deterministic code first.
LLMs may explain or normalize, but they must not be the source of truth for arithmetic.
Each MVP agent is a persistent connected chat conversation controlled through BrowserFrameworkAdapter.
Prompts are versioned files in prompts/{agentId}/system.md.
Agent URLs are stored in configs/agents.registry.json.
```

## 3. Ownership Boundaries

### You Own

Folders:

- `agents/`
- `prompts/`
- `configs/agents.registry.json`
- `shared/agent-schemas`
- `tests/agent`

Shared ownership:

- `backend/src/modules/evaluation` with Person 4.
- `backend/src/modules/planning` with Person 4.
- `backend/src/modules/knowledge` with Person 4.
- `agents/master-orchestrator` with Person 1.

### You Must Not Own Alone

- browser framework internals,
- frontend UI,
- database migrations without Person 4,
- API contracts without Person 1,
- deployment.

## 4. Agent Architecture

### MVP Agent Model

Each agent is a dedicated connected chat conversation.

Required agents for MVP:

- Master Orchestrator,
- Initialization Agent,
- Evaluation Agent,
- Planning Agent,
- Source Workspace Agent.

Optional after MVP:

- Prediction Agent,
- Notification Agent,
- Memory Agent,
- Analytics Agent,
- Calendar Agent.

### Agent Registry

You own `configs/agents.registry.json`.

Required fields:

```json
{
  "agentId": "planning-agent",
  "displayName": "Planning Agent",
  "workspaceType": "CONNECTED_AI_CHAT",
  "chatUrl": "https://chat.example.com/c/planning",
  "promptVersion": "1.0.0",
  "memoryMode": "PROVIDER_MEMORY_ENABLED",
  "capabilities": ["generate_plan"],
  "outputSchema": "StudyPlan"
}
```

### Agent Task Envelope

Every agent task must be sent as:

```json
{
  "agentTask": {
    "runId": "run_01",
    "agentId": "planning-agent",
    "schemaVersion": "1.0",
    "instruction": "Generate a 7-day study plan.",
    "stateSummary": {},
    "outputContract": {
      "format": "json",
      "schemaName": "StudyPlan"
    }
  }
}
```

### Agent Response Envelope

Every agent response must be:

```json
{
  "status": "SUCCEEDED",
  "confidence": 0.82,
  "evidence": [],
  "output": {},
  "proposedCommands": [],
  "warnings": []
}
```

## 5. Phase Responsibilities

## Phase 0: Setup and Contracts

### Your Tasks

- Create prompt folder structure.
- Define agent list.
- Define output schemas.
- Create example agent registry.

Folders:

```text
prompts/
  master-orchestrator/system.md
  initialization-agent/system.md
  evaluation-agent/system.md
  planning-agent/system.md
  source-workspace-agent/system.md
agents/
  schemas/
  registry/
  runner/
  tests/
```

### AI Prompt To Use

```text
Create the AI systems folder structure for Semester Operations Command Center.
Add prompt templates for master-orchestrator, initialization-agent, evaluation-agent, planning-agent, and source-workspace-agent.
Each prompt must require JSON-only output using the standard AgentRunResponse envelope.
Do not implement browser calls.
Do not implement database writes.
```

### Check The AI Output For

- prompts require JSON,
- prompts mention current state overrides old provider memory,
- no direct DB mutation,
- no local document ingestion,
- no provider brand overuse.

### Done Criteria

- prompt folders exist,
- output schemas exist,
- registry example exists.

## Phase 1: Static Command Center

### Your Tasks

- Help define seed academic logic.
- Provide sample priorities and risk labels.
- Provide sample evaluation plan data.

### Check The AI Output For

- sample data is realistic,
- no fake precision,
- no AI dependency in static UI.

## Phase 2: Backend State Backbone

### Your Tasks

- Define what `stateSummary` must contain for agents.
- Define what evidence refs look like.
- Review state DTOs for agent usability.

Required `stateSummary` fields:

- active semester,
- subjects,
- timetable summary,
- upcoming assessments,
- open assignments,
- current marks,
- risk scores,
- goals,
- available free windows,
- source workspace status.

### Done Criteria

- agents can run from state summary without querying raw DB.

## Phase 3: Timetable and Calendar Intelligence

### Your Tasks

- Define simple priority rules.
- Define what counts as urgent.
- Define time-window preference assumptions.

Priority heuristic:

```text
Critical: assessment due within 48 hours and risk HIGH/CRITICAL.
High: assessment within 7 days or assignment within 3 days.
Medium: weak subject with no upcoming deadline.
Low: maintenance/revision item.
```

### Done Criteria

- dashboard priorities are deterministic and explainable.

## Phase 4: Evaluation, Marks, GPA, and Risk

This is one of your most important phases.

### Your Tasks

- Define deterministic grade formulas.
- Define risk rules.
- Define SGPA scenario assumptions.
- Write unit-test examples for Person 4.

### Required Formulas

Marks lost:

```text
marksLost = marksMax - marksObtained
```

Progress:

```text
earnedSoFar = sum(marksObtained for completed assessments)
possibleSoFar = sum(marksMax for completed assessments)
remainingMarks = totalMarks - possibleSoFar
```

Required future average:

```text
requiredFutureAverage = (targetMarks - earnedSoFar) / remainingMarks
```

Risk severity:

```text
CRITICAL if requiredFutureAverage > 0.90
HIGH if requiredFutureAverage > 0.75
MEDIUM if requiredFutureAverage > 0.60
LOW otherwise
```

Adjust severity upward if high-weight assessment is near.

### AI Prompt To Use

```text
Implement deterministic evaluation and risk formulas for Semester Operations Command Center.
Do not use an LLM for arithmetic.
Return pure TypeScript functions and unit tests for marks lost, required future average, subject risk severity, and SGPA scenario.
Use clear inputs and outputs.
```

### Check The AI Output For

- pure functions,
- tests cover edge cases,
- no floating point weirdness without rounding strategy,
- no LLM calls,
- risk explanation includes drivers.

### Done Criteria

- marks/risk tests pass,
- frontend can show risk cards with reasons.

## Phase 5: Browser Framework Adapter and Account Connection

### Your Tasks

- Define AI requirements for connected chat transport.
- Provide example agent task payloads.
- Work with Person 1 to validate response collection.

### Check The AI Output For

- connected chat output can be parsed,
- repair prompt exists,
- stale memory mitigation exists.

## Phase 6: Source Workspace Handoff

### Your Tasks

- Define subject-to-source-workspace mapping rules.
- Define Source Workspace Agent behavior.
- Ensure the agent does not request local document content.

Source workspace mapping:

```text
subjectId -> sourceWorkspaceId -> externalWorkspaceUrl -> source status
```

### Done Criteria

- every subject can be linked to a source workspace,
- agent can choose which workspace to query based on subject/context.

## Phase 7: Connected Chat Agents

This is your highest-risk phase.

### Your Tasks

- Create actual agent chats.
- Paste bootstrap prompts.
- Store chat URLs in registry.
- Build output schemas.
- Test each agent.

### Required MVP Agents

#### Master Orchestrator

Purpose:

- classify user intent,
- decide which agent should handle the request,
- assemble final response,
- never directly mutate state.

Inputs:

- user message,
- state summary,
- available agents.

Output schema:

- `AgentRouteDecision`.

#### Initialization Agent

Purpose:

- collect missing setup fields,
- normalize timetable/evaluation inputs,
- request source workspace handoffs.

Output schema:

- `OnboardingPlan`.

#### Evaluation Agent

Purpose:

- explain marks/risk,
- normalize messy evaluation inputs,
- produce scenario explanations.

Output schema:

- `EvaluationInsight`.

#### Planning Agent

Purpose:

- produce daily/weekly study plan from state summary.

Output schema:

- `StudyPlan`.

#### Source Workspace Agent

Purpose:

- decide which source workspace should answer a subject question,
- call source workspace query through backend tool path,
- summarize answer with citations.

Output schema:

- `SourceWorkspaceQueryPlan`.

### Bootstrap Prompt Requirements

Every bootstrap prompt must include:

```text
You are [Agent Name] for Semester Operations Command Center.
Always obey the latest stateSummary over prior chat memory.
Return JSON only.
Never invent marks, deadlines, or documents.
Never claim access to source content unless provided by Source Workspace result.
Use evidence refs for every state-based claim.
If information is missing, return NEEDS_INPUT.
```

### AI Prompt To Use

```text
Create bootstrap prompts for the MVP agents.
Each prompt must force JSON-only AgentRunResponse output.
Each prompt must include role, responsibilities, input expectations, output schema, refusal rules, missing-info behavior, and evidence requirements.
Do not include provider-specific names.
Do not ask the agent to browse or directly use browser automation.
```

### Check The AI Output For

- JSON-only requirement is explicit,
- latest `stateSummary` overrides memory,
- no hallucinated state,
- evidence required,
- `NEEDS_INPUT` behavior exists,
- no direct browser calls,
- no raw document storage.

### Done Criteria

- at least Master, Planning, Evaluation agents return valid JSON.
- one repair retry works.
- invalid output is detected.

## Phase 8: Study Planning and Recommendations

### Your Tasks

- Implement deterministic planning fallback.
- Add Planning Agent enhancement.
- Define recommendation explanation style.

Planning inputs:

- free windows,
- upcoming assessments,
- subject risk,
- marks lost,
- goals,
- user constraints.

Planning output:

- tasks,
- study blocks,
- reasons,
- evidence refs,
- proposed calendar events.

### Check The AI Output For

- plan is realistic,
- no impossible schedules,
- time windows respect class timetable,
- every task has reason,
- proposed calendar writes require confirmation.

### Done Criteria

- system can answer: “What should I study today?”
- response includes tasks and reasons.

## Phase 9: Notifications and Daily Briefing

### Your Tasks

- Define briefing content.
- Define notification trigger rules.

Daily briefing:

- current/next class,
- top three priorities,
- upcoming assessments,
- risk changes,
- recommended action.

Trigger examples:

- assessment within 48 hours,
- risk changes to HIGH,
- source workspace upload fails,
- accepted plan task due soon.

### Done Criteria

- notification content is concise,
- no noisy duplicate alerts.

## Phase 10: Demo Hardening

### Your Tasks

- Test agent prompts with demo data.
- Create fallback responses.
- Ensure all agent outputs validate.
- Create demo-safe agent registry.

### Done Criteria

- demo prompts work twice in a row.
- agent failures degrade gracefully.

## 6. Agent Evaluation Checklist

Use this checklist to judge any AI-generated agent/prompt work.

### Structure

- Does output match `AgentRunResponse`?
- Is JSON valid?
- Is schema version included where needed?
- Are `confidence`, `evidence`, `warnings`, and `proposedCommands` present?

### Grounding

- Are marks/deadlines pulled from `stateSummary`?
- Does every recommendation cite evidence?
- Does it avoid inventing assessments?
- Does it say `NEEDS_INPUT` when missing data?

### Safety

- No raw document storage.
- No direct browser instructions.
- No autonomous destructive commands.
- No hidden provider-specific dependency.

### Utility

- Is the recommendation actionable?
- Is it specific enough for the student?
- Does it respect timetable constraints?
- Does it help the command center feel intelligent?

## 7. What To Reject Immediately

Reject AI output that:

- stores lecture chunks,
- builds local RAG over uploaded files,
- uses LLM for grade arithmetic,
- returns prose instead of JSON,
- invents marks or deadlines,
- writes directly to DB,
- bypasses command handlers,
- creates browser automation code outside Person 1 boundary,
- creates too many agents before MVP agents work.

## 8. Success Definition

Person 2 succeeds when the system can:

- explain academic state,
- compute and explain marks/risk,
- route user requests through Master Orchestrator,
- use connected chat conversations as agents,
- generate a study plan from state,
- ask the right source workspace for subject-grounded answers,
- do all of this with structured, testable outputs.

