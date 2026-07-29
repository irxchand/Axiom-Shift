import type { PrismaClient } from "@prisma/client";

export function createStateRepository(prisma: PrismaClient) {
  return {
    findForUser(userId: string) {
      return prisma.semesterOperationsState.findUnique({ where: { userId } });
    },
    upsert(userId: string, activeSemesterId: string | null, summary: object) {
      return prisma.semesterOperationsState.upsert({
        where: { userId },
        create: { userId, activeSemesterId, summary },
        update: { activeSemesterId, summary, computedAt: new Date() },
      });
    },
  };
}
