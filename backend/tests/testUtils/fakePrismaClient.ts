import { randomUUID } from "node:crypto";

function clone<T>(value: T): T {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

/**
 * Extremely small in-memory stand-in for a Prisma delegate. Only supports
 * the exact query shapes this codebase actually uses — it is NOT a general
 * Prisma mock.
 */
function createDelegate<T extends { id: string }>() {
  const rows = new Map<string, T>();

  function matches(row: T, where: Record<string, unknown>): boolean {
    return Object.entries(where).every(([key, value]) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        // Only compound-unique shape we use is { a_b_c: {...} } — handled separately.
        return true;
      }
      return (row as Record<string, unknown>)[key] === value;
    });
  }

  return {
    _rows: rows,
    async create({ data }: { data: Partial<T> }) {
      const row = { id: data.id ?? randomUUID(), ...data } as T;
      rows.set(row.id, row);
      return clone(row);
    },
    async createMany({ data }: { data: Partial<T>[] }) {
      for (const item of data) {
        const row = { id: item.id ?? randomUUID(), ...item } as T;
        rows.set(row.id, row);
      }
      return { count: data.length };
    },
    async findUnique({ where }: { where: Record<string, unknown> }) {
      if (where.id) return clone(rows.get(where.id as string) ?? null);
      for (const row of rows.values()) {
        if (matches(row, where)) return clone(row);
      }
      return null;
    },
    async findFirst({ where }: { where: Record<string, unknown> }) {
      for (const row of rows.values()) {
        if (matches(row, where)) return clone(row);
      }
      return null;
    },
    async findMany({ where }: { where?: Record<string, unknown> } = {}) {
      const all = [...rows.values()];
      if (!where) return clone(all);
      return clone(all.filter((row) => matches(row, where)));
    },
    async upsert({
      where,
      create,
      update,
    }: {
      where: Record<string, unknown>;
      create: Partial<T>;
      update: Partial<T>;
    }) {
      const existing = where.id
        ? rows.get(where.id as string)
        : [...rows.values()].find((row) => matches(row, where));

      if (existing) {
        const updated = { ...existing, ...update } as T;
        rows.set(updated.id, updated);
        return clone(updated);
      }
      const row = { id: (create as { id?: string }).id ?? randomUUID(), ...create } as T;
      rows.set(row.id, row);
      return clone(row);
    },
    async delete({ where }: { where: { id: string } }) {
      const row = rows.get(where.id);
      rows.delete(where.id);
      return clone(row ?? null);
    },
  };
}

export function createFakePrismaClient() {
  const idempotencyKeys = createDelegate<{
    id: string;
    userId: string;
    key: string;
    route: string;
    statusCode: number;
    responseBody: unknown;
  }>();

  // Idempotency lookups use a compound unique key (userId_key_route) — override findUnique for it.
  const originalFindUnique = idempotencyKeys.findUnique.bind(idempotencyKeys);
  idempotencyKeys.findUnique = (async ({ where }: { where: Record<string, unknown> }) => {
    if (where.userId_key_route) {
      const compound = where.userId_key_route as { userId: string; key: string; route: string };
      for (const row of idempotencyKeys._rows.values()) {
        if (
          row.userId === compound.userId &&
          row.key === compound.key &&
          row.route === compound.route
        ) {
          return clone(row);
        }
      }
      return null;
    }
    return originalFindUnique({ where });
  }) as typeof idempotencyKeys.findUnique;

  const client = {
    user: createDelegate<{ id: string; email: string; passwordHash: string }>(),
    semester: createDelegate<{
      id: string;
      userId: string;
      name: string;
      startDate: Date;
      endDate: Date;
      timezone: string;
    }>(),
    subject: createDelegate<{
      id: string;
      semesterId: string;
      userId: string;
      code: string;
      name: string;
      credits?: number;
      color?: string;
    }>(),
    calendarEvent: createDelegate<Record<string, unknown> & { id: string }>(),
    semesterOperationsState: createDelegate<{
      id: string;
      userId: string;
      activeSemesterId: string | null;
      summary: unknown;
    }>(),
    idempotencyKey: idempotencyKeys,

    async $queryRaw() {
      return [{ "?column?": 1 }];
    },
    async $transaction<R>(fn: (tx: unknown) => Promise<R>): Promise<R> {
      // No real atomicity in the fake — good enough for route-level wiring tests.
      return fn(client);
    },
    async $connect() {},
    async $disconnect() {},
  };

  return client;
}
