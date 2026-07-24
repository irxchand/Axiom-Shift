# Semester Operations Command Center Interface Contract Index

Version: 1.1  
Owner: Person 1, Chief Architect  
Status: Implementation baseline  

This file is the contract surface for the Semester Operations Command Center MVP. It exists so frontend, backend, agents, browser framework work, and infrastructure can proceed independently.

## 1. Contract Rules

- All public APIs are REST under `/api/v1`.
- All write APIs accept `Idempotency-Key`.
- All IDs are opaque strings.
- All datetime values are ISO 8601 UTC.
- All responses include `requestId`.
- Browser Automation is consumed only through `BrowserFrameworkAdapter`.
- Source Notebook Workspace actions are consumed only through `SourceNotebookService`.
- Connected AI Chat agent calls are consumed only through `ConnectedChatService`.
- Agents return structured outputs only.
- Domain mutations go through backend command handlers.
- Uploaded academic files are transient handoff material, not stored knowledge content.

## 2. Error Envelope

```json
{
  "requestId": "req_01",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "details": [
      {
        "field": "subjectId",
        "reason": "Required"
      }
    ]
  }
}
```

Common codes:

- `UNAUTHENTICATED`
- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `CONFLICT`
- `IDEMPOTENCY_CONFLICT`
- `RATE_LIMITED`
- `AGENT_TIMEOUT`
- `EXTERNAL_SERVICE_UNAVAILABLE`
- `HUMAN_LOGIN_REQUIRED`
- `BROWSER_SESSION_EXPIRED`
- `COOKIES_IMPORT_FAILED`
- `INTERNAL_ERROR`

## 3. BrowserFrameworkAdapter

Owner: Person 1 only.

```ts
interface BrowserFrameworkAdapter {
  initializeSession(request: InitializeBrowserSessionRequest): Promise<BrowserSessionStatus>;
  importCookies(request: ImportCookiesRequest): Promise<BrowserSessionStatus>;
  openTarget(request: OpenTargetRequest): Promise<BrowserOperationResult>;
  createChat(request: CreateChatRequest): Promise<CreateChatResponse>;
  sendChatMessage(request: SendChatMessageRequest): Promise<ChatMessageResult>;
  listRecentChats(request: ListRecentChatsRequest): Promise<ListRecentChatsResponse>;
  createSourceWorkspace(request: CreateSourceWorkspaceRequest): Promise<SourceWorkspaceOperationResult>;
  uploadSourceToWorkspace(request: UploadSourceToWorkspaceRequest): Promise<SourceWorkspaceOperationResult>;
  querySourceWorkspace(request: QuerySourceWorkspaceRequest): Promise<SourceWorkspaceQueryResult>;
  getSessionStatus(request: GetBrowserSessionStatusRequest): Promise<BrowserSessionStatus>;
}
```

States:

- `UNINITIALIZED`
- `AWAITING_LOGIN`
- `READY`
- `BUSY`
- `ERROR`
- `EXPIRED`

Rules:

- The adapter wraps the local Playwright framework.
- It may be implemented as a Python CLI, local process, or later a real service.
- It must not expose selectors, cookies, profile paths, or Playwright internals outside Person 1's boundary.

## 4. SourceNotebookService

```ts
interface SourceNotebookService {
  createSubjectWorkspace(command: CreateSubjectWorkspaceCommand): Promise<SourceWorkspaceDto>;
  uploadSource(command: UploadSourceWorkspaceSourceCommand): Promise<SourceWorkspaceSourceDto>;
  ask(command: AskSourceWorkspaceCommand): Promise<SourceWorkspaceAnswerDto>;
  syncStatus(query: SourceWorkspaceStatusQuery): Promise<SourceWorkspaceStatusDto>;
}
```

`SourceNotebookService` may call `BrowserFrameworkAdapter`. No other module may call the browser adapter for source workspace operations.

## 5. ConnectedChatService

```ts
interface ConnectedChatService {
  runAgentChat(command: RunAgentChatCommand): Promise<AgentChatResult>;
  createAgentChat(command: CreateAgentChatCommand): Promise<AgentChatRef>;
  validateAgentChat(query: ValidateAgentChatQuery): Promise<AgentChatStatus>;
}
```

Rules:

- Each MVP agent is a dedicated chat conversation in the user's connected AI chat account.
- Agent chat URLs are stored in `configs/agents.registry.json`.
- Provider-side chat memory may be used.
- The app stores agent run metadata, not provider memory internals.

