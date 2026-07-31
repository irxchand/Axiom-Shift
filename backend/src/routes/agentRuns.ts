import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AppError } from '../lib/errors.js';

const GetParamsSchema = z.object({
  id: z.string().uuid(),
});

export default async function agentRunsRoutes(app: FastifyInstance) {
  // Get all agent runs for the current user
  app.get('/api/v1/agent-runs', { preValidation: [app.authenticate] }, async (request, reply) => {
    const runs = await app.prisma.agentRun.findMany({
      where: { userId: request.userId },
      orderBy: { createdAt: 'desc' },
    });
    return { data: runs };
  });

  // Get a specific agent run
  app.get('/api/v1/agent-runs/:id', { preValidation: [app.authenticate] }, async (request, reply) => {
    const { id } = GetParamsSchema.parse(request.params);
    const run = await app.prisma.agentRun.findFirst({
      where: { id, userId: request.userId },
    });

    if (!run) {
      throw AppError.notFound('Agent run not found');
    }

    return { data: run };
  });
}
