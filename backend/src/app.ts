import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import type { PrismaClient } from "@prisma/client";
import { env } from "./lib/env.js";
import requestIdPlugin from "./plugins/requestId.js";
import errorHandlerPlugin from "./plugins/errorHandler.js";
import prismaPlugin from "./plugins/prisma.js";
import redisPlugin from "./plugins/redis.js";
import authPlugin from "./plugins/auth.js";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import semesterRoutes from "./routes/semesters.js";
import timetableRoutes from "./routes/timetable.js";
import calendarRoutes from "./routes/calendar.js";
import stateRoutes from "./routes/state.js";
import evaluationRoutes from "./routes/evaluation.js";

export interface BuildAppOverrides {
  /**
   * Test-only seam: inject a pre-built Prisma client (or a fake with the
   * same shape) instead of connecting a real one via prismaPlugin. Never
   * used in production — server.ts calls buildApp() with no overrides.
   */
  prisma?: PrismaClient;
}

export async function buildApp(overrides: BuildAppOverrides = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
      transport:
        env.NODE_ENV === "development"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
  });

  // Cross-cutting concerns, in order:
  // requestId -> error envelope -> infra clients -> auth -> routes.
  await app.register(requestIdPlugin);
  await app.register(errorHandlerPlugin);
  await app.register(cors, { origin: env.CORS_ORIGIN });

  if (overrides.prisma) {
    app.decorate("prisma", overrides.prisma);
  } else {
    await app.register(prismaPlugin);
  }

  await app.register(redisPlugin);
  await app.register(authPlugin);

  await app.register(healthRoutes);

  // Phase 2: Backend State Backbone
  await app.register(authRoutes);
  await app.register(semesterRoutes);
  await app.register(timetableRoutes);
  await app.register(stateRoutes);

  // Phase 3: Timetable and Calendar Intelligence
  await app.register(calendarRoutes);

  // Phase 4: Evaluation, Marks, GPA, and Risk
  await app.register(evaluationRoutes);

  return app;
}
