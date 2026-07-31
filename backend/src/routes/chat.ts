import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';
import { AppError } from '../lib/errors.js';
import { agentRunQueue } from '../lib/queue.js';
import { PrismaClient } from '@prisma/client';

const CreateChatSchema = z.object({
  agentId: z.string(),
  prompt: z.string().min(1),
  files: z.array(z.object({
    name: z.string(),
    data: z.string() // base64
  })).optional()
});

export default async function chatRoutes(app: FastifyInstance) {
  // Load registry inside memory
  let agentsRegistry: any = null;

  const loadRegistry = async () => {
    if (!agentsRegistry) {
      const registryPath = path.resolve('../configs/agents.registry.json');
      const data = await fs.readFile(registryPath, 'utf8');
      agentsRegistry = JSON.parse(data);
    }
    return agentsRegistry;
  };

  app.post('/api/v1/chat/messages', { preValidation: [app.authenticate] }, async (request, reply) => {
    const { agentId, prompt, files } = CreateChatSchema.parse(request.body);
    const registry = await loadRegistry();

    const agentDef = registry.agents.find((a: any) => a.agentId === agentId);
    if (!agentDef) {
      throw AppError.validation(`Unknown agent ID: ${agentId}`);
    }
    
    const filePaths: string[] = [];
    if (files && files.length > 0) {
      const os = await import('os');
      const tmpdir = os.tmpdir();
      for (const f of files) {
        const filePath = path.join(tmpdir, `upload_${Date.now()}_${f.name}`);
        const buffer = Buffer.from(f.data, 'base64');
        await fs.writeFile(filePath, buffer);
        filePaths.push(filePath);
      }
    }

    // Create AgentRun placeholder
    const run = await app.prisma.agentRun.create({
      data: {
        userId: request.userId,
        agentId: agentDef.agentId,
        chatUrl: agentDef.chatUrl,
        taskPayload: { prompt, filePaths },
        status: 'PENDING',
      },
    });

    // Enqueue
    await agentRunQueue.add('agent_run', { runId: run.id });

    return {
      data: {
        runId: run.id,
        status: 'PENDING',
      },
    };
  });
}
