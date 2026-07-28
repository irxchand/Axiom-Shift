// The payload we send into the chat
export interface AgentTaskEnvelope {
  agentTask: {
    runId: string;
    agentId: string;
    schemaVersion: string;
    instruction: string;
    stateSummary: Record<string, any>; // The absolute truth of the academic state
    outputContract: {
      format: 'json';
      schemaName: string;
    };
  };
}

// The exact structure the AI MUST return
export interface AgentRunResponse {
  status: 'SUCCEEDED' | 'FAILED' | 'NEEDS_INPUT' | 'PARTIAL';
  confidence: number;
  evidence: Array<{ type: string; id: string }>;
  output: Record<string, any>;
  proposedCommands: Array<{ command: string; payload: any }>;
  warnings: string[];
}

export class AgentParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentParsingError';
  }
}