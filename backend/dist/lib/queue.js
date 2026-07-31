import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from './env.js';
// Reuse the redis connection or create a dedicated one for BullMQ
const connection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // BullMQ requirement
});
export const documentHandoffQueue = new Queue('document_handoff', {
    connection,
});
export const agentRunQueue = new Queue('agent_run', {
    connection,
});
//# sourceMappingURL=queue.js.map