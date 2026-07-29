import { AppNotification, NotificationType, NotificationSeverity } from './notifications.types';
import { Assessment } from '../evaluation/evaluation.types';

// The Silencer: Drops duplicate notifications based on dedupeKey and time window
export function filterDuplicates(
  proposed: AppNotification[],
  sentHistory: AppNotification[],
  cooldownMs: number = 24 * 60 * 60 * 1000 // Default 24 hour cooldown
): AppNotification[] {
  const now = Date.now();
  
  return proposed.filter(p => {
    const lastSent = sentHistory
      .filter(h => h.dedupeKey === p.dedupeKey)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (!lastSent) return true; // Never sent before

    const timeSinceSent = now - lastSent.timestamp.getTime();
    return timeSinceSent > cooldownMs; // Only allow if cooldown has passed
  });
}

// The Watchtower: Triggers for 48-hour assessment warnings
export function evaluateAssessmentDeadlines(assessments: Assessment[], now: Date): AppNotification[] {
  const notifications: AppNotification[] = [];
  const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

  for (const asst of assessments) {
    if (!asst.dueDate || asst.isCompleted) continue;

    const timeRemaining = asst.dueDate.getTime() - now.getTime();

    if (timeRemaining > 0 && timeRemaining <= FORTY_EIGHT_HOURS_MS) {
      notifications.push({
        id: `notif_asst_${asst.id}_${now.getTime()}`,
        type: 'ASSESSMENT_DEADLINE',
        severity: 'CRITICAL',
        title: 'Impending Deadline',
        message: `${asst.name} is due in less than 48 hours.`,
        dedupeKey: `deadline_48h_${asst.id}`,
        timestamp: now
      });
    }
  }

  return notifications;
}

// The Watchtower: Triggers for Risk Elevations to HIGH or CRITICAL
export function evaluateRiskElevations(
  riskDeltas: Array<{ subjectId: string; subjectName: string; previous: string; current: string }>,
  now: Date
): AppNotification[] {
  const notifications: AppNotification[] = [];

  for (const delta of riskDeltas) {
    if (
      (delta.current === 'HIGH' || delta.current === 'CRITICAL') && 
      delta.previous !== delta.current
    ) {
      notifications.push({
        id: `notif_risk_${delta.subjectId}_${now.getTime()}`,
        type: 'RISK_ELEVATION',
        severity: delta.current === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
        title: 'Risk Elevated',
        message: `${delta.subjectName} risk has increased to ${delta.current}.`,
        dedupeKey: `risk_elevation_${delta.subjectId}_${delta.current}`,
        timestamp: now
      });
    }
  }

  return notifications;
}