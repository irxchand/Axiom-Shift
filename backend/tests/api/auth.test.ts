import { describe, it, expect, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app.js";
import { createFakePrismaClient } from "../testUtils/fakePrismaClient.js";

// This exercises the REAL route -> service -> repository code path, with an
// in-memory fake standing in for Postgres (see fakePrismaClient.ts for why:
// this sandbox cannot reach binaries.prisma.sh to run `prisma generate`).
// Constraint/cascade-level DB behavior is covered separately by the raw-SQL
// verification against real Postgres, not by this file.

let app: FastifyInstance;

beforeEach(async () => {
  const prisma = createFakePrismaClient();
  app = await buildApp({ prisma: prisma as never });
  app.log.level = "silent";
  await app.ready();
});

async function registerUser(email = "student@example.com", password = "password123") {
  return app.inject({
    method: "POST",
    url: "/api/v1/auth/register",
    payload: { email, password },
  });
}

describe("POST /api/v1/auth/register", () => {
  it("registers a new user and returns a token", async () => {
    const res = await registerUser();
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.data.token).toBeTypeOf("string");
    expect(body.data.email).toBe("student@example.com");
    expect(body.requestId).toBeTypeOf("string");
  });

  it("rejects a duplicate email with 409", async () => {
    await registerUser();
    const res = await registerUser();
    expect(res.statusCode).toBe(409);
    expect(res.json().error.code).toBe("CONFLICT");
  });

  it("rejects invalid body (bad email, short password) with 400 VALIDATION_ERROR", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: { email: "not-an-email", password: "short" },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe("VALIDATION_ERROR");
  });
});

describe("POST /api/v1/auth/login", () => {
  it("logs in with correct credentials", async () => {
    await registerUser("login@example.com", "password123");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "login@example.com", password: "password123" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.token).toBeTypeOf("string");
  });

  it("rejects wrong password with 401 UNAUTHORIZED", async () => {
    await registerUser("login2@example.com", "password123");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "login2@example.com", password: "wrong-password" },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe("UNAUTHORIZED");
  });
});

describe("Protected routes require auth", () => {
  it("GET /api/v1/semesters without a token returns 401", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/semesters" });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe("UNAUTHORIZED");
  });

  it("GET /api/v1/state without a token returns 401", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/state" });
    expect(res.statusCode).toBe(401);
  });
});

describe("Semester + subject creation flow", () => {
  async function authedHeaders() {
    const res = await registerUser("flow@example.com", "password123");
    const token = res.json().data.token as string;
    return { authorization: `Bearer ${token}` };
  }

  it("creates a semester (requires Idempotency-Key)", async () => {
    const headers = await authedHeaders();

    const missingKey = await app.inject({
      method: "POST",
      url: "/api/v1/semesters",
      headers,
      payload: {
        name: "Semester 4",
        startDate: "2026-01-05T00:00:00.000Z",
        endDate: "2026-05-15T00:00:00.000Z",
        timezone: "Asia/Kolkata",
      },
    });
    expect(missingKey.statusCode).toBe(400);
    expect(missingKey.json().error.code).toBe("IDEMPOTENCY_KEY_REQUIRED");

    const created = await app.inject({
      method: "POST",
      url: "/api/v1/semesters",
      headers: { ...headers, "idempotency-key": "create-sem-1" },
      payload: {
        name: "Semester 4",
        startDate: "2026-01-05T00:00:00.000Z",
        endDate: "2026-05-15T00:00:00.000Z",
        timezone: "Asia/Kolkata",
      },
    });
    expect(created.statusCode).toBe(201);
    expect(created.json().data.name).toBe("Semester 4");
  });

  it("replays the same response when the same Idempotency-Key is reused", async () => {
    const headers = await authedHeaders();
    const payload = {
      name: "Semester 4",
      startDate: "2026-01-05T00:00:00.000Z",
      endDate: "2026-05-15T00:00:00.000Z",
      timezone: "Asia/Kolkata",
    };

    const first = await app.inject({
      method: "POST",
      url: "/api/v1/semesters",
      headers: { ...headers, "idempotency-key": "same-key" },
      payload,
    });
    const second = await app.inject({
      method: "POST",
      url: "/api/v1/semesters",
      headers: { ...headers, "idempotency-key": "same-key" },
      payload,
    });

    expect(first.json().data.id).toBe(second.json().data.id);
    expect(second.headers["idempotency-replayed"]).toBe("true");
  });

  it("creates a subject under a semester and lists it", async () => {
    const headers = await authedHeaders();

    const semester = await app.inject({
      method: "POST",
      url: "/api/v1/semesters",
      headers: { ...headers, "idempotency-key": "sem-for-subject" },
      payload: {
        name: "Semester 4",
        startDate: "2026-01-05T00:00:00.000Z",
        endDate: "2026-05-15T00:00:00.000Z",
        timezone: "Asia/Kolkata",
      },
    });
    const semesterId = semester.json().data.id;

    const subject = await app.inject({
      method: "POST",
      url: `/api/v1/semesters/${semesterId}/subjects`,
      headers: { ...headers, "idempotency-key": "subj-1" },
      payload: { code: "CS301", name: "Operating Systems", credits: 4 },
    });
    expect(subject.statusCode).toBe(201);
    expect(subject.json().data.code).toBe("CS301");
  });

  it("GET /api/v1/state returns hasActiveSemester=false with no semesters", async () => {
    const headers = await authedHeaders();
    const res = await app.inject({ method: "GET", url: "/api/v1/state", headers });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.summary.hasActiveSemester).toBe(false);
  });
});
