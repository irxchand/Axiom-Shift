import fp from "fastify-plugin";
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "../lib/errors.js";
import { verifyAccessToken } from "../lib/auth.js";

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const authPlugin: FastifyPluginAsync = async (app) => {
  app.decorateRequest("userId", "");

  app.decorate("authenticate", async (request: FastifyRequest) => {
    const header = request.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw AppError.unauthorized("Missing or malformed Authorization header.");
    }

    const token = header.slice("Bearer ".length).trim();

    try {
      const payload = verifyAccessToken(token);
      request.userId = payload.sub;
    } catch {
      throw AppError.unauthorized("Invalid or expired token.");
    }
  });
};

export default fp(authPlugin);
