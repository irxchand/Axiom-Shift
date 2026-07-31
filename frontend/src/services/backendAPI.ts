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
    callAPI('/api/v1/notifications/briefing', mockBackendAPI.getAIBriefing),
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
    callAPI('/api/v1/notifications', mockBackendAPI.getNotifications),
  getSourceDocuments: (): Promise<SourceDocumentDTO[]> =>
    callAPI('/api/sourceDocuments', mockBackendAPI.getSourceDocuments),
  getAcademicEvents: (): Promise<AcademicEventDTO[]> =>
    callAPI('/api/academicEvents', mockBackendAPI.getAcademicEvents),
  getStudyTasks: (): Promise<StudyTaskDTO[]> =>
    callAPI('/api/studyTasks', mockBackendAPI.getStudyTasks),
  getSgpaScenarios: async (subjectId: string, targetPercent: number): Promise<any> => {
    return callAPI(`/api/v1/grades/sgpa-scenarios?targets={"${subjectId}":${targetPercent}}`, async () => ({}));
  },
  triggerAgentChat: async (agentId: string, prompt: string, files?: { name: string, data: string }[]): Promise<{ runId: string; status: string }> => {
    const resp = await fetch('/api/v1/chat/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer test-user-id"
      },
      body: JSON.stringify({ agentId, prompt, files })
    });
    if (!resp.ok) throw new Error('Failed to start agent chat');
    const json = await resp.json();
    return json.data;
  },
  getAgentRun: async (runId: string): Promise<any> => {
    const resp = await fetch(`/api/v1/agent-runs/${runId}`, {
      headers: {
        Authorization: "Bearer test-user-id"
      }
    });
    if (!resp.ok) throw new Error('Failed to fetch agent run');
    const json = await resp.json();
    return json.data;
  },
  generatePlan: async (): Promise<any> => {
    const resp = await fetch('/api/v1/plans/generate', {
      method: 'POST',
      headers: {
        Authorization: "Bearer test-user-id"
      }
    });
    if (!resp.ok) throw new Error('Failed to generate plan');
    const json = await resp.json();
    return json.data;
  },
  getCurrentPlan: async (): Promise<any> => {
    const resp = await fetch('/api/v1/plans/current', {
      headers: {
        Authorization: "Bearer test-user-id"
      }
    });
    if (!resp.ok) throw new Error('Failed to fetch current plan');
    const json = await resp.json();
    return json.data;
  },
  acceptPlan: async (planId: string): Promise<any> => {
    const resp = await fetch(`/api/v1/plans/${planId}/accept`, {
      method: 'POST',
      headers: {
        Authorization: "Bearer test-user-id"
      }
    });
    if (!resp.ok) throw new Error('Failed to accept plan');
    const json = await resp.json();
    return json.data;
  },
  getState: async (): Promise<any> => {
    const resp = await fetch('/api/v1/state', {
      headers: {
        Authorization: "Bearer test-user-id"
      }
    });
    if (!resp.ok) throw new Error('Failed to fetch state');
    const json = await resp.json();
    return json.data;
  },
  initializeSemester: async (data: { name: string; timezone: string }): Promise<any> => {
    // Generate dates: Start date is today, end date is 6 months from today
    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
    
    const resp = await fetch('/api/v1/semesters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-user-id',
        'Idempotency-Key': crypto.randomUUID()
      },
      body: JSON.stringify({ ...data, startDate, endDate })
    });
    if (!resp.ok) throw new Error('Failed to initialize semester');
    const json = await resp.json();
    return json.data;
  }
};

