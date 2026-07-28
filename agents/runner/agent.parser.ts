import { AgentRunResponse, AgentParsingError } from '../../shared/agent-schemas/agent.envelope';

export function parseAgentResponse(rawText: string): AgentRunResponse {
  let cleanText = rawText.trim();

  // Find the boundaries of the JSON object
  const startIndex = cleanText.indexOf('{');
  const endIndex = cleanText.lastIndexOf('}');

  if (startIndex === -1 || endIndex === -1) {
    throw new AgentParsingError('No JSON object found in response.');
  }

  // Extract only the core object
  cleanText = cleanText.substring(startIndex, endIndex + 1);

  let parsed: any;
  try {
    parsed = JSON.parse(cleanText);
  } catch (error) {
    throw new AgentParsingError('Invalid JSON structure. The response could not be parsed.');
  }

  // Enforce the envelope with strict type checking
  const validStatuses = ['SUCCEEDED', 'FAILED', 'NEEDS_INPUT', 'PARTIAL'];
  if (!parsed.status || !validStatuses.includes(parsed.status)) {
    throw new AgentParsingError(`Invalid or missing status field. Must be one of: ${validStatuses.join(', ')}`);
  }
  
  if (typeof parsed.confidence !== 'number') {
    throw new AgentParsingError('Missing or invalid confidence field. Must be a number.');
  }

  return parsed as AgentRunResponse;
}

export function generateRepairPrompt(errorMessage: string): string {
  return `SYSTEM OVERRIDE: Your previous response failed validation with the following error: "${errorMessage}". Do not apologize. Do not explain. Do not use conversational text. Return ONLY the requested JSON schema.`;
}