# backend/

Fastify + TypeScript + Prisma + Redis/BullMQ backend for the
Semester Operations Command Center.

## Phase 0 status

- `/health` checks DB + Redis connectivity and reports `status`, `uptimeSeconds`, `version`, `environment`, `checks`, `timestamp`.
- requestId middleware on every request/response.
- Standard error envelope (`requestId`, `error.code`, `error.message`, `error.details`).
- Env validated with Zod at boot (`src/lib/env.ts`) — fails fast if misconfigured.
- No product routes yet. Those start in Phase 2.
- `prisma/migrations/` exists (empty, tracked via `.gitkeep`) so the first
  real migration in Phase 2 has a home and doesn't require restructuring.

## Local setup

```bash
cp .env.example .env
npm install
docker compose -f ../deployment/docker-compose.yml up -d postgres redis
npx prisma generate
npm run dev
```

Then:

```bash
curl http://localhost:4000/health
```

## Full stack via Docker Compose

```bash
docker compose -f ../deployment/docker-compose.yml up --build
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | Lint with ESLint |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Run/create a dev migration (Phase 2+) |
| `npm test` | Run tests (vitest) |

## Rules for anyone (human or AI) working in this folder

- All public endpoints live under `/api/v1`.
- All write endpoints require an `Idempotency-Key` header (Phase 2+).
- Every response includes `requestId`.
- Use `/state` and `/document-handoffs`. Never `/twin` or permanent `/documents`.
- Uploaded files are transient staging only — deleted after handoff or expiry.
- Never parse/store lecture source text, chunks, or embeddings.
- Never import Playwright or browser internals into backend domain code —
  only `BrowserFrameworkAdapter` at the service/worker boundary may do so.
