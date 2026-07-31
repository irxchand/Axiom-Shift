import fp from "fastify-plugin";
import { randomUUID } from "node:crypto";
const requestIdPlugin = async (app) => {
    app.decorateRequest("requestId", "");
    app.addHook("onRequest", async (request, reply) => {
        const incoming = request.headers["x-request-id"];
        const id = typeof incoming === "string" && incoming.trim().length > 0
            ? incoming
            : `req_${randomUUID()}`;
        request.requestId = id;
        reply.header("x-request-id", id);
    });
};
export default fp(requestIdPlugin);
//# sourceMappingURL=requestId.js.map