import type { PrismaClient } from "@prisma/client";

export function createEvaluationRepository(prisma: PrismaClient) {
  return {
    findPlanForSubject(subjectId: string, userId: string) {
      return prisma.evaluationPlan.findFirst({
        where: { subjectId, userId },
        include: { components: true },
      });
    },
    createPlan(data: {
      userId: string;
      subjectId: string;
      components: { name: string; weightPercent: number }[];
    }) {
      return prisma.evaluationPlan.create({
        data: {
          userId: data.userId,
          subjectId: data.subjectId,
          components: { create: data.components },
        },
        include: { components: true },
      });
    },
  };
}

export function createAssessmentRepository(prisma: PrismaClient) {
  return {
    findByIdForUser(id: string, userId: string) {
      return prisma.assessment.findFirst({
        where: { id, userId },
        include: { marks: true, evaluationComponent: true },
      });
    },
    listForSubject(subjectId: string, userId: string) {
      return prisma.assessment.findMany({
        where: { subjectId, userId },
        include: { marks: true, evaluationComponent: true },
      });
    },
    create(data: {
      userId: string;
      subjectId: string;
      evaluationComponentId: string;
      title: string;
      dueDate?: Date;
      maxMarks: number;
    }) {
      return prisma.assessment.create({ data });
    },
  };
}

export function createMarkRepository(prisma: PrismaClient) {
  return {
    upsertForAssessment(assessmentId: string, userId: string, obtainedMarks: number | null) {
      return prisma.mark.upsert({
        where: { assessmentId },
        create: { assessmentId, userId, obtainedMarks },
        update: { obtainedMarks },
      });
    },
  };
}

export function createRiskRepository(prisma: PrismaClient) {
  return {
    findForSubject(subjectId: string, userId: string) {
      return prisma.riskScore.findFirst({ where: { subjectId, userId } });
    },
    listForUser(userId: string) {
      return prisma.riskScore.findMany({ where: { userId } });
    },
    upsert(data: {
      userId: string;
      subjectId: string;
      severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      score: number;
      drivers: object;
      recommended: object;
    }) {
      return prisma.riskScore.upsert({
        where: { subjectId: data.subjectId },
        create: data,
        update: {
          severity: data.severity,
          score: data.score,
          drivers: data.drivers,
          recommended: data.recommended,
          computedAt: new Date(),
        },
      });
    },
  };
}
