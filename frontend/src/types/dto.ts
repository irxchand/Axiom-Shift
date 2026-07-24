// Backend DTO Contracts
// Frontend MUST NOT perform any score, SGPA, or risk calculations.
// All business logic calculations are strictly provided by the backend API.

export interface CurrentClassDTO {
  id: string;
  subjectCode: string;
  subjectName: string;
  classroom: string;
  facultyName: string;
  startTime: string; // ISO or HH:mm
  endTime: string;   // ISO or HH:mm
  progressPercent: number;
  remainingMinutes: number;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
}

export interface NextClassDTO {
  id: string;
  subjectCode: string;
  subjectName: string;
  classroom: string;
  facultyName: string;
  startsInMinutes: number;
  scheduledTime: string;
}

export interface AcademicOverviewDTO {
  completedAssignmentsCount: number;
  totalAssignmentsCount: number;
  assignmentCompletionPercent: number;
  daysUntilNextMajorExam: number;
  nextMajorExamName: string;
  nextMajorExamDate: string;
}

export interface AIBriefingDTO {
  systemStatus: 'OPTIMAL' | 'EVALUATING' | 'ACTION_REQUIRED';
  dailySummaryText: string;
  criticalAlerts: Array<{
    id: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    message: string;
    actionLabel: string;
  }>;
  suggestedActions: Array<{
    id: string;
    title: string;
    category: 'STUDY' | 'ASSIGNMENT' | 'PREPARATION';
    priorityScore: number;
    estimatedMinutes: number;
  }>;
}

export interface BackendRiskOverviewDTO {
  overallRiskLevel: 'SAFE' | 'MODERATE' | 'HIGH_RISK';
  backendRiskScore: number;
  estimatedSGPA: number;
  estimatedCGPA: number;
  riskFactors: Array<{
    category: string;
    impactScore: number;
    description: string;
  }>;
  requiredMarksDTO: Array<{
    subjectCode: string;
    subjectName: string;
    targetMarksForGradeA: number;
    currentMarksAccrued: number;
  }>;
}

export interface Semester3DNodeDTO {
  id: string;
  label: string;
  category: 'SUBJECT' | 'EXAM' | 'ASSIGNMENT' | 'MILESTONE';
  position: [number, number, number];
  status: 'SAFE' | 'WARNING' | 'CRITICAL' | 'COMPLETED';
  subjectCode?: string;
  dueDate?: string;
  weightagePercent?: number;
  details: string;
}

export interface TimetableSlotDTO {
  id: string;
  dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  startTime: string;
  endTime: string;
  subjectCode: string;
  subjectName: string;
  faculty: string;
  room: string;
  type: 'LECTURE' | 'LAB' | 'TUTORIAL';
  isCurrentSession?: boolean;
  isCompleted?: boolean;
}

export interface SubjectDTO {
  code: string;
  name: string;
  credits: number;
  faculty: string;
  syllabusProgressPercent: number;
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH';
  topics: Array<{
    id: string;
    title: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  }>;
  notesAvailableCount: number;
  assignmentsTotal: number;
  assignmentsSubmitted: number;
}

export interface KnowledgeConceptNodeDTO {
  id: string;
  subjectCode: string;
  title: string;
  category: string;
  masteryLevelPercent: number;
  status: 'MASTERED' | 'REVIEW_NEEDED' | 'LOCKED';
  position: [number, number, number];
  connectedConceptIds: string[];
}

export interface GradeCardDTO {
  subjectCode: string;
  subjectName: string;
  credits: number;
  obtainedScore: number;
  predictedGrade: string;
  backendRiskLevel: 'SAFE' | 'WARNING' | 'RISK';
  targetMarksNextExam: number;
}

export interface WorkspaceConnectionDTO {
  portalName: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING' | 'ERROR';
  lastSyncedTimestamp: string;
  cookiesImported: boolean;
  cookiesValidUntil: string;
  activeSessionToken: string;
  syncErrors: string[];
}

export interface SourceDocumentDTO {
  id: string;
  filename: string;
  filesize: string;
  filetype: 'PDF' | 'DOCX' | 'PPTX' | 'IMAGE';
  uploadProgress: number;
  status: 'QUEUED' | 'EXTRACTING' | 'EMBEDDING' | 'INGESTED' | 'FAILED';
  uploadedAt: string;
  vectorsGenerated: number;
  targetDestination?: string; // "Course Library", "Study Journal", "Academic Calendar"
}

export interface AcademicEventDTO {
  id: string;
  title: string;
  date: string; // ISO "2026-07-30"
  time: string; // "10:00 AM"
  subjectCode: string;
  eventType: 'EXAM' | 'ASSIGNMENT' | 'EVENT' | 'HACKATHON';
  location: string;
  details: string;
}

export interface MissingInfoQueryDTO {
  id: string;
  documentId: string;
  filename: string;
  question: string;
  parameterKey: string;
  options?: string[];
  resolved: boolean;
  userAnswer?: string;
}

export interface AIChatMessageDTO {
  id: string;
  sender: 'USER' | 'JARVIS_AI' | 'AGENT_SYSTEM';
  timestamp: string;
  content: string;
  isStreaming?: boolean;
  toolExecutions?: Array<{
    toolName: string;
    status: 'EXECUTING' | 'SUCCESS' | 'FAILED';
    outputSnippet?: string;
  }>;
  proposedActionCard?: {
    id: string;
    actionType: 'SCHEDULE_STUDY' | 'SYLLABUS_OVERRIDE' | 'SUBMIT_ASSIGNMENT';
    title: string;
    details: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  };
}

export interface StudyTaskDTO {
  id: string;
  timeSlot: string;
  subjectCode: string;
  taskTitle: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceReference: string;
  estimatedMinutes: number;
  isAccepted: boolean;
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
}

export interface NotificationItemDTO {
  id: string;
  title: string;
  message: string;
  category: 'ACADEMIC_ALERT' | 'SYSTEM_EVENT' | 'EXAM_COUNTDOWN' | 'AI_INSIGHT';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  isRead: boolean;
  isSnoozed: boolean;
}
