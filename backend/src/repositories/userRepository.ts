import type { PrismaClient } from "@prisma/client";

export function createUserRepository(prisma: PrismaClient) {
  return {
    findByEmail(email: string) {
      return prisma.user.findUnique({ where: { email } });
    },
    findById(id: string) {
      return prisma.user.findUnique({ where: { id } });
    },
    create(data: { email: string; passwordHash: string }) {
      return prisma.user.create({ data });
    },
  };
}
