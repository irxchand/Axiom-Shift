export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type NotificationType = 'ASSESSMENT_DEADLINE' | 'RISK_ELEVATION' | 'WORKSPACE_ERROR' | 'TASK_REMINDER';

export interface AppNotification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  dedupeKey: string;
  timestamp: Date;
}

export interface BriefingClass {
  subjectName: string;
  startTime: Date;
  endTime: Date;
  room: string;
}

export interface BriefingPriority {
  taskId: string;
  title: string;
  reason: string;
}

export interface DailyBriefing {
  currentClass: BriefingClass | null;
  nextClass: BriefingClass | null;
  topPriorities: BriefingPriority[];
  upcomingAssessments: Array<{ name: string; daysRemaining: number }>;
  riskChanges: Array<{ subjectName: string; previous: string; current: string }>;
  recommendedAction: string;
}