## 6. SemesterOperationsStateService

```ts
interface SemesterOperationsStateService {
  createState(command: CreateStateCommand): Promise<SemesterOperationsStateDto>;
  getState(userId: ID): Promise<SemesterOperationsStateDto>;
  getAcademicState(userId: ID): Promise<AcademicStateDto>;
  recomputeState(command: RecomputeStateCommand): Promise<JobDto>;
  applyPatch(command: ApplyStatePatchCommand): Promise<SemesterOperationsStateDto>;
  createSnapshot(command: CreateSnapshotCommand): Promise<SnapshotDto>;
}
```

## 7. DocumentHandoffService

```ts
interface DocumentHandoffService {
  createHandoff(command: CreateDocumentHandoffCommand): Promise<DocumentHandoffDto>;
  retryHandoff(command: RetryDocumentHandoffCommand): Promise<JobDto>;
  getHandoff(query: GetDocumentHandoffQuery): Promise<DocumentHandoffDto>;
  listHandoffs(query: DocumentHandoffQuery): Promise<DocumentHandoffDto[]>;
  deleteHandoff(command: DeleteDocumentHandoffCommand): Promise<DeleteResponse>;
  cleanupExpired(command: CleanupExpiredHandoffsCommand): Promise<CleanupResult>;
}
```

Raw file retention rule:

```text
user upload -> transient staging -> Browser Framework -> external subject workspace -> delete staged file -> store metadata/status
```

## 8. EvaluationService

```ts
interface EvaluationService {
  importPlan(command: ImportEvaluationPlanCommand): Promise<JobDto>;
  createPlan(command: CreateEvaluationPlanCommand): Promise<EvaluationPlanDto>;
  recordMarks(command: RecordMarksCommand): Promise<AssessmentDto>;
  computeSgpa(command: ComputeSgpaCommand): Promise<SgpaScenarioDto>;
  computeMarksNeeded(command: MarksNeededCommand): Promise<MarksNeededDto>;
}
```

## 9. KnowledgeGraphService

```ts
interface KnowledgeGraphService {
  extractConceptMetadata(command: ExtractConceptMetadataCommand): Promise<JobDto>;
  getGraph(query: KnowledgeGraphQuery): Promise<KnowledgeGraphDto>;
  getConcept(conceptId: ID): Promise<ConceptDto>;
  updateMastery(command: UpdateMasteryCommand): Promise<ConceptMasteryDto>;
  findWeakConcepts(query: WeakConceptQuery): Promise<ConceptMasteryDto[]>;
}
```

MVP rule: this service stores concept metadata, mastery, assessment links, and external source references. It does not store lecture source text or document chunks.

## 10. PlanningService

```ts
interface PlanningService {
  generatePlan(command: GeneratePlanCommand): Promise<StudyPlanDto>;
  acceptPlan(command: AcceptPlanCommand): Promise<StudyPlanDto>;
  updateTask(command: UpdateTaskCommand): Promise<TaskDto>;
  getCurrentPlan(userId: ID): Promise<StudyPlanDto | null>;
}
```

## 11. PredictionService

```ts
interface PredictionService {
  recomputeRisk(command: RecomputeRiskCommand): Promise<JobDto>;
  getRisk(query: RiskQuery): Promise<RiskScoreDto[]>;
  getPredictions(query: PredictionQuery): Promise<PredictionDto[]>;
  runScenario(command: PredictionScenarioCommand): Promise<PredictionScenarioDto>;
}
```

## 12. Agent Runtime

```ts
interface AgentRunRequest<TInput> {
  requestId: ID;
  userId: ID;
  stateId: ID;
  traceId: ID;
  idempotencyKey: string;
  input: TInput;
  contextRefs: ContextRef[];
}

interface AgentRunResponse<TOutput> {
  requestId: ID;
  status: "SUCCEEDED" | "FAILED" | "NEEDS_INPUT" | "PARTIAL";
  output?: TOutput;
  confidence: number;
  evidence: EvidenceRef[];
  proposedCommands: ProposedCommand[];
  warnings: string[];
}
```

Agents:

- Initialization Agent
- Master Orchestrator
- Academic Reasoning Agent
- Knowledge Agent
- Planning Agent
- Evaluation Agent
- Prediction Agent
- Notification Agent
- Memory Agent
- Source Workspace Agent
- Calendar Agent
- Analytics Agent

## 13. REST Endpoint Index

