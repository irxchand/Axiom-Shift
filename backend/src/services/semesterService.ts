import type { PrismaClient } from "@prisma/client";
import {
  createSemesterRepository,
  createSubjectRepository,
} from "../repositories/semesterRepository.js";
import { AppError } from "../lib/errors.js";

export interface CreateSemesterInput {
  name: string;
  startDate: string; // ISO date
  endDate: string;
  timezone: string;
}

export interface CreateSubjectInput {
  code: string;
  name: string;
  credits?: number;
  color?: string;
}

export function createSemesterService(prisma: PrismaClient) {
  const semesterRepo = createSemesterRepository(prisma);
  const subjectRepo = createSubjectRepository(prisma);

  return {
    listForUser(userId: string) {
      return semesterRepo.listForUser(userId);
    },

    async create(userId: string, input: CreateSemesterInput) {
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);

      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        throw AppError.validation("startDate and endDate must be valid dates.");
      }
      if (endDate <= startDate) {
        throw AppError.validation("endDate must be after startDate.");
      }

      return semesterRepo.create({
        userId,
        name: input.name,
        startDate,
        endDate,
        timezone: input.timezone,
      });
    },

    async createSubject(userId: string, semesterId: string, input: CreateSubjectInput) {
      const semester = await semesterRepo.findByIdForUser(semesterId, userId);
      if (!semester) throw AppError.notFound("Semester not found.");

      const duplicate = await subjectRepo.findByCode(semesterId, input.code);
      if (duplicate) {
        throw AppError.conflict(`Subject code "${input.code}" already exists in this semester.`);
      }

      return subjectRepo.create({
        semesterId,
        userId,
        code: input.code,
        name: input.name,
        credits: input.credits,
        color: input.color,
      });
    },
  };
}
