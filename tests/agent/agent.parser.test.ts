import { parseAgentResponse, generateRepairPrompt } from '../../agents/runner/agent.parser';
import { AgentParsingError } from '../../shared/agent-schemas/agent.envelope';

describe('Phase 5: Rigorous Agent Parser and Repair Protocol', () => {
  it('should parse a perfectly formatted JSON response', () => {
    const raw = `{ "status": "SUCCEEDED", "confidence": 0.95, "evidence": [], "output": {}, "proposedCommands": [], "warnings": [] }`;
    const parsed = parseAgentResponse(raw);
    expect(parsed.status).toBe('SUCCEEDED');
    expect(parsed.confidence).toBe(0.95);
  });

  it('should extract JSON even when surrounded by conversational text and markdown', () => {
    const raw = `
      Hello! I have analyzed the student's request. Here is the output:
      \`\`\`json
      {
        "status": "NEEDS_INPUT",
        "confidence": 1.0,
        "evidence": [],
        "output": {},
        "proposedCommands": [],
        "warnings": ["Missing schedule"]
      }
      \`\`\`
      Let me know if you need anything else!
    `;
    const parsed = parseAgentResponse(raw);
    expect(parsed.status).toBe('NEEDS_INPUT');
  });

  it('should throw an AgentParsingError if no JSON braces are found', () => {
    const raw = `I am sorry, I cannot fulfill that request right now.`;
    expect(() => parseAgentResponse(raw)).toThrow(AgentParsingError);
    expect(() => parseAgentResponse(raw)).toThrow('No JSON object found');
  });

  it('should throw an AgentParsingError if the extracted JSON is malformed', () => {
    const raw = `Here it is: { "status": "SUCCEEDED", "confidence": 0.95, missing_quotes_and_brackets }`;
    expect(() => parseAgentResponse(raw)).toThrow(AgentParsingError);
    expect(() => parseAgentResponse(raw)).toThrow('Invalid JSON structure');
  });

  it('should throw an error if the status is not a valid enum', () => {
    const raw = `{ "status": "ALL_GOOD", "confidence": 0.99 }`;
    expect(() => parseAgentResponse(raw)).toThrow(AgentParsingError);
    expect(() => parseAgentResponse(raw)).toThrow('Invalid or missing status field');
  });

  it('should throw an error if confidence is a string instead of a number', () => {
    const raw = `{ "status": "SUCCEEDED", "confidence": "0.99" }`;
    expect(() => parseAgentResponse(raw)).toThrow(AgentParsingError);
    expect(() => parseAgentResponse(raw)).toThrow('Missing or invalid confidence field');
  });

  it('should generate a strict repair prompt', () => {
    const prompt = generateRepairPrompt('Invalid JSON structure.');
    expect(prompt).toContain('SYSTEM OVERRIDE');
    expect(prompt).toContain('Invalid JSON structure.');
  });
});