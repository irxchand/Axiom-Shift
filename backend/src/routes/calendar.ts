import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { createCalendarService } from "../services/calendarService.js";

const QuerySchema = z.object({
  semesterId: z.string().min(1),
  start: z.string().datetime(),
  end: z.string().datetime(),
});

const calendarRoutes: FastifyPluginAsync = async (app) => {
  const calendarService = createCalendarService(app.prisma);

  app.get("/api/v1/calendar/events", { preHandler: app.authenticate }, async (request, reply) => {
    const query = QuerySchema.parse(request.query);

    const result = await calendarService.getEventsInRange(
      request.userId,
      query.semesterId,
      query.start,
      query.end,
    );

    reply.code(200).send({ requestId: request.requestId, data: result });
  });
};

export default calendarRoutes;
