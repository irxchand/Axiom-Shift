import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const snoozeSchema = z.object({
  snoozeUntil: z.string().datetime()
});

const triggerTestSchema = z.object({
  type: z.enum([
    'UPCOMING_ASSESSMENT',
    'HIGH_RISK_CHANGE',
    'WORKSPACE_HANDOFF_FAILURE',
    'ACCEPTED_PLAN_TASK',
    'DAILY_BRIEFING'
  ]),
  title: z.string(),
  message: z.string(),
  dedupeKey: z.string()
});

export async function notificationRoutes(fastify: FastifyInstance) {
  // GET /notifications - List user notifications (filters out snoozed ones if still active)
  fastify.get('/notifications', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request.headers['x-user-id'] as string) || 'default-user-id';
    const now = new Date();

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        status: { in: ['UNREAD', 'READ', 'SNOOZED'] },
        OR: [
          { snoozedUntil: null },
          { snoozedUntil: { lte: now } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    return reply.send({ success: true, data: notifications });
  });

  // POST /notifications/:id/dismiss - Dismiss notification
  fastify.post('/notifications/:id/dismiss', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = (request.headers['x-user-id'] as string) || 'default-user-id';
    const { id } = request.params;

    const notification = await prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { status: 'DISMISSED' }
    });

    return reply.send({ success: true, data: updated });
  });

  // POST /notifications/:id/snooze - Snooze notification
  fastify.post('/notifications/:id/snooze', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = (request.headers['x-user-id'] as string) || 'default-user-id';
    const { id } = request.params;
    const body = snoozeSchema.parse(request.body);

    const notification = await prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        status: 'SNOOZED',
        snoozedUntil: new Date(body.snoozeUntil)
      }
    });

    return reply.send({ success: true, data: updated });
  });

  // POST /notifications/test - Test notification generation (Dedupe aware)
  fastify.post('/notifications/test', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request.headers['x-user-id'] as string) || 'default-user-id';
    const body = triggerTestSchema.parse(request.body);

    // Idempotent creation using dedupe key
    const notification = await prisma.notification.upsert({
      where: { dedupeKey: body.dedupeKey },
      update: {}, // No-op if dedupeKey exists to prevent spam
      create: {
        userId,
        type: body.type,
        title: body.title,
        message: body.message,
        dedupeKey: body.dedupeKey,
        status: 'UNREAD'
      }
    });

    return reply.status(201).send({ success: true, data: notification });
  });
}