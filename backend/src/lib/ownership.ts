import { AppError } from "./errors.js";

/**
 * Ownership in this codebase is primarily enforced at the QUERY level:
 * every repository method takes (id, userId) together
 * (e.g. `prisma.semester.findFirst({ where: { id, userId } })`), so a
 * resource belonging to another user never loads in the first place —
 * the caller sees NOT_FOUND, which also avoids leaking whether the
 * resource exists at all to someone who doesn't own it.
 *
 * This helper is a second, explicit check for any code path that loads a
 * resource WITHOUT userId in the query (e.g. by id alone, from a cache,
 * or from a nested include) and needs a final gate before acting on it.
 */
export function assertOwnership<T extends { userId: string }>(
  resource: T | null | undefined,
  userId: string,
  resourceName = "Resource",
): T {
  if (!resource) {
    throw AppError.notFound(`${resourceName} not found.`);
  }
  if (resource.userId !== userId) {
    // Same NOT_FOUND (not FORBIDDEN) as the query-level pattern above,
    // for consistency: we never reveal that a foreign resource exists.
    throw AppError.notFound(`${resourceName} not found.`);
  }
  return resource;
}
