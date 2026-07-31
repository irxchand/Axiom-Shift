import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
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
import documentHandoffsRoutes from "./routes/documentHandoffs.js";
import sourceWorkspacesRoutes from "./routes/sourceWorkspaces.js";
import chatRoutes from './routes/chat.js';
import agentRunsRoutes from './routes/agentRuns.js';
import plansRoutes from './routes/plans.js';
import notificationsRoutes from './routes/notifications.js';
export async function buildApp(overrides = {}) {
    const app = Fastify({
        logger: {
            level: env.NODE_ENV === "production" ? "info" : "debug",
            transport: env.NODE_ENV === "development"
                ? { target: "pino-pretty", options: { colorize: true } }
                : undefined,
        },
    });
    // Cross-cutting concerns, in order:
    // requestId -> error envelope -> infra clients -> auth -> routes.
    await app.register(requestIdPlugin);
    await app.register(errorHandlerPlugin);
    await app.register(cors, { origin: env.CORS_ORIGIN });
    await app.register(multipart);
    if (overrides.prisma) {
        app.decorate("prisma", overrides.prisma);
    }
    else {
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
    // Phase 6: Source Workspace Handoff
    // Phase 6 Routes
    app.register(documentHandoffsRoutes);
    app.register(sourceWorkspacesRoutes);
    // Phase 7 Routes
    app.register(chatRoutes);
    app.register(agentRunsRoutes);
    // Phase 8 Routes
    app.register(plansRoutes);
    // Phase 9 Routes
    app.register(notificationsRoutes);
    return app;
}
//# sourceMappingURL=app.js.map