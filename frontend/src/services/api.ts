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
  SourceDocumentDTO,
  AIChatMessageDTO,
  StudyTaskDTO,
  NotificationItemDTO,
  AcademicEventDTO
} from '../types/dto';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockBackendAPI = {
  getCurrentClass: async (): Promise<CurrentClassDTO> => {
    await delay(150);
    return {
      id: 'cls-101',
      subjectCode: 'CS602',
      subjectName: 'Distributed Systems & Cloud Architecture',
      classroom: 'LAB-402 // TOWER B',
      facultyName: 'Dr. Evelyn Vance',
      startTime: '11:00 AM',
      endTime: '12:30 PM',
      progressPercent: 68,
      remainingMinutes: 24,
      status: 'ACTIVE'
    };
  },

  getNextClass: async (): Promise<NextClassDTO> => {
    await delay(150);
    return {
      id: 'cls-102',
      subjectCode: 'CS605',
      subjectName: 'Quantum Computing Fundamentals',
      classroom: 'HALL-A // AUDITORIUM 1',
      facultyName: 'Prof. Marcus Brody',
      startsInMinutes: 45,
      scheduledTime: '02:00 PM'
    };
  },

  getAcademicOverview: async (): Promise<AcademicOverviewDTO> => {
    await delay(180);
    return {
      completedAssignmentsCount: 14,
      totalAssignmentsCount: 18,
      assignmentCompletionPercent: 77.8,
      daysUntilNextMajorExam: 6,
      nextMajorExamName: 'Distributed Systems Midterm',
      nextMajorExamDate: '2026-07-30'
    };
  },

  getAcademicEvents: async (): Promise<AcademicEventDTO[]> => {
    await delay(150);
    return [
      { id: 'evt-1', title: 'CS602 Midterm Examination', date: '2026-07-30', time: '10:00 AM', subjectCode: 'CS602', eventType: 'EXAM', location: 'Main Exam Hall B', details: 'Covers Raft consensus, Lamport clocks, and distributed RPCs.' },
      { id: 'evt-2', title: 'CS604 Lab Assignment #4 Due', date: '2026-07-28', time: '11:59 PM', subjectCode: 'CS604', eventType: 'ASSIGNMENT', location: 'LMS Submission Gateway', details: 'NP-completeness proof reduction set.' },
      { id: 'evt-3', title: 'Annual AI & Quantum Hackathon', date: '2026-08-05', time: '09:00 AM', subjectCode: 'GEN', eventType: 'HACKATHON', location: 'Innovation Hub Auditorium', details: '36-hour sprint for generative AI and quantum simulation.' },
      { id: 'evt-4', title: 'Guest Lecture: Scalable Storage at Scale', date: '2026-08-08', time: '02:00 PM', subjectCode: 'CS602', eventType: 'EVENT', location: 'Auditorium 1', details: 'Keynote by Chief Distributed Architect.' },
      { id: 'evt-5', title: 'CS605 Quantum Circuits Quiz', date: '2026-08-12', time: '11:00 AM', subjectCode: 'CS605', eventType: 'EXAM', location: 'Hall A', details: 'Single qubit gates and entanglement operators.' }
    ];
  },

  getAIBriefing: async (): Promise<AIBriefingDTO> => {
    await delay(200);
    return {
      systemStatus: 'ACTION_REQUIRED',
      dailySummaryText: 'Master Agent Telemetry: CS602 Midterm in 6 days requires focused memory consolidation. High workload window detected on Thursday.',
      criticalAlerts: [
        {
          id: 'alt-1',
          severity: 'HIGH',
          message: 'CS602 Lab Assignment #4 due in 14 hours. 2 test cases failing.',
          actionLabel: 'Execute Debugger'
        }
      ],
      suggestedActions: [
        {
          id: 'sug-1',
          title: 'Complete Raft Consensus Algorithm problem set',
          category: 'ASSIGNMENT',
          priorityScore: 94,
          estimatedMinutes: 45
        },
        {
          id: 'sug-2',
          title: 'Review Quantum Fourier Transform concept nodes',
          category: 'STUDY',
          priorityScore: 88,
          estimatedMinutes: 30
        },
        {
          id: 'sug-3',
          title: 'Generate Mock Assessment for Neural Networks',
          category: 'PREPARATION',
          priorityScore: 79,
          estimatedMinutes: 25
        }
      ]
    };
  },

  getBackendRiskOverview: async (): Promise<BackendRiskOverviewDTO> => {
    await delay(180);
    return {
      overallRiskLevel: 'SAFE',
      backendRiskScore: 18.5,
      estimatedSGPA: 8.92,
      estimatedCGPA: 8.78,
      riskFactors: [
        { category: 'Assignment Backlog', impactScore: 12, description: '1 pending high-weight submission' },
        { category: 'Concept Mastery Gap', impactScore: 15, description: 'Backpropagation Calculus low quiz confidence' }
      ],
      requiredMarksDTO: [
        { subjectCode: 'CS601', subjectName: 'Neural Networks & Deep Learning', targetMarksForGradeA: 82, currentMarksAccrued: 64 },
        { subjectCode: 'CS602', subjectName: 'Distributed Systems & Cloud', targetMarksForGradeA: 78, currentMarksAccrued: 58 },
        { subjectCode: 'CS603', subjectName: 'Advanced Compiler Design', targetMarksForGradeA: 85, currentMarksAccrued: 71 },
        { subjectCode: 'CS604', subjectName: 'Algorithmic Complexity Theory', targetMarksForGradeA: 90, currentMarksAccrued: 79 },
        { subjectCode: 'CS605', subjectName: 'Quantum Computing Fundamentals', targetMarksForGradeA: 80, currentMarksAccrued: 60 }
      ]
    };
  },

  getSemester3DNodes: async (): Promise<Semester3DNodeDTO[]> => {
    await delay(150);
    return [
      { id: 'node-1', label: 'CS601: Deep Learning', category: 'SUBJECT', position: [-4, 2, 0], status: 'SAFE', subjectCode: 'CS601', details: 'Syllabus 84% Completed. SGPA Contribution: High.' },
      { id: 'node-2', label: 'CS602: Distributed Systems', category: 'SUBJECT', position: [0, 3, -2], status: 'WARNING', subjectCode: 'CS602', details: 'Midterm in 6 Days. 1 Assignment Pending.' },
      { id: 'node-3', label: 'CS603: Compiler Design', category: 'SUBJECT', position: [4, 1.5, 1], status: 'SAFE', subjectCode: 'CS603', details: 'Lexer & AST Parser labs validated.' },
      { id: 'node-4', label: 'CS604: Algorithms', category: 'SUBJECT', position: [-2, -2, 2], status: 'SAFE', subjectCode: 'CS604', details: 'NP-Completeness proof mastery achieved.' },
      { id: 'node-5', label: 'CS605: Quantum Computing', category: 'SUBJECT', position: [3, -2.5, -1], status: 'WARNING', subjectCode: 'CS605', details: 'Qubit Entanglement quiz due next week.' },
      { id: 'node-6', label: 'Midterm Assessment Week', category: 'EXAM', position: [0, 0, 4], status: 'CRITICAL', dueDate: '2026-07-30', details: 'Weighted 35% of total SGPA score.' }
    ];
  },

  getTimetableSlots: async (): Promise<TimetableSlotDTO[]> => {
    await delay(180);
    return [
      { id: 'tt-1', dayOfWeek: 'MON', startTime: '09:00', endTime: '10:30', subjectCode: 'CS601', subjectName: 'Neural Networks', faculty: 'Dr. Aris Thorne', room: 'LAB-101', type: 'LECTURE' },
      { id: 'tt-2', dayOfWeek: 'MON', startTime: '11:00', endTime: '12:30', subjectCode: 'CS602', subjectName: 'Distributed Systems', faculty: 'Dr. Evelyn Vance', room: 'LAB-402', type: 'LECTURE', isCurrentSession: true },
      { id: 'tt-3', dayOfWeek: 'MON', startTime: '14:00', endTime: '16:00', subjectCode: 'CS603', subjectName: 'Compiler Design Lab', faculty: 'Prof. K. Sterling', room: 'LAB-305', type: 'LAB' },
      { id: 'tt-4', dayOfWeek: 'TUE', startTime: '09:00', endTime: '10:30', subjectCode: 'CS604', subjectName: 'Algorithms', faculty: 'Dr. S. Raman', room: 'HALL-C', type: 'LECTURE' },
      { id: 'tt-5', dayOfWeek: 'TUE', startTime: '11:00', endTime: '12:30', subjectCode: 'CS605', subjectName: 'Quantum Computing', faculty: 'Prof. M. Brody', room: 'HALL-A', type: 'LECTURE' },
      { id: 'tt-6', dayOfWeek: 'WED', startTime: '09:00', endTime: '10:30', subjectCode: 'CS602', subjectName: 'Distributed Systems', faculty: 'Dr. Evelyn Vance', room: 'LAB-402', type: 'LECTURE' },
      { id: 'tt-7', dayOfWeek: 'WED', startTime: '11:00', endTime: '13:00', subjectCode: 'CS601', subjectName: 'Deep Learning Lab', faculty: 'Dr. Aris Thorne', room: 'LAB-101', type: 'LAB' },
      { id: 'tt-8', dayOfWeek: 'THU', startTime: '09:00', endTime: '10:30', subjectCode: 'CS603', subjectName: 'Compiler Design', faculty: 'Prof. K. Sterling', room: 'HALL-B', type: 'LECTURE' },
      { id: 'tt-9', dayOfWeek: 'THU', startTime: '14:00', endTime: '15:30', subjectCode: 'CS605', subjectName: 'Quantum Computing', faculty: 'Prof. M. Brody', room: 'HALL-A', type: 'LECTURE' },
      { id: 'tt-10', dayOfWeek: 'FRI', startTime: '10:00', endTime: '12:00', subjectCode: 'CS604', subjectName: 'Algorithms Tutorial', faculty: 'Dr. S. Raman', room: 'SEMINAR-2', type: 'TUTORIAL' }
    ];
  },

  getSubjects: async (): Promise<SubjectDTO[]> => {
    await delay(180);
    return [
      {
        code: 'CS601',
        name: 'Neural Networks & Deep Learning',
        credits: 4,
        faculty: 'Dr. Aris Thorne',
        syllabusProgressPercent: 84,
        riskTier: 'LOW',
        notesAvailableCount: 24,
        assignmentsTotal: 5,
        assignmentsSubmitted: 4,
        topics: [
          { id: 'tp-1', title: 'Gradient Descent & Backpropagation', status: 'COMPLETED', difficulty: 'MEDIUM' },
          { id: 'tp-2', title: 'Convolutional Architectures & ResNets', status: 'COMPLETED', difficulty: 'MEDIUM' },
          { id: 'tp-3', title: 'Transformer Attention Mechanisms', status: 'IN_PROGRESS', difficulty: 'HARD' },
          { id: 'tp-4', title: 'Diffusion Models & Generative AI', status: 'PENDING', difficulty: 'HARD' }
        ]
      },
      {
        code: 'CS602',
        name: 'Distributed Systems & Cloud',
        credits: 4,
        faculty: 'Dr. Evelyn Vance',
        syllabusProgressPercent: 72,
        riskTier: 'MEDIUM',
        notesAvailableCount: 19,
        assignmentsTotal: 4,
        assignmentsSubmitted: 3,
        topics: [
          { id: 'tp-5', title: 'Lamport Timestamps & Vector Clocks', status: 'COMPLETED', difficulty: 'EASY' },
          { id: 'tp-6', title: 'Raft Consensus Protocol & Fault Tolerance', status: 'IN_PROGRESS', difficulty: 'HARD' },
          { id: 'tp-7', title: 'Distributed Hash Tables (Chord/Kademlia)', status: 'PENDING', difficulty: 'MEDIUM' }
        ]
      },
      {
        code: 'CS603',
        name: 'Advanced Compiler Design',
        credits: 3,
        faculty: 'Prof. K. Sterling',
        syllabusProgressPercent: 90,
        riskTier: 'LOW',
        notesAvailableCount: 31,
        assignmentsTotal: 4,
        assignmentsSubmitted: 4,
        topics: [
          { id: 'tp-8', title: 'LALR Parsing & Lexical Scanning', status: 'COMPLETED', difficulty: 'EASY' },
          { id: 'tp-9', title: 'SSA Form & Intermediate Representation', status: 'COMPLETED', difficulty: 'MEDIUM' },
          { id: 'tp-10', title: 'Register Allocation via Graph Coloring', status: 'IN_PROGRESS', difficulty: 'HARD' }
        ]
      },
      {
        code: 'CS604',
        name: 'Algorithmic Complexity Theory',
        credits: 4,
        faculty: 'Dr. S. Raman',
        syllabusProgressPercent: 65,
        riskTier: 'LOW',
        notesAvailableCount: 16,
        assignmentsTotal: 3,
        assignmentsSubmitted: 2,
        topics: [
          { id: 'tp-11', title: 'P vs NP Reductions & SAT Problems', status: 'COMPLETED', difficulty: 'HARD' },
          { id: 'tp-12', title: 'Approximation Algorithms & LP Duality', status: 'IN_PROGRESS', difficulty: 'HARD' }
        ]
      },
      {
        code: 'CS605',
        name: 'Quantum Computing Fundamentals',
        credits: 3,
        faculty: 'Prof. M. Brody',
        syllabusProgressPercent: 58,
        riskTier: 'HIGH',
        notesAvailableCount: 12,
        assignmentsTotal: 4,
        assignmentsSubmitted: 2,
        topics: [
          { id: 'tp-13', title: 'Bloch Sphere & Single Qubit Gates', status: 'COMPLETED', difficulty: 'EASY' },
          { id: 'tp-14', title: 'Shor & Grover Quantum Algorithms', status: 'PENDING', difficulty: 'HARD' }
        ]
      }
    ];
  },

  getKnowledgeConcepts: async (subjectCode: string): Promise<KnowledgeConceptNodeDTO[]> => {
    await delay(150);
    return [
      { id: 'c-1', subjectCode, title: 'Consensus Theory', category: 'Core Protocol', masteryLevelPercent: 92, status: 'MASTERED', position: [-2, 1, 0], connectedConceptIds: ['c-2', 'c-3'] },
      { id: 'c-2', subjectCode, title: 'Raft Log Replication', category: 'State Machine', masteryLevelPercent: 68, status: 'REVIEW_NEEDED', position: [0, 2, -1], connectedConceptIds: ['c-1', 'c-4'] },
      { id: 'c-3', subjectCode, title: 'Paxos Safety Invariants', category: 'Formal Proofs', masteryLevelPercent: 45, status: 'REVIEW_NEEDED', position: [2, 0.5, 1], connectedConceptIds: ['c-1'] },
      { id: 'c-4', subjectCode, title: 'Byzantine Fault Tolerance', category: 'Advanced Cryptography', masteryLevelPercent: 20, status: 'LOCKED', position: [1, -2, 0], connectedConceptIds: ['c-2'] },
      { id: 'c-5', subjectCode, title: 'Vector Clocks & Causality', category: 'Ordering', masteryLevelPercent: 88, status: 'MASTERED', position: [-2, -1.5, 1], connectedConceptIds: ['c-1'] }
    ];
  },

  getGradeCards: async (): Promise<GradeCardDTO[]> => {
    await delay(150);
    return [
      { subjectCode: 'CS601', subjectName: 'Neural Networks', credits: 4, obtainedScore: 88, predictedGrade: 'A+', backendRiskLevel: 'SAFE', targetMarksNextExam: 82 },
      { subjectCode: 'CS602', subjectName: 'Distributed Systems', credits: 4, obtainedScore: 76, predictedGrade: 'A', backendRiskLevel: 'SAFE', targetMarksNextExam: 78 },
      { subjectCode: 'CS603', subjectName: 'Compiler Design', credits: 3, obtainedScore: 92, predictedGrade: 'A+', backendRiskLevel: 'SAFE', targetMarksNextExam: 85 },
      { subjectCode: 'CS604', subjectName: 'Complexity Theory', credits: 4, obtainedScore: 71, predictedGrade: 'B+', backendRiskLevel: 'WARNING', targetMarksNextExam: 90 },
      { subjectCode: 'CS605', subjectName: 'Quantum Computing', credits: 3, obtainedScore: 62, predictedGrade: 'B', backendRiskLevel: 'RISK', targetMarksNextExam: 80 }
    ];
  },

  getWorkspaceStatus: async (): Promise<WorkspaceConnectionDTO> => {
    await delay(150);
    return {
      portalName: 'University Canvas & ERP Gateway',
      status: 'CONNECTED',
      lastSyncedTimestamp: '2026-07-24T23:30:00Z',
      cookiesImported: true,
      cookiesValidUntil: '2026-08-01T00:00:00Z',
      activeSessionToken: 'sess_live_99f2018a7c2e99b04a',
      syncErrors: []
    };
  },

  getSourceDocuments: async (): Promise<SourceDocumentDTO[]> => {
    await delay(180);
    return [
      { id: 'doc-101', filename: 'CS602_Syllabus_2026.pdf', filesize: '2.4 MB', filetype: 'PDF', uploadProgress: 100, status: 'INGESTED', uploadedAt: '10 mins ago', vectorsGenerated: 420, targetDestination: 'Course Library' },
      { id: 'doc-102', filename: 'CS604_Assignment3_Spec.pdf', filesize: '4.1 MB', filetype: 'PDF', uploadProgress: 100, status: 'INGESTED', uploadedAt: '2 hours ago', vectorsGenerated: 890, targetDestination: 'Study Journal' },
      { id: 'doc-103', filename: 'CS605_Midterm_Schedule.pptx', filesize: '12.8 MB', filetype: 'PPTX', uploadProgress: 100, status: 'INGESTED', uploadedAt: 'Just now', vectorsGenerated: 140, targetDestination: 'Academic Calendar' }
    ];
  },

  getStudyTasks: async (): Promise<StudyTaskDTO[]> => {
    await delay(180);
    return [
      { id: 'st-1', timeSlot: '15:00 - 16:00', subjectCode: 'CS602', taskTitle: 'Implement Raft Log Compaction Unit Test', priority: 'CRITICAL', evidenceReference: 'Assignment 4 Spec, Page 3', estimatedMinutes: 60, isAccepted: true, status: 'PENDING' },
      { id: 'st-2', timeSlot: '16:30 - 17:30', subjectCode: 'CS605', taskTitle: 'Solve Bloch Sphere State Vector Transformations', priority: 'HIGH', evidenceReference: 'Lecture 12 Slide 18', estimatedMinutes: 45, isAccepted: true, status: 'PENDING' },
      { id: 'st-3', timeSlot: '19:00 - 20:00', subjectCode: 'CS601', taskTitle: 'Review Attention Matrix Dimensionality', priority: 'MEDIUM', evidenceReference: 'Vaswani et al. Paper Section 3.2', estimatedMinutes: 30, isAccepted: false, status: 'PENDING' }
    ];
  },

  getNotifications: async (): Promise<NotificationItemDTO[]> => {
    await delay(150);
    return [
      { id: 'notif-1', title: 'CRITICAL DEADLINE', message: 'CS602 Lab Assignment #4 deadline in 14 hours.', category: 'ACADEMIC_ALERT', priority: 'CRITICAL', timestamp: '10m ago', isRead: false, isSnoozed: false },
      { id: 'notif-2', title: 'JARVIS SYLLABUS SYNC', message: 'Ingested 420 vector chunks from CS602_Syllabus.pdf into knowledge graph.', category: 'AI_INSIGHT', priority: 'MEDIUM', timestamp: '1h ago', isRead: false, isSnoozed: false },
      { id: 'notif-3', title: 'EXAM COUNTDOWN', message: 'CS602 Midterm Exam scheduled in 6 days (July 30).', category: 'EXAM_COUNTDOWN', priority: 'HIGH', timestamp: '3h ago', isRead: true, isSnoozed: false }
    ];
  }
};
