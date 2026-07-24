# Person-Specific SDD Index

These SDDs are designed to be handed directly to each teammate's AI coding model.

Use them with:

- `docs/Semester_Operations_Command_Center_SDD.md`
- `docs/Phase_Wise_Execution_Plan.md`
- `interfaces/Interface.md`

## Files

| Person | Role | SDD |
|---|---|---|
| Person 1 | Chief Architect, Browser Framework, Integration Lead | `Person_1_Chief_Architect_SDD.md` |
| Person 2 | AI Systems, Agents, Prompts, Planning, Evaluation | `Person_2_AI_Systems_SDD.md` |
| Person 3 | Frontend, Dashboard, Calendar, Chat UI | `Person_3_Frontend_SDD.md` |
| Person 4 | Backend, Database, Infrastructure, Workers, Tests | `Person_4_Backend_Infrastructure_SDD.md` |

## How Each Person Should Use Their SDD

1. Give the AI model the role-specific SDD first.
2. Give it the master Interface contract when implementing APIs or DTOs.
3. Give it the phase plan when asking for tasks in sequence.
4. Ask it to implement only the current phase.
5. After it responds, evaluate its output using the checklist inside that person's SDD.

## Required AI Instruction Pattern

Use this prompt shape:

```text
You are working as Person X on Semester Operations Command Center.
Follow your person-specific SDD exactly.
Implement only Phase N.
Respect all ownership boundaries.
Before coding, list files you will touch.
After coding, explain how your work satisfies the Done Criteria and the AI-output checklist.
```

## Global Rejection Rules

Reject AI work that:

- uses old product naming,
- adds local RAG over uploaded academic files,
- stores raw lecture content,
- bypasses `BrowserFrameworkAdapter`,
- computes domain math in the frontend,
- skips backend ownership checks,
- invents unapproved frameworks,
- implements future phases early.

