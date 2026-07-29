import { DailyBriefing, BriefingClass, BriefingPriority } from './notifications.types';

export function synthesizeDailyBriefing(
  classesToday: BriefingClass[],
  allPriorities: BriefingPriority[],
  assessments: Array<{ name: string; daysRemaining: number }>,
  riskChanges: Array<{ subjectName: string; previous: string; current: string }>,
  now: Date
): DailyBriefing {
  
  // Find current and next classes
  let currentClass: BriefingClass | null = null;
  let nextClass: BriefingClass | null = null;

  for (const c of classesToday) {
    if (now >= c.startTime && now <= c.endTime) {
      currentClass = c;
    } else if (now < c.startTime && (!nextClass || c.startTime < nextClass.startTime)) {
      nextClass = c;
    }
  }

  // Enforce max 3 priorities
  const topPriorities = allPriorities.slice(0, 3);

  // Generate a singular deterministic recommended action
  let recommendedAction = "Review today's notes and maintain your schedule.";
  if (assessments.some(a => a.daysRemaining <= 2)) {
    recommendedAction = "Immediate Focus Required: Shift all available time to the impending assessment.";
  } else if (riskChanges.some(r => r.current === 'CRITICAL')) {
    recommendedAction = "Crisis Mitigation: Contact faculty or utilize Source Workspace to address CRITICAL knowledge gaps.";
  } else if (topPriorities.length > 0) {
    recommendedAction = `Start your session with Priority 1: ${topPriorities[0].title}.`;
  }

  return {
    currentClass,
    nextClass,
    topPriorities,
    upcomingAssessments: assessments.filter(a => a.daysRemaining >= 0 && a.daysRemaining <= 14), // Only show next 14 days
    riskChanges,
    recommendedAction
  };
}