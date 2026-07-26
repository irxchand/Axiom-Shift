import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { env } from "./lib/env.js";
import requestIdPlugin from "./plugins/requestId.js";
import errorHandlerPlugin from "./plugins/errorHandler.js";
import prismaPlugin from "./plugins/prisma.js";
import redisPlugin from "./plugins/redis.js";
import healthRoutes from "./routes/health.js";

export async function buildApp(): Promise<FastifyInstance> {
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
  // requestId -> error envelope -> infra clients -> routes.
  await app.register(requestIdPlugin);
  await app.register(errorHandlerPlugin);
  await app.register(cors, { origin: env.CORS_ORIGIN });
  await app.register(prismaPlugin);
  await app.register(redisPlugin);

  // Phase 0: infra only. Product routes (/api/v1/...) are added starting Phase 2.
  await app.register(healthRoutes);

  return app;
}
