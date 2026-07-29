import type { PrismaClient } from "@prisma/client";

export function createSemesterRepository(prisma: PrismaClient) {
  return {
    listForUser(userId: string) {
      return prisma.semester.findMany({
        where: { userId },
        orderBy: { startDate: "desc" },
      });
    },
    // Ownership check happens right here: querying by (id, userId) together
    // means a semester belonging to another user simply doesn't match — the
    // caller sees NOT_FOUND, never another user's data.
    findByIdForUser(id: string, userId: string) {
      return prisma.semester.findFirst({ where: { id, userId } });
    },
    create(data: {
      userId: string;
      name: string;
      startDate: Date;
      endDate: Date;
      timezone: string;
    }) {
      return prisma.semester.create({ data });
    },
  };
}

export function createSubjectRepository(prisma: PrismaClient) {
  return {
    listForSemester(semesterId: string, userId: string) {
      return prisma.subject.findMany({
        where: { semesterId, userId },
        orderBy: { code: "asc" },
      });
    },
    findByCode(semesterId: string, code: string) {
      return prisma.subject.findFirst({ where: { semesterId, code } });
    },
    findByIdForUser(id: string, userId: string) {
      return prisma.subject.findFirst({ where: { id, userId } });
    },
    create(data: {
      semesterId: string;
      userId: string;
      code: string;
      name: string;
      credits?: number;
      color?: string;
    }) {
      return prisma.subject.create({ data });
    },
  };
}
