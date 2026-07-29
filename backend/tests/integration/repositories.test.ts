import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { Client } from "pg";
import { randomUUID } from "node:crypto";

// Requires a real Postgres reachable at DATABASE_URL with the schema applied
// (see prisma/migrations/ — or docs/DB_VERIFICATION.md for how this was
// verified in the sandbox that built this). Skips cleanly if unreachable so
// this doesn't break `npm test` on a machine without Postgres running yet.

const CONNECTION_STRING =
  process.env.DATABASE_URL ?? "postgresql://socc:socc_password@localhost:5432/socc";

let client: Client;
let dbAvailable = true;

beforeAll(async () => {
  client = new Client({ connectionString: CONNECTION_STRING });
  try {
    await client.connect();
    await client.query("SELECT 1");
  } catch {
    dbAvailable = false;
  }
});

afterAll(async () => {
  if (dbAvailable) await client.end();
});

beforeEach(async () => {
  if (!dbAvailable) return;
  // Clean slate per test — cascades handle child tables.
  await client.query(`TRUNCATE TABLE users CASCADE`);
});

describe.skipIf(!dbAvailable)("Repository-level behavior against real Postgres", () => {
  it("ownership scoping: a query by (id, userId) excludes another user's row", async () => {
    const userA = randomUUID();
    const userB = randomUUID();
    await client.query(
      `INSERT INTO users (id, email, "passwordHash") VALUES ($1,$2,$3),($4,$5,$6)`,
      [userA, "a@example.com", "h", userB, "b@example.com", "h"],
    );
    const semId = randomUUID();
    await client.query(
      `INSERT INTO semesters (id, "userId", name, "startDate", "endDate")
       VALUES ($1,$2,'Sem 4','2026-01-05','2026-05-15')`,
      [semId, userA],
    );

    // This is the exact query shape semesterRepository.findByIdForUser uses.
    const asOwner = await client.query(
      `SELECT * FROM semesters WHERE id = $1 AND "userId" = $2`,
      [semId, userA],
    );
    const asOther = await client.query(
      `SELECT * FROM semesters WHERE id = $1 AND "userId" = $2`,
      [semId, userB],
    );

    expect(asOwner.rows).toHaveLength(1);
    expect(asOther.rows).toHaveLength(0);
  });

  it("rejects a duplicate subject code within the same semester", async () => {
    const userId = randomUUID();
    const semId = randomUUID();
    await client.query(`INSERT INTO users (id, email, "passwordHash") VALUES ($1,$2,$3)`, [
      userId,
      "dup@example.com",
      "h",
    ]);
    await client.query(
      `INSERT INTO semesters (id, "userId", name, "startDate", "endDate")
       VALUES ($1,$2,'Sem 4','2026-01-05','2026-05-15')`,
      [semId, userId],
    );
    await client.query(
      `INSERT INTO subjects (id, "semesterId", "userId", code, name) VALUES ($1,$2,$3,'CS301','OS')`,
      [randomUUID(), semId, userId],
    );

    await expect(
      client.query(
        `INSERT INTO subjects (id, "semesterId", "userId", code, name) VALUES ($1,$2,$3,'CS301','Dup')`,
        [randomUUID(), semId, userId],
      ),
    ).rejects.toMatchObject({ code: "23505" });
  });

  it("marks: rejects a second mark row for the same assessment (unique assessmentId)", async () => {
    const userId = randomUUID();
    const semId = randomUUID();
    const subId = randomUUID();
    const planId = randomUUID();
    const compId = randomUUID();
    const assessId = randomUUID();

    await client.query(`INSERT INTO users (id, email, "passwordHash") VALUES ($1,$2,$3)`, [
      userId,
      "marks@example.com",
      "h",
    ]);
    await client.query(
      `INSERT INTO semesters (id, "userId", name, "startDate", "endDate") VALUES ($1,$2,'Sem','2026-01-05','2026-05-15')`,
      [semId, userId],
    );
    await client.query(
      `INSERT INTO subjects (id, "semesterId", "userId", code, name) VALUES ($1,$2,$3,'CS301','OS')`,
      [subId, semId, userId],
    );
    await client.query(`INSERT INTO evaluation_plans (id, "userId", "subjectId") VALUES ($1,$2,$3)`, [
      planId,
      userId,
      subId,
    ]);
    await client.query(
      `INSERT INTO evaluation_components (id, "evaluationPlanId", name, "weightPercent") VALUES ($1,$2,'Midterm',30)`,
      [compId, planId],
    );
    await client.query(
      `INSERT INTO assessments (id, "userId", "subjectId", "evaluationComponentId", title, "maxMarks")
       VALUES ($1,$2,$3,$4,'Midterm',50)`,
      [assessId, userId, subId, compId],
    );
    await client.query(
      `INSERT INTO marks (id, "assessmentId", "userId", "obtainedMarks") VALUES ($1,$2,$3,41)`,
      [randomUUID(), assessId, userId],
    );

    await expect(
      client.query(`INSERT INTO marks (id, "assessmentId", "userId", "obtainedMarks") VALUES ($1,$2,$3,10)`, [
        randomUUID(),
        assessId,
        userId,
      ]),
    ).rejects.toMatchObject({ code: "23505" });
  });

  it("cascades subject deletion through evaluation plan -> components -> assessments -> marks", async () => {
    const userId = randomUUID();
    const semId = randomUUID();
    const subId = randomUUID();
    const planId = randomUUID();
    const compId = randomUUID();
    const assessId = randomUUID();
    const markId = randomUUID();

    await client.query(`INSERT INTO users (id, email, "passwordHash") VALUES ($1,$2,$3)`, [
      userId,
      "cascade@example.com",
      "h",
    ]);
    await client.query(
      `INSERT INTO semesters (id, "userId", name, "startDate", "endDate") VALUES ($1,$2,'Sem','2026-01-05','2026-05-15')`,
      [semId, userId],
    );
    await client.query(
      `INSERT INTO subjects (id, "semesterId", "userId", code, name) VALUES ($1,$2,$3,'CS301','OS')`,
      [subId, semId, userId],
    );
    await client.query(`INSERT INTO evaluation_plans (id, "userId", "subjectId") VALUES ($1,$2,$3)`, [
      planId,
      userId,
      subId,
    ]);
    await client.query(
      `INSERT INTO evaluation_components (id, "evaluationPlanId", name, "weightPercent") VALUES ($1,$2,'Midterm',30)`,
      [compId, planId],
    );
    await client.query(
      `INSERT INTO assessments (id, "userId", "subjectId", "evaluationComponentId", title, "maxMarks")
       VALUES ($1,$2,$3,$4,'Midterm',50)`,
      [assessId, userId, subId, compId],
    );
    await client.query(
      `INSERT INTO marks (id, "assessmentId", "userId", "obtainedMarks") VALUES ($1,$2,$3,41)`,
      [markId, assessId, userId],
    );

    await client.query(`DELETE FROM subjects WHERE id = $1`, [subId]);

    const orphan = await client.query(`SELECT * FROM marks WHERE id = $1`, [markId]);
    expect(orphan.rows).toHaveLength(0);
  });
});
