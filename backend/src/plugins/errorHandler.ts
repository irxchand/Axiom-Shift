import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { ZodError } from "zod";
import { AppError, type ErrorEnvelope } from "../lib/errors.js";

const errorHandlerPlugin: FastifyPluginAsync = async (app) => {
  app.setNotFoundHandler((request, reply) => {
    const envelope: ErrorEnvelope = {
      requestId: request.requestId,
      error: {
        code: "NOT_FOUND",
        message: `Route ${request.method} ${request.url} does not exist.`,
      },
    };
    reply.code(404).send(envelope);
  });

  app.setErrorHandler((err, request, reply) => {
    // Zod validation errors -> VALIDATION_ERROR with field details.
    if (err instanceof ZodError) {
      const envelope: ErrorEnvelope = {
        requestId: request.requestId,
        error: {
          code: "VALIDATION_ERROR",
          message: "One or more fields are invalid.",
          details: err.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      };
      reply.code(400).send(envelope);
      return;
    }

    // Our own typed domain errors.
    if (err instanceof AppError) {
      const envelope: ErrorEnvelope = {
        requestId: request.requestId,
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
        },
      };
      reply.code(err.statusCode).send(envelope);
      return;
    }

    // Fastify's own validation (schema-based) errors.
    if (err.validation) {
      const envelope: ErrorEnvelope = {
        requestId: request.requestId,
        error: {
          code: "VALIDATION_ERROR",
          message: "One or more fields are invalid.",
          details: err.validation,
        },
      };
      reply.code(400).send(envelope);
      return;
    }

    // Anything else is unexpected: log full detail server-side,
    // never leak internals to the client.
    request.log.error({ err }, "Unhandled error");
    const envelope: ErrorEnvelope = {
      requestId: request.requestId,
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong. Please try again.",
      },
    };
    reply.code(500).send(envelope);
  });
};

export default fp(errorHandlerPlugin);
