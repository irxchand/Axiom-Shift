// src/services/backendAPI.ts
import { mockBackendAPI } from './api';
import type {
  CurrentClassDTO,
  NextClassDTO,
  AcademicOverviewDTO,
  AIBriefingDTO,
  BackendRiskOverviewDTO,
  Semester3DNodeDTO,
  TimetableSlotDTO,
  SubjectDTO,
  KnowledgeConceptNodeDTO,
  GradeCardDTO,
  WorkspaceConnectionDTO,
  NotificationItemDTO,
  SourceDocumentDTO,
  AcademicEventDTO,
  StudyTaskDTO,
} from '../types/dto';

// Generic helper to attempt API fetch, falling back to mock provider if network/404 fails
async function callAPI<T>(url: string, fallbackFn: () => Promise<T>): Promise<T> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return (await resp.json()) as T;
  } catch {
    return await fallbackFn();
  }
}

export const backendAPI = {
  getCurrentClass: (): Promise<CurrentClassDTO> =>
    callAPI('/api/currentClass', mockBackendAPI.getCurrentClass),
  getNextClass: (): Promise<NextClassDTO> =>
    callAPI('/api/nextClass', mockBackendAPI.getNextClass),
  getAcademicOverview: (): Promise<AcademicOverviewDTO> =>
    callAPI('/api/academicOverview', mockBackendAPI.getAcademicOverview),
  getAIBriefing: (): Promise<AIBriefingDTO> =>
    callAPI('/api/aiBriefing', mockBackendAPI.getAIBriefing),
  getBackendRiskOverview: (): Promise<BackendRiskOverviewDTO> =>
    callAPI('/api/riskOverview', mockBackendAPI.getBackendRiskOverview),
  getSemester3DNodes: (): Promise<Semester3DNodeDTO[]> =>
    callAPI('/api/semester3DNodes', mockBackendAPI.getSemester3DNodes),
  getTimetableSlots: (): Promise<TimetableSlotDTO[]> =>
    callAPI('/api/timetableSlots', mockBackendAPI.getTimetableSlots),
  getSubjects: (): Promise<SubjectDTO[]> =>
    callAPI('/api/subjects', mockBackendAPI.getSubjects),
  getKnowledgeConcepts: (subjectCode: string): Promise<KnowledgeConceptNodeDTO[]> =>
    callAPI(`/api/subjects/${subjectCode}/concepts`, () => mockBackendAPI.getKnowledgeConcepts(subjectCode)),
  getGradeCards: (): Promise<GradeCardDTO[]> =>
    callAPI('/api/gradeCards', mockBackendAPI.getGradeCards),
  getWorkspaceStatus: (): Promise<WorkspaceConnectionDTO> =>
    callAPI('/api/workspace', mockBackendAPI.getWorkspaceStatus),
  getNotifications: (): Promise<NotificationItemDTO[]> =>
    callAPI('/api/notifications', mockBackendAPI.getNotifications),
  getSourceDocuments: (): Promise<SourceDocumentDTO[]> =>
    callAPI('/api/sourceDocuments', mockBackendAPI.getSourceDocuments),
  getAcademicEvents: (): Promise<AcademicEventDTO[]> =>
    callAPI('/api/academicEvents', mockBackendAPI.getAcademicEvents),
  getStudyTasks: (): Promise<StudyTaskDTO[]> =>
    callAPI('/api/studyTasks', mockBackendAPI.getStudyTasks),
};

