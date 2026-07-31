import { ZodSchema } from 'zod';
import { BrowserFrameworkAdapter } from '../adapters/BrowserFrameworkAdapter.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function executeAgentRun(runId: string) {
  const run = await prisma.agentRun.findUnique({ where: { id: runId } });
  if (!run) throw new Error(`AgentRun ${runId} not found`);

  const startTime = Date.now();
  const adapter = new BrowserFrameworkAdapter();
  
  try {
    const payload = run.taskPayload as any;
    const prompt = typeof payload === 'object' && payload !== null ? payload.prompt || '' : '';
    const filePaths = typeof payload === 'object' && payload !== null ? payload.filePaths || [] : [];

    const response = await adapter.execute<{ message: string }>({
      action: 'SEND_CHAT',
      chatUrl: run.chatUrl,
      payload: { prompt, filePaths },
      headless: false
    } as any);

    const rawText = response.data?.message || '';

    // If it's the initialization agent, try to parse it as JSON
    let structuredData = null;
    if (run.agentId === 'initialization-agent') {
      try {
        const jsonStart = rawText.indexOf('{');
        const jsonEnd = rawText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          structuredData = JSON.parse(rawText.slice(jsonStart, jsonEnd + 1));
        }
      } catch (e) {
        console.warn("Failed to parse agent JSON response", e);
      }
    }

    await prisma.agentRun.update({
      where: { id: run.id },
      data: {
        status: 'SUCCESS',
        rawResponse: rawText,
        structuredData: structuredData as any,
        executionMs: Date.now() - startTime,
        retryCount: 0
      }
    });

    return structuredData || rawText;
  } catch (error: any) {
    await prisma.agentRun.update({
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

export class AgentRunner {
  constructor(
    private prismaClient: PrismaClient = prisma,
    private adapter: BrowserFrameworkAdapter = new BrowserFrameworkAdapter()
  ) {}

  async runAgentTask<T>(params: {
    userId: string;
    agentId: string;
    chatUrl: string;
    taskPrompt: string;
    schema: ZodSchema<T>;
  }): Promise<T> {
    const run = await this.prismaClient.agentRun.create({
      data: {
        userId: params.userId,
        agentId: params.agentId,
        chatUrl: params.chatUrl,
        taskPayload: { prompt: params.taskPrompt },
        status: 'PENDING'
      }
    });

    const startTime = Date.now();

    // Primary Execution
    let response = await this.adapter.execute<{ message: string }>({
      action: 'SEND_CHAT',
      chatUrl: params.chatUrl,
      payload: { prompt: params.taskPrompt }
    });

    let rawText = response.data?.message || '';
    let parsedResult = this.tryParseAndValidate(rawText, params.schema);

    // Repair Step (Single Retry)
    if (!parsedResult.success) {
      const repairPrompt = `Your previous output failed schema validation.\nError: ${parsedResult.error}\nRespond ONLY with valid JSON matching the schema.`;
      
      response = await this.adapter.execute<{ message: string }>({
        action: 'SEND_CHAT',
        chatUrl: params.chatUrl,
        payload: { prompt: repairPrompt }
      });

      rawText = response.data?.message || '';
      parsedResult = this.tryParseAndValidate(rawText, params.schema);

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

    await this.prismaClient.agentRun.update({
      where: { id: run.id },
      data: {
        status: parsedResult.wasRepaired ? 'REPAIRED' : 'SUCCESS',
        rawResponse: rawText,
        structuredData: parsedResult.data as any,
        executionMs: Date.now() - startTime,
        retryCount: parsedResult.wasRepaired ? 1 : 0
      }
    });

    return parsedResult.data!;
  }

  private tryParseAndValidate<T>(text: string, schema: ZodSchema<T>) {
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      const jsonString = jsonStart !== -1 && jsonEnd !== -1 ? text.slice(jsonStart, jsonEnd + 1) : text;
      
      const parsed = JSON.parse(jsonString);
      const validated = schema.parse(parsed);
      return { success: true, data: validated, wasRepaired: false, error: null };
    } catch (err: any) {
      return { success: false, data: null, wasRepaired: true, error: err.message };
    }
  }
}