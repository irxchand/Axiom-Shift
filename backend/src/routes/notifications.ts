import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { 
  evaluateAssessmentDeadlines, 
  evaluateRiskElevations, 
  filterDuplicates 
} from '../modules/notifications/notifications.engine.js';
import { synthesizeDailyBriefing } from '../modules/notifications/briefing.builder.js';
import { NotificationType, NotificationSeverity, AppNotification } from '../modules/notifications/notifications.types.js';
import { Assessment } from '../modules/evaluation/evaluation.types.js';

const snoozeSchema = z.object({
  snoozeUntil: z.string().datetime()
});

export default async function notificationsRoutes(app: FastifyInstance) {
  
  app.get('/api/v1/notifications', async (request, reply) => {
    const userId = request.userId;
    const now = new Date();

    // 1. Fetch active assessments
    const assessmentsData = await app.prisma.assessment.findMany({
      where: { userId },
      include: { marks: true }
    });

    const activeAssessments: Assessment[] = assessmentsData.map(a => ({
      id: a.id,
      name: a.title,
      dueDate: a.dueDate || undefined,
      isCompleted: !!a.marks,
      marksMax: a.maxMarks,
      weightage: 0
    }));

    // 2. Fetch Risk Scores to evaluate elevations
    const riskScores = await app.prisma.riskScore.findMany({
      where: { userId },
      include: { subject: true }
    });

    const riskDeltas = riskScores.map(r => ({
      subjectId: r.subjectId,
      subjectName: r.subject.name,
      previous: 'MEDIUM', // Mock previous state
      current: r.severity
    }));

    // 3. Generate proposed notifications
    const deadlineNotifs = evaluateAssessmentDeadlines(activeAssessments, now);
    const riskNotifs = evaluateRiskElevations(riskDeltas, now);
    const proposed = [...deadlineNotifs, ...riskNotifs];

    // 4. Fetch history to dedupe
    const sentHistoryData = await app.prisma.notification.findMany({
      where: { userId, createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }
    });

    const sentHistory: AppNotification[] = sentHistoryData.map(n => ({
      id: n.id,
      type: n.type as NotificationType,
      severity: 'WARNING' as NotificationSeverity, // Default fallback
      title: n.title,
      message: n.message,
      dedupeKey: n.dedupeKey,
      timestamp: n.createdAt
    }));

    // 5. Filter duplicates
    const newNotifications = filterDuplicates(proposed, sentHistory);

    // 6. Persist new notifications
    if (newNotifications.length > 0) {
      await app.prisma.notification.createMany({
        data: newNotifications.map(n => ({
          userId,
          type: n.type === 'ASSESSMENT_DEADLINE' ? 'UPCOMING_ASSESSMENT' : 'HIGH_RISK_CHANGE',
          title: n.title,
          message: n.message,
          dedupeKey: n.dedupeKey,
          status: 'UNREAD'
        }))
      });
    }

    // 7. Return all active notifications for the user
    const dbNotifs = await app.prisma.notification.findMany({
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

    // Map Prisma Notification to frontend NotificationItemDTO format
    const mapped = dbNotifs.map(n => {
      let priority = 'NORMAL';
      if (n.type === 'HIGH_RISK_CHANGE') priority = 'CRITICAL';
      else if (n.type === 'UPCOMING_ASSESSMENT') priority = 'HIGH';

      return {
        id: n.id,
        category: n.type,
        title: n.title,
        message: n.message,
        timestamp: n.createdAt.toISOString(),
        isRead: n.status === 'READ',
        isSnoozed: n.status === 'SNOOZED',
        snoozedUntil: n.snoozedUntil?.toISOString(),
        priority
      };
    });

    return { data: mapped };
  });

  app.get('/api/v1/notifications/briefing', async (request, reply) => {
    const userId = request.userId;
    const now = new Date();

    // Fetch today's classes
    const classesData = await app.prisma.calendarEvent.findMany({
      where: { userId, eventType: 'CLASS' }
    });
    const classesToday = classesData.map(c => ({
      subjectName: c.title,
      startTime: c.startAt || now,
      endTime: c.endAt || now,
      room: c.location || 'TBA'
    }));

    // Fetch upcoming assessments
    const assessmentsData = await app.prisma.assessment.findMany({
      where: { userId, dueDate: { gte: now } }
    });
    const assessments = assessmentsData.map(a => ({
      name: a.title,
      daysRemaining: a.dueDate ? Math.ceil((a.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
    }));

    // Risk changes
    const riskChanges = [
      { subjectName: 'Data Structures', previous: 'MEDIUM', current: 'HIGH' } // Mock
    ];

    const priorities = [
      { taskId: '1', title: 'Complete AI Assignment', reason: 'High weightage deadline approaching' }
    ];

    const briefing = synthesizeDailyBriefing(classesToday, priorities, assessments, riskChanges, now);

    return { data: briefing };
  });

  // POST /api/v1/notifications/:id/dismiss - Dismiss notification
  app.post('/api/v1/notifications/:id/dismiss', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.userId;
    const { id } = request.params;

    const notification = await app.prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    }

    const updated = await app.prisma.notification.update({
      where: { id },
      data: { status: 'DISMISSED' }
    });

    return { data: updated };
  });

  // POST /api/v1/notifications/:id/snooze - Snooze notification
  app.post('/api/v1/notifications/:id/snooze', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = request.userId;
    const { id } = request.params;
    const body = snoozeSchema.parse(request.body);

    const notification = await app.prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    }

    const updated = await app.prisma.notification.update({
      where: { id },
      data: {
        status: 'SNOOZED',
        snoozedUntil: new Date(body.snoozeUntil)
      }
    });

    return { data: updated };
  });
}