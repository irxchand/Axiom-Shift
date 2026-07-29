export interface StudyTaskInput {
  subjectId?: string | null;
  title: string;
  reason: string;
  evidenceRefs?: any[];
  startAt: string | Date;
  endAt: string | Date;
}

export interface PlanGenerationRequest {
  userId: string;
  semesterId: string;
  title?: string;
  tasks: StudyTaskInput[];
}