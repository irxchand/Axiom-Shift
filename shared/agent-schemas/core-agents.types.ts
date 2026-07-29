export interface AgentRouteDecision {
  intent: string;
  targetAgent: 'initialization-agent' | 'evaluation-agent' | 'planning-agent' | 'source-workspace-agent' | 'DIRECT_ANSWER';
  rationale: string;
  forwardedContext: Record<string, any>;
}

export interface OnboardingPlan {
  capturedFields: Record<string, any>;
  missingFields: string[];
  nextPrompt: string;
  isComplete: boolean;
}

export interface EvaluationInsight {
  academicSummary: string;
  riskDrivers: string[];
  recommendedFocus: string;
  scenarioProjections?: Record<string, string>;
}

export interface StudyPlan {
  planId: string;
  horizonDays: number;
  tasks: Array<{
    title: string;
    subjectId: string;
    estimatedMinutes: number;
    reason: string;
  }>;
  studyBlocks: Array<{
    day: string;
    timeWindow: string;
    taskId: string;
  }>;
}

export function validateAgentRouteDecision(output: any): AgentRouteDecision {
  const validTargets = [
    'initialization-agent', 
    'evaluation-agent', 
    'planning-agent', 
    'source-workspace-agent', 
    'DIRECT_ANSWER'
  ];
  
  if (!output || typeof output !== 'object') {
    throw new Error('Output must be a valid JSON object.');
  }
  
  if (!validTargets.includes(output.targetAgent)) {
    throw new Error(`Hallucination Detected: Invalid targetAgent '${output.targetAgent}'. Must be one of the approved agents or DIRECT_ANSWER.`);
  }
  
  return output as AgentRouteDecision;
}

export function validateStudyPlan(output: any): StudyPlan {
  if (!output || typeof output !== 'object') {
    throw new Error('Output must be a valid JSON object.');
  }

  if (!Array.isArray(output.tasks) || !Array.isArray(output.studyBlocks)) {
    throw new Error('StudyPlan must contain both tasks and studyBlocks arrays.');
  }

  if (output.tasks.length > 0) {
    const sampleTask = output.tasks[0];
    if (typeof sampleTask.title !== 'string' || typeof sampleTask.subjectId !== 'string') {
      throw new Error('Task hallucination: Tasks must contain a valid title and subjectId string.');
    }
  }

  return output as StudyPlan;
}

export function validateOnboardingPlan(output: any): OnboardingPlan {
  if (!output || typeof output !== 'object') {
    throw new Error('Output must be a valid JSON object.');
  }

  if (!Array.isArray(output.missingFields)) {
    throw new Error('missingFields must be an explicitly defined array, even if empty.');
  }

  if (typeof output.isComplete !== 'boolean') {
    throw new Error('Malicious roleplay or hallucination detected: isComplete MUST be a strict boolean.');
  }

  return output as OnboardingPlan;
}