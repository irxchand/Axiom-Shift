import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from '../lib/env.js';
import { executeAgentRun } from '../services/agentRunner.js';

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const agentRunWorker = new Worker(
  'agent_run',
  async (job: Job<{ runId: string }>) => {
    console.log(`[AgentRunWorker] Starting run: ${job.data.runId}`);
    try {
      await executeAgentRun(job.data.runId);
      console.log(`[AgentRunWorker] Run completed: ${job.data.runId}`);
    } catch (error: any) {
      console.error(`[AgentRunWorker] Run failed: ${job.data.runId}`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 1, // Run sequentially for MVP
  }
);

agentRunWorker.on('failed', (job, err) => {
  console.error(`AgentRun job ${job?.id} failed:`, err);
});
