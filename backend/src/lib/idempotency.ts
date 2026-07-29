import type { FastifyRequest } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { AppError } from "./errors.js";

export function requireIdempotencyKey(request: FastifyRequest): string {
  const key = request.headers["idempotency-key"];

  if (typeof key !== "string" || key.trim().length === 0) {
    throw new AppError(
      "IDEMPOTENCY_KEY_REQUIRED",
      "This endpoint requires an Idempotency-Key header.",
    );
  }

  return key;
}

/**
 * Runs `fn` at most once per (userId, key, route). If the same key is replayed
 * for the same route, the previously stored response is returned instead of
 * re-running `fn` — this is what makes retried writes safe.
 */
export async function withIdempotency<T>(
  prisma: PrismaClient,
  params: { userId: string; key: string; route: string },
  fn: () => Promise<{ statusCode: number; body: T }>,
): Promise<{ statusCode: number; body: T; replayed: boolean }> {
  const existing = await prisma.idempotencyKey.findUnique({
    where: {
      userId_key_route: {
        userId: params.userId,
        key: params.key,
        route: params.route,
      },
    },
  });

  if (existing) {
    return {
      statusCode: existing.statusCode,
      body: existing.responseBody as T,
      replayed: true,
    };
  }

  const result = await fn();

  try {
    await prisma.idempotencyKey.create({
      data: {
        userId: params.userId,
        key: params.key,
        route: params.route,
        statusCode: result.statusCode,
        responseBody: result.body as object,
      },
    });
  } catch (err) {
    // Two concurrent requests with the same key both missed the cache above.
    // The write already happened; surface a clean conflict rather than a raw DB error.
    const isUniqueViolation =
      typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002";
    if (!isUniqueViolation) throw err;

    throw new AppError(
      "IDEMPOTENCY_KEY_REUSED",
      "This Idempotency-Key is already being processed. Retry shortly.",
    );
  }

  return { ...result, replayed: false };
}
