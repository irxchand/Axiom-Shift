export interface TimeWindow {
  startTime: Date;
  endTime: Date;
}

export interface StudyTask {
  taskId: string;
  subjectId: string;
  title: string;
  estimatedMinutes: number;
  reason: string;
}

export interface StudyBlock {
  taskId: string;
  window: TimeWindow;
}

export interface PlanningContext {
  freeWindows: TimeWindow[];
  existingClasses: TimeWindow[];
  tasks: StudyTask[];
}