import { parseAgentResponse } from '../../agents/runner/agent.parser';
import { validateSourceWorkspaceQueryPlan, SchemaValidationError } from '../../shared/agent-schemas/source-workspace.types';

describe('Phase 6: Rigorous Source Workspace Agent Validation', () => {
  it('should successfully parse and validate a perfect query plan', () => {
    const raw = `{
      "status": "SUCCEEDED",
      "confidence": 0.98,
      "evidence": [],
      "output": {
        "subjectId": "sub_os",
        "query": "Explain semaphores.",
        "rationale": "User asked about OS synchronization.",
        "requiresCitations": true
      },
      "proposedCommands": [],
      "warnings": []
    }`;
    
    const parsed = parseAgentResponse(raw);
    const validOutput = validateSourceWorkspaceQueryPlan(parsed.output, parsed.status);
    
    expect(parsed.status).toBe('SUCCEEDED');
    expect(validOutput.subjectId).toBe('sub_os');
    expect(validOutput.requiresCitations).toBe(true);
  });

  it('should successfully validate a graceful degradation fallback', () => {
    const raw = `{
      "status": "FAILED",
      "confidence": 1.0,
      "evidence": [],
      "output": {
        "subjectId": "sub_dcds",
        "query": "",
        "rationale": "Workspace mapping shows DISCONNECTED state.",
        "requiresCitations": false,
        "fallbackAction": "Please manually check your notes or reconnect the DCDS workspace."
      },
      "proposedCommands": [],
      "warnings": ["Source workspace is disconnected"]
    }`;
    
    const parsed = parseAgentResponse(raw);
    const validOutput = validateSourceWorkspaceQueryPlan(parsed.output, parsed.status);
    
    expect(parsed.status).toBe('FAILED');
    expect(validOutput.fallbackAction).toContain('reconnect');
  });

  it('should throw SchemaValidationError if subjectId is missing', () => {
    const raw = `{
      "status": "SUCCEEDED",
      "confidence": 0.9,
      "evidence": [],
      "output": {
        "query": "What is a matrix?",
        "rationale": "Math question",
        "requiresCitations": true
      },
      "proposedCommands": [],
      "warnings": []
    }`;
    const parsed = parseAgentResponse(raw);
    expect(() => validateSourceWorkspaceQueryPlan(parsed.output, parsed.status)).toThrow(SchemaValidationError);
    expect(() => validateSourceWorkspaceQueryPlan(parsed.output, parsed.status)).toThrow('Missing or invalid subjectId');
  });

  it('should throw SchemaValidationError if requiresCitations is a string', () => {
    const raw = `{
      "status": "SUCCEEDED",
      "confidence": 0.9,
      "evidence": [],
      "output": {
        "subjectId": "sub_math",
        "query": "What is a matrix?",
        "rationale": "Math question",
        "requiresCitations": "true"
      },
      "proposedCommands": [],
      "warnings": []
    }`;
    const parsed = parseAgentResponse(raw);
    expect(() => validateSourceWorkspaceQueryPlan(parsed.output, parsed.status)).toThrow(SchemaValidationError);
    expect(() => validateSourceWorkspaceQueryPlan(parsed.output, parsed.status)).toThrow('strict boolean');
  });

  it('should throw SchemaValidationError if status is SUCCEEDED but query is empty', () => {
    const raw = `{
      "status": "SUCCEEDED",
      "confidence": 0.9,
      "evidence": [],
      "output": {
        "subjectId": "sub_math",
        "query": "",
        "rationale": "Forgot what to ask",
        "requiresCitations": true
      },
      "proposedCommands": [],
      "warnings": []
    }`;
    const parsed = parseAgentResponse(raw);
    expect(() => validateSourceWorkspaceQueryPlan(parsed.output, parsed.status)).toThrow(SchemaValidationError);
    expect(() => validateSourceWorkspaceQueryPlan(parsed.output, parsed.status)).toThrow('requires a non-empty query string');
  });

  it('should throw SchemaValidationError if status is FAILED but fallbackAction is missing', () => {
    const raw = `{
      "status": "FAILED",
      "confidence": 0.9,
      "evidence": [],
      "output": {
        "subjectId": "sub_math",
        "query": "",
        "rationale": "Workspace is down",
        "requiresCitations": false
      },
      "proposedCommands": [],
      "warnings": []
    }`;
    const parsed = parseAgentResponse(raw);
    expect(() => validateSourceWorkspaceQueryPlan(parsed.output, parsed.status)).toThrow(SchemaValidationError);
    expect(() => validateSourceWorkspaceQueryPlan(parsed.output, parsed.status)).toThrow('requires a clear fallbackAction');
  });
});