import type { PrismaClient } from "@prisma/client";
import { createUserRepository } from "../repositories/userRepository.js";
import { hashPassword, verifyPassword, signAccessToken } from "../lib/auth.js";
import { AppError } from "../lib/errors.js";

export function createAuthService(prisma: PrismaClient) {
  const userRepo = createUserRepository(prisma);

  return {
    async register(email: string, password: string) {
      const existing = await userRepo.findByEmail(email);
      if (existing) {
        throw AppError.conflict("An account with this email already exists.");
      }

      const passwordHash = await hashPassword(password);
      const user = await userRepo.create({ email, passwordHash });
      const token = signAccessToken(user.id);

      return { userId: user.id, email: user.email, token };
    },

    async login(email: string, password: string) {
      const user = await userRepo.findByEmail(email);
      if (!user) {
        throw AppError.unauthorized("Invalid email or password.");
      }

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        throw AppError.unauthorized("Invalid email or password.");
      }

      const token = signAccessToken(user.id);
      return { userId: user.id, email: user.email, token };
    },
  };
}
