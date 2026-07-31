import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { env } from "../lib/env.js";
// Resolve backend/package.json regardless of whether we're running from
// src/ (tsx) or dist/ (compiled) — both sit exactly two levels below backend/.
const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJsonPath = join(__dirname, "..", "..", "package.json");
const { version } = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
const healthRoutes = async (app) => {
    app.get("/health", async (request, reply) => {
        const checks = { database: "ok", redis: "ok" };
        try {
            await app.prisma.$queryRaw `SELECT 1`;
        }
        catch (err) {
            request.log.error({ err }, "Database health check failed");
            checks.database = "error";
        }
        try {
            await app.redis.ping();
        }
        catch (err) {
            request.log.error({ err }, "Redis health check failed");
            checks.redis = "error";
        }
        const healthy = Object.values(checks).every((v) => v === "ok");
        reply.code(healthy ? 200 : 503).send({
            requestId: request.requestId,
            status: healthy ? "ok" : "degraded",
            uptimeSeconds: Math.round(process.uptime()),
            version,
            environment: env.NODE_ENV,
            checks,
            timestamp: new Date().toISOString(),
        });
    });
};
export default healthRoutes;
//# sourceMappingURL=health.js.map