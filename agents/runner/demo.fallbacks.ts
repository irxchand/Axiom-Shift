import { AgentRunResponse } from '../../shared/agent-schemas/agent.envelope';

export function getMasterOrchestratorFallback(): AgentRunResponse {
  return {
    status: 'SUCCEEDED',
    confidence: 1.0,
    evidence: [],
    output: {
      intent: "System timeout override.",
      targetAgent: "DIRECT_ANSWER",
      rationale: "Network disruption detected. Reverting to static fallback.",
      forwardedContext: {}
    },
    proposedCommands: [
      { command: "SEND_MESSAGE", payload: "I am currently experiencing cognitive delay. Displaying static dashboard data." }
    ],
    warnings: ["Demo fallback triggered."]
  };
}

export function getInitializationAgentFallback(): AgentRunResponse {
  return {
    status: 'NEEDS_INPUT',
    confidence: 1.0,
    evidence: [],
    output: {
      capturedFields: { goals: "Maintain high SGPA" },
      missingFields: ["timetable", "currentMarks"],
      nextPrompt: "I have recorded your goals. Please provide your timetable to proceed.",
      isComplete: false
    },
    proposedCommands: [],
    warnings: ["Demo fallback triggered."]
  };
}

export function getEvaluationAgentFallback(): AgentRunResponse {
  return {
    status: 'SUCCEEDED',
    confidence: 1.0,
    evidence: [{ type: 'STATE_REF', id: 'sub_math' }],
    output: {
      academicSummary: "Calculus 3 is in a critical state due to a massive deficit.",
      riskDrivers: ["Required future average exceeds 90%."],
      recommendedFocus: "Shift all available study windows to Calculus 3.",
      scenarioProjections: { "Pass Scenario": "Requires perfect scores." }
    },
    proposedCommands: [],
    warnings: ["Demo fallback triggered."]
  };
}

export function getPlanningAgentFallback(): AgentRunResponse {
  return {
    status: 'SUCCEEDED',
    confidence: 1.0,
    evidence: [{ type: 'STATE_REF', id: 'sub_math' }],
    output: {
      planId: "demo_plan_01",
      horizonDays: 1,
      tasks: [
        { title: "Emergency Calc 3 Review", subjectId: "sub_math", estimatedMinutes: 120, reason: "Subject is CRITICAL risk." }
      ],
      studyBlocks: [
        { day: "Thursday", timeWindow: "14:00-16:00", taskId: "demo_task_01" }
      ]
    },
    proposedCommands: [],
    warnings: ["Demo fallback triggered."]
  };
}

export function getSourceWorkspaceAgentFallback(): AgentRunResponse {
  return {
    status: 'FAILED',
    confidence: 1.0,
    evidence: [],
    output: {
      subjectId: "sub_os",
      query: "",
      rationale: "Network disconnected during demo.",
      requiresCitations: false,
      fallbackAction: "Source workspace unreachable. Please check your manual notes."
    },
    proposedCommands: [],
    warnings: ["Demo fallback triggered."]
  };
}