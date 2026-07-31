import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const GetParamsSchema = z.object({
  id: z.string().uuid(),
});

const CreateSourceWorkspaceSchema = z.object({
  subjectId: z.string().uuid().optional(),
  title: z.string().optional(),
  provider: z.string().optional(),
  externalWorkspaceId: z.string().optional(),
});

export default (async (app) => {
  app.addHook('preHandler', app.authenticate);

  app.post('/api/v1/source-workspaces', async (request, reply) => {
    const data = CreateSourceWorkspaceSchema.parse(request.body);

    const workspace = await app.prisma.sourceWorkspace.create({
      data: {
        userId: request.userId,
        subjectId: data.subjectId,
        title: data.title || 'Notebook Workspace',
        provider: data.provider || 'SOURCE_NOTEBOOK',
        externalWorkspaceId: data.externalWorkspaceId,
        status: data.externalWorkspaceId ? 'CONNECTED' : 'NOT_CONNECTED',
      },
    });

    return reply.code(201).send({
      requestId: request.id,
      data: workspace,
    });
  });

  app.get('/api/v1/source-workspaces', async (request, reply) => {
    const workspaces = await app.prisma.sourceWorkspace.findMany({
      where: { userId: request.userId },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({
      requestId: request.id,
      data: workspaces,
    });
  });

  app.get('/api/v1/source-workspaces/:id/status', async (request, reply) => {
    const { id } = GetParamsSchema.parse(request.params);
    const workspace = await app.prisma.sourceWorkspace.findFirst({
      where: { id, userId: request.userId },
    });

    if (!workspace) {
      return reply.code(404).send({
        requestId: request.id,
        error: { code: 'NOT_FOUND', message: 'Workspace not found.' },
      });
    }

    // In a full implementation, this might call the BrowserAdapter to sync the count of sources
    // For now, return DB state
    return reply.send({
      requestId: request.id,
      data: workspace,
    });
  });

}) as FastifyPluginAsync;
