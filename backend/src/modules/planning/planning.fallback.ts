import { Assessment, RiskProfile } from '../evaluation/evaluation.types';

export interface PlanningSubjectContext {
  subjectId: string;
  subjectName: string;
  risk: RiskProfile;
  upcomingAssessments: Assessment[];
  marksLost: number;
}

export function rankSubjectsByUrgency(subjects: PlanningSubjectContext[]): PlanningSubjectContext[] {
  const riskWeight: Record<string, number> = {
    'CRITICAL': 4,
    'HIGH': 3,
    'MEDIUM': 2,
    'LOW': 1
  };

  return [...subjects].sort((a, b) => {
    // 1. Sort by absolute risk severity first
    const riskDiff = riskWeight[b.risk.severity] - riskWeight[a.risk.severity];
    if (riskDiff !== 0) return riskDiff;

    // 2. Tie-breaker: Nearest upcoming assessment deadline
    const getNearestDeadline = (sub: PlanningSubjectContext) => {
      const future = sub.upcomingAssessments
        .filter(asst => asst.dueDate && asst.dueDate.getTime() > Date.now())
        .map(asst => asst.dueDate!.getTime());
      return future.length > 0 ? Math.min(...future) : Infinity;
    };

    const deadlineA = getNearestDeadline(a);
    const deadlineB = getNearestDeadline(b);
    if (deadlineA !== deadlineB) return deadlineA - deadlineB;

    // 3. Final Tie-breaker: Most marks lost historically
    return (b.marksLost || 0) - (a.marksLost || 0);
  });
}

export function generateDeterministicReason(subject: PlanningSubjectContext): string {
  let reason = `Subject is at ${subject.risk.severity} risk.`;
  if (subject.marksLost > 0) {
    reason += ` You have a deficit of ${subject.marksLost} marks.`;
  }
  if (subject.risk.drivers && subject.risk.drivers.length > 0) {
    reason += ` Primary driver: ${subject.risk.drivers[0]}`;
  }
  return reason.trim();
}