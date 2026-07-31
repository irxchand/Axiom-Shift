import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { env } from '../lib/env.js';
import { documentHandoffQueue } from '../lib/queue.js';
import path from 'node:path';
import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import crypto from 'node:crypto';

// Reusing schema validation approach
const GetParamsSchema = z.object({
  id: z.string().uuid(),
});

export default (async (app) => {
  // Pre-handler hook to ensure authentication for all routes in this plugin
  app.addHook('preHandler', app.authenticate);

  app.post('/api/v1/document-handoffs', async (request, reply) => {
    // This route requires @fastify/multipart
    const parts = request.parts();
    let subjectId: string | null = null;
    let semesterId: string | null = null;
    let fileInfo: any = null;
    let tempFilePath: string | null = null;
    let fileSizeBytes = 0;

    for await (const part of parts) {
      if (part.type === 'file') {
        const fileExt = path.extname(part.filename);
        const fileName = `${crypto.randomUUID()}${fileExt}`;
        tempFilePath = path.join(process.cwd(), 'uploads', fileName);
        
        const writeStream = fs.createWriteStream(tempFilePath);
        await pipeline(part.file, writeStream);
        
        // We will just read the stats
        const stats = await fs.promises.stat(tempFilePath);
        fileSizeBytes = stats.size;
        
        fileInfo = {
          filename: part.filename,
          mimeType: part.mimetype,
        };
      } else {
        if (part.fieldname === 'subjectId') {
          subjectId = part.value as string;
        } else if (part.fieldname === 'semesterId') {
          semesterId = part.value as string;
        }
      }
    }

    if (!tempFilePath || !fileInfo) {
      return reply.code(400).send({
        requestId: request.id,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No file provided in the request.',
        },
      });
    }

    // Insert to DB
    const handoff = await app.prisma.documentHandoff.create({
      data: {
        userId: request.userId,
        subjectId,
        semesterId,
        filename: fileInfo.filename,
        mimeType: fileInfo.mimeType,
        documentType: 'DOCUMENT',
        transientStagingUri: tempFilePath,
        fileSizeBytes,
        handoffStatus: 'QUEUED',
      },
    });

    // Enqueue the job for the worker
    await documentHandoffQueue.add('process_upload', {
      handoffId: handoff.id,
    });

    return reply.code(201).send({
      requestId: request.id,
      data: handoff,
    });
  });

  app.get('/api/v1/document-handoffs', async (request, reply) => {
    const handoffs = await app.prisma.documentHandoff.findMany({
      where: { userId: request.userId },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({
      requestId: request.id,
      data: handoffs,
    });
  });

  app.get('/api/v1/document-handoffs/:id', async (request, reply) => {
    const { id } = GetParamsSchema.parse(request.params);
    const handoff = await app.prisma.documentHandoff.findFirst({
      where: { id, userId: request.userId },
    });

    if (!handoff) {
      return reply.code(404).send({
        requestId: request.id,
        error: {
          code: 'NOT_FOUND',
          message: 'Document handoff not found.',
        },
      });
    }

    return reply.send({
      requestId: request.id,
      data: handoff,
    });
  });

  app.post('/api/v1/document-handoffs/:id/retry', async (request, reply) => {
    const { id } = GetParamsSchema.parse(request.params);
    const handoff = await app.prisma.documentHandoff.findFirst({
      where: { id, userId: request.userId },
    });

    if (!handoff) {
      return reply.code(404).send({
        requestId: request.id,
        error: {
          code: 'NOT_FOUND',
          message: 'Document handoff not found.',
        },
      });
    }

    if (handoff.handoffStatus === 'COMPLETED') {
      return reply.code(400).send({
        requestId: request.id,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Handoff already completed.',
        },
      });
    }

    if (!handoff.transientStagingUri) {
      return reply.code(400).send({
        requestId: request.id,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cannot retry, transient staging file is missing or expired.',
        },
      });
    }

    // Reset status and queue it again
    const updated = await app.prisma.documentHandoff.update({
      where: { id },
      data: { handoffStatus: 'QUEUED', errorMessage: null },
    });

    await documentHandoffQueue.add('process_upload', {
      handoffId: id,
    });

    return reply.send({
      requestId: request.id,
      data: updated,
    });
  });

}) as FastifyPluginAsync;
