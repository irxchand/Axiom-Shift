import { 
  getMasterOrchestratorFallback,
  getInitializationAgentFallback,
  getEvaluationAgentFallback,
  getPlanningAgentFallback,
  getSourceWorkspaceAgentFallback 
} from '../../agents/runner/demo.fallbacks';
import { 
  validateAgentRouteDecision, 
  validateOnboardingPlan,
  validateStudyPlan 
} from '../../shared/agent-schemas/core-agents.types';
import { validateSourceWorkspaceQueryPlan } from '../../shared/agent-schemas/source-workspace.types';

describe('Phase 10: Full Roster Demo Hardening and Fallback Reliability', () => {
  
  it('Double-Strike Test 1: Orchestrator Fallback must pass strict validation', () => {
    let fallback = getMasterOrchestratorFallback();
    let decision = validateAgentRouteDecision(fallback.output);
    expect(decision.targetAgent).toBe('DIRECT_ANSWER');
    
    fallback = getMasterOrchestratorFallback();
    decision = validateAgentRouteDecision(fallback.output);
    expect(fallback.warnings).toContain('Demo fallback triggered.');
  });

  it('Double-Strike Test 2: Initialization Agent Fallback must pass strict validation', () => {
    let fallback = getInitializationAgentFallback();
    let plan = validateOnboardingPlan(fallback.output);
    expect(plan.isComplete).toBe(false);
    
    fallback = getInitializationAgentFallback();
    plan = validateOnboardingPlan(fallback.output);
    expect(plan.missingFields).toContain('timetable');
  });

  it('Double-Strike Test 3: Evaluation Agent Fallback must maintain structural integrity', () => {
    let fallback = getEvaluationAgentFallback();
    expect(fallback.output).toHaveProperty('academicSummary');
    expect(fallback.output).toHaveProperty('riskDrivers');
    
    fallback = getEvaluationAgentFallback();
    expect(fallback.output.recommendedFocus).toContain('Calculus 3');
  });

  it('Double-Strike Test 4: Planning Agent Fallback must pass strict validation', () => {
    let fallback = getPlanningAgentFallback();
    let plan = validateStudyPlan(fallback.output);
    expect(plan.tasks.length).toBe(1);
    
    fallback = getPlanningAgentFallback();
    plan = validateStudyPlan(fallback.output);
    expect(plan.tasks[0].subjectId).toBe('sub_math');
  });

  it('Double-Strike Test 5: Source Workspace Fallback must pass strict validation', () => {
    let fallback = getSourceWorkspaceAgentFallback();
    let queryPlan = validateSourceWorkspaceQueryPlan(fallback.output, fallback.status);
    expect(queryPlan.fallbackAction).toBeDefined();
    
    fallback = getSourceWorkspaceAgentFallback();
    queryPlan = validateSourceWorkspaceQueryPlan(fallback.output, fallback.status);
    expect(fallback.status).toBe('FAILED');
  });
});