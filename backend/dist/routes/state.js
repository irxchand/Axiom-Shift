import { createStateService } from "../services/stateService.js";
import { requireIdempotencyKey, withIdempotency } from "../lib/idempotency.js";
const stateRoutes = async (app) => {
    const stateService = createStateService(app.prisma);
    app.get("/api/v1/state", { preHandler: app.authenticate }, async (request, reply) => {
        const state = await stateService.getState(request.userId);
        reply.code(200).send({ requestId: request.requestId, data: state });
    });
    app.get("/api/v1/state/detail", { preHandler: app.authenticate }, async (request, reply) => {
        const state = await stateService.getStateDetail(request.userId);
        reply.code(200).send({ requestId: request.requestId, data: state });
    });
    app.post("/api/v1/state/recompute", { preHandler: app.authenticate }, async (request, reply) => {
        const key = requireIdempotencyKey(request);
        const { statusCode, body, replayed } = await withIdempotency(app.prisma, { userId: request.userId, key, route: "POST /api/v1/state/recompute" }, async () => {
            const state = await stateService.recompute(request.userId);
            return { statusCode: 200, body: { requestId: request.requestId, data: state } };
        });
        reply.header("Idempotency-Replayed", String(replayed)).code(statusCode).send(body);
    });
};
export default stateRoutes;
//# sourceMappingURL=state.js.map