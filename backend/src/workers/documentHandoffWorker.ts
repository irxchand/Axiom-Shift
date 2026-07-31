import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from '../lib/env.js';
import { processDocumentHandoff } from '../services/documentHandoffService.js';
import pino from 'pino';

const logger = pino({ name: 'DocumentHandoffWorker' });

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const documentHandoffWorker = new Worker(
  'document_handoff',
  async (job) => {
    logger.info({ jobId: job.id, handoffId: job.data.handoffId }, 'Processing document handoff job');
    try {
      const result = await processDocumentHandoff(job.data.handoffId);
      logger.info({ jobId: job.id }, 'Successfully processed handoff');
      return result;
    } catch (err: any) {
      logger.error({ jobId: job.id, err }, 'Failed to process handoff');
      throw err;
    }
  },
  {
    connection,
    concurrency: 1, // Start with concurrency 1 since it's automating a browser
  }
);

documentHandoffWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Job completed');
});

documentHandoffWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Job failed');
});
