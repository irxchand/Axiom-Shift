import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';
import { AppError } from '../lib/errors.js';
import { agentRunQueue } from '../lib/queue.js';
const CreateChatSchema = z.object({
    agentId: z.string(),
    prompt: z.string().min(1),
});
export default async function chatRoutes(app) {
    // Load registry inside memory
    let agentsRegistry = null;
    const loadRegistry = async () => {
        if (!agentsRegistry) {
            const registryPath = path.resolve('../configs/agents.registry.json');
            const data = await fs.readFile(registryPath, 'utf8');
            agentsRegistry = JSON.parse(data);
        }
        return agentsRegistry;
    };
    app.post('/api/v1/chat/messages', async (request, reply) => {
        const { agentId, prompt } = CreateChatSchema.parse(request.body);
        const registry = await loadRegistry();
        const agentDef = registry.agents.find((a) => a.agentId === agentId);
        if (!agentDef) {
            throw AppError.validation(`Unknown agent ID: ${agentId}`);
        }
        // Create AgentRun placeholder
        const run = await app.prisma.agentRun.create({
            data: {
                userId: request.userId,
                agentId: agentDef.agentId,
                chatUrl: agentDef.chatUrl,
                taskPayload: { prompt },
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
//# sourceMappingURL=chat.js.map