Auth:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`

Onboarding:

- `POST /api/v1/onboarding/sessions`
- `POST /api/v1/onboarding/sessions/{sessionId}/messages`
- `POST /api/v1/onboarding/sessions/{sessionId}/complete`

State:

- `GET /api/v1/state`
- `GET /api/v1/state/detail`
- `POST /api/v1/state/recompute`

Semester and subjects:

- `POST /api/v1/semesters`
- `GET /api/v1/semesters`
- `GET /api/v1/semesters/{semesterId}`
- `PATCH /api/v1/semesters/{semesterId}`
- `POST /api/v1/semesters/{semesterId}/subjects`
- `GET /api/v1/subjects/{subjectId}`
- `PATCH /api/v1/subjects/{subjectId}`

Calendar:

- `POST /api/v1/timetable/import`
- `GET /api/v1/calendar/events`
- `POST /api/v1/calendar/events`
- `PATCH /api/v1/calendar/events/{eventId}`
- `DELETE /api/v1/calendar/events/{eventId}`

Document handoffs:

- `POST /api/v1/document-handoffs`
- `GET /api/v1/document-handoffs`
- `GET /api/v1/document-handoffs/{documentHandoffId}`
- `DELETE /api/v1/document-handoffs/{documentHandoffId}`
- `POST /api/v1/document-handoffs/{documentHandoffId}/retry`

Source workspaces:

- `POST /api/v1/source-workspaces`
- `GET /api/v1/source-workspaces`
- `GET /api/v1/source-workspaces/{sourceWorkspaceId}/status`
- `POST /api/v1/source-workspaces/{sourceWorkspaceId}/sources`
- `POST /api/v1/source-workspaces/{sourceWorkspaceId}/query`

Evaluation:

- `POST /api/v1/evaluation-plans/import`
- `POST /api/v1/subjects/{subjectId}/evaluation-plan`
- `GET /api/v1/subjects/{subjectId}/evaluation-plan`
- `POST /api/v1/assessments`
- `PATCH /api/v1/assessments/{assessmentId}/marks`
- `GET /api/v1/grades/sgpa-scenarios`

Attendance:

- `POST /api/v1/attendance`
- `GET /api/v1/attendance/summary`

Knowledge:

- `GET /api/v1/knowledge/graph`
- `GET /api/v1/knowledge/concepts`
- `GET /api/v1/knowledge/concepts/{conceptId}`
- `PATCH /api/v1/knowledge/concepts/{conceptId}/mastery`

Planning:

- `POST /api/v1/plans/generate`
- `GET /api/v1/plans/current`
- `PATCH /api/v1/plans/{planId}/tasks/{taskId}`

Goals:

- `POST /api/v1/goals`
- `GET /api/v1/goals`
- `PATCH /api/v1/goals/{goalId}`

Risk and prediction:

- `GET /api/v1/risk`
- `POST /api/v1/risk/recompute`
- `GET /api/v1/predictions`
- `POST /api/v1/predictions/scenarios`

Chat:

- `POST /api/v1/chat/conversations`
- `POST /api/v1/chat/conversations/{conversationId}/messages`
- `GET /api/v1/chat/conversations/{conversationId}/messages`
- `GET /api/v1/chat/conversations/{conversationId}/stream`

Notifications:

- `GET /api/v1/notifications`
- `PATCH /api/v1/notifications/{notificationId}`
- `POST /api/v1/notifications/test`

Audit:

- `GET /api/v1/audit-logs`
- `GET /api/v1/agent-runs`
- `GET /api/v1/agent-runs/{runId}`

## 14. Domain Event Index

- `UserOnboarded`
- `SemesterOperationsStateCreated`
- `SemesterCreated`
- `SubjectCreated`
- `TimetableImported`
- `EvaluationPlanImported`
- `DocumentHandoffRequested`
- `DocumentHandoffCompleted`
- `SourceWorkspaceCreateRequested`
- `SourceWorkspaceCreated`
- `SourceWorkspaceUploadRequested`
- `SourceWorkspaceUploadCompleted`
- `KnowledgeGraphUpdated`
- `AssessmentRecorded`
- `MarksUpdated`
- `AttendanceRecorded`
- `RiskScoreUpdated`
- `PredictionUpdated`
- `StudyPlanGenerated`
- `CalendarEventCreated`
- `NotificationScheduled`
- `NotificationSent`
- `AgentRunStarted`
- `AgentRunCompleted`
- `AgentRunFailed`

