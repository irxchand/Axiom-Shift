import { z } from 'zod';
import { BrowserFrameworkAdapter } from '../adapters/BrowserFrameworkAdapter.js';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs/promises';
import path from 'node:path';
import { agentRunQueue } from '../lib/queue.js';
const prisma = new PrismaClient();
export async function executeAgentRun(runId) {
    const runner = new AgentRunner();
    return runner.executeExistingRun(runId);
}
export class AgentRunner {
    prismaClient;
    adapter;
    constructor(prismaClient = prisma, adapter = new BrowserFrameworkAdapter()) {
        this.prismaClient = prismaClient;
        this.adapter = adapter;
    }
    async executeExistingRun(runId, schema = z.any()) {
        const run = await this.prismaClient.agentRun.findUnique({ where: { id: runId } });
        if (!run)
            throw new Error(`AgentRun ${runId} not found`);
        const startTime = Date.now();
        const taskPayload = run.taskPayload;
        try {
            let response = await this.adapter.execute({
                action: 'SEND_CHAT',
                chatUrl: run.chatUrl,
                payload: { prompt: taskPayload.prompt }
            });
            let rawText = response.data?.message || '';
            let parsedResult = this.tryParseAndValidate(rawText, schema);
            if (!parsedResult.success) {
                const repairPrompt = `Your previous output failed schema validation.\nError: ${parsedResult.error}\nRespond ONLY with valid JSON matching the schema.`;
                response = await this.adapter.execute({
                    action: 'SEND_CHAT',
                    chatUrl: run.chatUrl,
                    payload: { prompt: repairPrompt }
                });
                rawText = response.data?.message || '';
                parsedResult = this.tryParseAndValidate(rawText, schema);
                if (!parsedResult.success) {
                    await this.prismaClient.agentRun.update({
                        where: { id: run.id },
                        data: {
                            status: 'FAILED',
                            rawResponse: rawText,
                            executionMs: Date.now() - startTime,
                            retryCount: 1
                        }
                    });
                    throw new Error(`Agent run failed schema validation: ${parsedResult.error}`);
                }
            }
            let nextRunId = null;
            if (parsedResult.success && parsedResult.data?.routing?.action === 'ROUTE_TO_AGENT' && parsedResult.data.routing.target) {
                const registryPath = path.resolve('../configs/agents.registry.json');
                const data = await fs.readFile(registryPath, 'utf8');
                const registry = JSON.parse(data);
                const targetAgent = registry.agents.find((a) => a.agentId === parsedResult.data.routing.target);
                if (targetAgent) {
                    const newRun = await this.prismaClient.agentRun.create({
                        data: {
                            userId: run.userId,
                            agentId: targetAgent.agentId,
                            chatUrl: targetAgent.chatUrl,
                            taskPayload: { prompt: parsedResult.data.routing.contextData || 'Please continue.' },
                            status: 'PENDING'
                        }
                    });
                    await agentRunQueue.add('agent_run', { runId: newRun.id });
                    nextRunId = newRun.id;
                    parsedResult.data.routing.nextRunId = nextRunId;
                }
            }
            await this.prismaClient.agentRun.update({
                where: { id: run.id },
                data: {
                    status: parsedResult.wasRepaired ? 'REPAIRED' : 'SUCCESS',
                    rawResponse: rawText,
                    structuredData: parsedResult.data,
                    executionMs: Date.now() - startTime,
                    retryCount: parsedResult.wasRepaired ? 1 : 0
                }
            });
            return parsedResult.data;
        }
        catch (error) {
            await this.prismaClient.agentRun.update({
                where: { id: run.id },
                data: {
                    status: 'FAILED',
                    rawResponse: error.message,
                    executionMs: Date.now() - startTime,
                }
            });
            throw error;
        }
    }
    async runAgentTask(params) {
        const run = await this.prismaClient.agentRun.create({
            data: {
                userId: params.userId,
                agentId: params.agentId,
                chatUrl: params.chatUrl,
                taskPayload: { prompt: params.taskPrompt },
                status: 'PENDING'
            }
        });
        return this.executeExistingRun(run.id, params.schema);
    }
    tryParseAndValidate(text, schema) {
        try {
            const jsonStart = text.indexOf('{');
            const jsonEnd = text.lastIndexOf('}');
            const jsonString = jsonStart !== -1 && jsonEnd !== -1 ? text.slice(jsonStart, jsonEnd + 1) : text;
            const parsed = JSON.parse(jsonString);
            const validated = schema.parse(parsed);
            return { success: true, data: validated, wasRepaired: false, error: null };
        }
        catch (err) {
            return { success: false, data: null, wasRepaired: true, error: err.message };
        }
    }
}
//# sourceMappingURL=agentRunner.js.map