import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { randomUUID } from "node:crypto";

// Fastify already generates a request.id, but we want a stable, prefixed,
// externally-visible requestId that shows up in every response body and header.
declare module "fastify" {
  interface FastifyRequest {
    requestId: string;
  }
}

const requestIdPlugin: FastifyPluginAsync = async (app) => {
  app.decorateRequest("requestId", "");

  app.addHook("onRequest", async (request, reply) => {
    const incoming = request.headers["x-request-id"];
    const id =
      typeof incoming === "string" && incoming.trim().length > 0
        ? incoming
        : `req_${randomUUID()}`;

    request.requestId = id;
    reply.header("x-request-id", id);
  });
};

export default fp(requestIdPlugin);
