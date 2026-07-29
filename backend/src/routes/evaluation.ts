import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { createEvaluationService } from "../services/evaluationService.js";
import { requireIdempotencyKey, withIdempotency } from "../lib/idempotency.js";

const ComponentSchema = z.object({
  name: z.string().min(1),
  weightPercent: z.number().min(0).max(100),
});

const CreatePlanSchema = z.object({
  components: z.array(ComponentSchema).min(1),
});

const CreateAssessmentSchema = z.object({
  subjectId: z.string().min(1),
  evaluationComponentId: z.string().min(1),
  title: z.string().min(1),
  dueDate: z.string().datetime().optional(),
  maxMarks: z.number().positive(),
});

const UpdateMarksSchema = z.object({
  obtainedMarks: z.number().min(0).nullable(),
});

const SgpaQuerySchema = z.object({
  // JSON-encoded { [subjectId]: targetPercent }, optional
  targets: z.string().optional(),
});

const evaluationRoutes: FastifyPluginAsync = async (app) => {
  const evaluationService = createEvaluationService(app.prisma);

  app.post(
    "/api/v1/subjects/:subjectId/evaluation-plan",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const key = requireIdempotencyKey(request);
      const { subjectId } = request.params as { subjectId: string };
      const body = CreatePlanSchema.parse(request.body);

      const { statusCode, body: responseBody, replayed } = await withIdempotency(
        app.prisma,
        {
          userId: request.userId,
          key,
          route: `POST /api/v1/subjects/${subjectId}/evaluation-plan`,
        },
        async () => {
          const plan = await evaluationService.createEvaluationPlan(
            request.userId,
            subjectId,
            body.components,
          );
          return { statusCode: 201, body: { requestId: request.requestId, data: plan } };
        },
      );

      reply.header("Idempotency-Replayed", String(replayed)).code(statusCode).send(responseBody);
    },
  );

  app.get(
    "/api/v1/subjects/:subjectId/evaluation-plan",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const { subjectId } = request.params as { subjectId: string };
      const plan = await evaluationService.getEvaluationPlan(request.userId, subjectId);
      reply.code(200).send({ requestId: request.requestId, data: plan });
    },
  );

  app.post(
    "/api/v1/assessments",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const key = requireIdempotencyKey(request);
      const body = CreateAssessmentSchema.parse(request.body);

      const { statusCode, body: responseBody, replayed } = await withIdempotency(
        app.prisma,
        { userId: request.userId, key, route: "POST /api/v1/assessments" },
        async () => {
          const assessment = await evaluationService.createAssessment(request.userId, body);
          return { statusCode: 201, body: { requestId: request.requestId, data: assessment } };
        },
      );

      reply.header("Idempotency-Replayed", String(replayed)).code(statusCode).send(responseBody);
    },
  );

  app.patch(
    "/api/v1/assessments/:assessmentId/marks",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const key = requireIdempotencyKey(request);
      const { assessmentId } = request.params as { assessmentId: string };
      const body = UpdateMarksSchema.parse(request.body);

      const { statusCode, body: responseBody, replayed } = await withIdempotency(
        app.prisma,
        {
          userId: request.userId,
          key,
          route: `PATCH /api/v1/assessments/${assessmentId}/marks`,
        },
        async () => {
          const result = await evaluationService.updateMarks(
            request.userId,
            assessmentId,
            body.obtainedMarks,
          );
          return { statusCode: 200, body: { requestId: request.requestId, data: result } };
        },
      );

      reply.header("Idempotency-Replayed", String(replayed)).code(statusCode).send(responseBody);
    },
  );

  app.get(
    "/api/v1/grades/sgpa-scenarios",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const query = SgpaQuerySchema.parse(request.query);
      const targets = query.targets ? (JSON.parse(query.targets) as Record<string, number>) : {};

      const scenario = await evaluationService.getSgpaScenarios(request.userId, targets);
      reply.code(200).send({ requestId: request.requestId, data: scenario });
    },
  );

  app.get(
    "/api/v1/risk",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const risk = await evaluationService.getRiskForUser(request.userId);
      reply.code(200).send({ requestId: request.requestId, data: risk });
    },
  );

  const RecomputeRiskSchema = z.object({ subjectId: z.string().min(1) });

  app.post(
    "/api/v1/risk/recompute",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const key = requireIdempotencyKey(request);
      const body = RecomputeRiskSchema.parse(request.body);

      const { statusCode, body: responseBody, replayed } = await withIdempotency(
        app.prisma,
        { userId: request.userId, key, route: "POST /api/v1/risk/recompute" },
        async () => {
          const risk = await evaluationService.recomputeRisk(request.userId, body.subjectId);
          return { statusCode: 200, body: { requestId: request.requestId, data: risk } };
        },
      );

      reply.header("Idempotency-Replayed", String(replayed)).code(statusCode).send(responseBody);
    },
  );
};

export default evaluationRoutes;
