import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { createTimetableService } from "../services/timetableService.js";
import { requireIdempotencyKey, withIdempotency } from "../lib/idempotency.js";

const WeekdaySchema = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

const TimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Expected HH:MM 24-hour time");

const ImportTimetableSchema = z.object({
  semesterId: z.string().min(1),
  entries: z
    .array(
      z.object({
        subjectCode: z.string().min(1),
        dayOfWeek: WeekdaySchema,
        startTime: TimeSchema,
        endTime: TimeSchema,
        location: z.string().optional(),
        sessionType: z.enum(["LECTURE", "LAB", "TUTORIAL", "OTHER"]).optional(),
      }),
    )
    .min(1),
});

const timetableRoutes: FastifyPluginAsync = async (app) => {
  const timetableService = createTimetableService(app.prisma);

  app.post(
    "/api/v1/timetable/import",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const key = requireIdempotencyKey(request);
      const body = ImportTimetableSchema.parse(request.body);

      const { statusCode, body: responseBody, replayed } = await withIdempotency(
        app.prisma,
        { userId: request.userId, key, route: "POST /api/v1/timetable/import" },
        async () => {
          const result = await timetableService.importEntries(
            request.userId,
            body.semesterId,
            body.entries,
          );
          return { statusCode: 201, body: { requestId: request.requestId, data: result } };
        },
      );

      reply.header("Idempotency-Replayed", String(replayed)).code(statusCode).send(responseBody);
    },
  );
};

export default timetableRoutes;
