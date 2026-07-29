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
    const resp = await fetch(url, {
      headers: {
        Authorization: "Bearer test-user-id"
      }
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    return json.data !== undefined ? (json.data as T) : (json as T);
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
  getBackendRiskOverview: async (): Promise<BackendRiskOverviewDTO> => {
    try {
      const risks: any[] = await callAPI('/api/v1/risk', async () => []);
      if (!risks || risks.length === 0) return mockBackendAPI.getBackendRiskOverview();
      
      const highestSeverity = risks.some(r => r.severity === 'CRITICAL' || r.severity === 'HIGH') ? 'HIGH_RISK' : 
                              risks.some(r => r.severity === 'MEDIUM') ? 'MODERATE' : 'SAFE';
      
      return {
        overallRiskLevel: highestSeverity,
        backendRiskScore: risks.reduce((acc, r) => acc + (r.score || 0), 0) / risks.length || 0,
        estimatedSGPA: 8.5,
        estimatedCGPA: 8.5,
        riskFactors: risks.map(r => ({
          category: r.subjectId,
          impactScore: r.score,
          description: r.drivers?.join(', ') || 'No specific drivers',
        })),
        requiredMarksDTO: []
      };
    } catch {
      return mockBackendAPI.getBackendRiskOverview();
    }
  },
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
  getSgpaScenarios: async (subjectId: string, targetPercent: number): Promise<any> => {
    return callAPI(`/api/v1/grades/sgpa-scenarios?targets={"${subjectId}":${targetPercent}}`, async () => ({}));
  }
};

