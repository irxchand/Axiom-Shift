# Axiom-Shift: Academic Command Center

## Inspiration
The chaos of a student's semester is a beast that cannot be tamed by mere to-do lists or generic calendar apps. We were inspired to build a true "mission control"—not just another digital twin or a siloed AI wrapper, but a persistent academic management platform that unifies structure, deadlines, grades, and intelligence under one roof.

## What it does
Axiom-Shift runs a student's entire academic life from a single surface. It constantly ingests timetables, evaluation plans, and lecture materials, routing them into a central, unified `SemesterOperationsState`. A Multi-Agent System then reasons over this data to predict academic risk, calculate required future averages, and generate constraint-aware study plans, all while communicating through a dense, dark-themed dashboard.

## How we built it
We forged the frontend using React, TypeScript, and Vite, while the robust backend relies on Node.js, Fastify, PostgreSQL, and Redis for asynchronous job queues. The true magic, however, lies in our custom, Playwright-based Browser Automation Framework. Instead of relying on generic APIs, we use a strict `BrowserFrameworkAdapter` to securely drive authenticated browser sessions, delegating tasks to external Source Notebook Workspaces and Connected AI Chats.

## Challenges we ran into
Our greatest hurdle was preventing AI hallucinations from corrupting critical academic data. We had to strictly enforce an architecture where agents return structured JSON and never directly mutate the database, instead proposing commands to a core orchestrator. Additionally, building a secure transient document handoff system—ensuring uploaded files are routed to external workspaces and immediately deleted to protect user privacy—required rigorous state management.

## Accomplishments that we're proud of
We are immensely proud of our uncompromising architectural boundaries. We successfully separated deterministic math (like SGPA scenarios and risk score formulas) from LLM reasoning, ensuring our system is trustworthy and exact. Furthermore, we built a Master Orchestrator that flawlessly routes user intents to specialized agents (like the Planning or Evaluation Agents) using provider-side chat memory without losing sight of our canonical database state.

## What we learned
We learned that AI should enhance a structured operational state, not attempt to replace it. While LLMs are phenomenal at classifying user intents and generating human-readable explanations of risk drivers, traditional deterministic code remains the undisputed king for evaluating marks and projecting grade trajectories. True systemic intelligence is knowing exactly which instrument to use for the task at hand.

## What's next for Axiom Shift
The next evolution involves expanding our Academic Knowledge Graph to map prerequisites and concept mastery at a granular level, potentially migrating to Neo4j. We also plan to integrate official LMS connectors, Google Calendar syncing, and eventually, an advanced spaced repetition engine to completely transform how students conquer their coursework.

---

## Running the Demo

To spin up the fully hardened MVP demo locally:

### 1. Database Setup & Seeding
Ensure Docker is running, then start the database and seed it:
```bash
docker-compose up -d
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 2. Start Backend & Workers
```bash
cd backend
npm run dev
```

### 3. Start Frontend UI
```bash
cd frontend
npm run dev
```

### 4. Browser Agent Readiness
Before triggering browser workflows, configure your Chrome profile according to the [Browser Profile Checklist](./docs/Browser_Profile_Checklist.md). Ensure that your session cookies for ChatGPT/NotebookLM are active.
