## Description
(Provide a brief description of the problem, any background context, and what the change accomplishes.)

## Review Checklist (Mandatory for AI-Generated & Human Code)

### Architecture
- [ ] Does the change belong to the claimed folder?
- [ ] Does it use the right service/interface?
- [ ] Does it bypass an architectural boundary?
- [ ] Does it introduce new architecture without Person 1's approval?

### Naming
- [ ] Uses "Semester Operations Command Center" (No "Digital Twin").
- [ ] Uses `SemesterOperationsState`.
- [ ] Avoids exposing provider names unnecessarily.

### Browser Boundary
- [ ] No frontend browser calls.
- [ ] No agent browser calls.
- [ ] No backend domain Playwright imports.
- [ ] No Playwright selector leakage.
- [ ] No cookie leakage (never logged or committed).

### Data Handling
- [ ] **NO RAW LECTURE CONTENT STORED**. Transient staging is cleaned up.
- [ ] Metadata is sufficient for audit/status.

### Reliability
- [ ] Errors are typed and follow the envelope.
- [ ] Retries are bounded.
- [ ] Idempotency is respected.
- [ ] Status is visible.

### Tests
- [ ] Unit tests for pure functions.
- [ ] Smoke tests for CLI.
- [ ] Integration test uses mocks where a real browser is unavailable.
