# Agents

**Owner**: Person 2 (AI Systems) (Shared with Person 1 for the Master Orchestrator)

## Boundaries
- Defines the bootstrap prompts and configuration for connected chat AI agents (Master Orchestrator, Initialization, Evaluation, Planning, Source Workspace).
- Agents communicate via structured JSON.
- Agents **DO NOT** have direct access to mutate the database. They return proposed commands which are validated and executed by Backend command handlers.
- **DO NOT** make direct calls to the Browser Automation Framework from agent logic.
