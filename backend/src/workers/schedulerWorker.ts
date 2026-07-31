import { Worker, Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Fix ioredis constructor compatibility across commonjs/esm bundling
const RedisClient = (Redis as unknown as { default: typeof Redis }).default || Redis;
const redisConnection = new RedisClient(redisUrl, { maxRetriesPerRequest: null });

const prisma = new PrismaClient();

export const briefingQueue = new Queue('daily-briefing-queue', { connection: redisConnection });

export const schedulerWorker = new Worker(
  'daily-briefing-queue',
  async (job) => {
    console.log(`Processing job ${job.id} - ${job.name}`);

    if (job.name === 'GENERATE_DAILY_BRIEFING') {
      const users = await prisma.user.findMany();

      for (const user of users) {
        const todayStr = new Date().toISOString().split('T')[0];
        const dedupeKey = `briefing:${user.id}:${todayStr}`;

        await prisma.notification.upsert({
          where: { dedupeKey },
          update: {},
          create: {
            userId: user.id,
            type: 'DAILY_BRIEFING',
            title: 'Your Daily Semester Briefing',
            message: 'Check your upcoming assessment deadlines and high-risk task updates for today.',
            dedupeKey,
            status: 'UNREAD',
          },
        });
      }
    }
  },
  { connection: redisConnection }
);