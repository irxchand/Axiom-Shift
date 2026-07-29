# shared/

Contract code shared between backend (Person 4) and frontend (Person 3).

## schemas/seed.schema.ts

Zod schema for the Phase 1 static seed data (`SemesterSeedData`).

- Person 3 copies `sample.seed.json` into `frontend/src/seed/semester.seed.ts`
  (as a typed TS object) and builds the dashboard, timetable, and subject
  cards against it.
- Person 4 keeps this schema's shape identical to the Prisma models landing
  in Phase 2, so `GET /api/v1/state` can later return the same shape and the
  frontend swap is a data-source change only, not a UI rewrite.
- Naming rule: `SemesterOperationsState`, never `twin`.

## Validating the sample seed

```bash
cd shared
npx tsx validate-sample.ts
```

This parses `sample.seed.json` against `SemesterSeedDataSchema` and exits
non-zero if it doesn't match — use this in CI once Person 3's real seed file
exists, pointed at that file instead.
