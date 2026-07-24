import { create } from 'zustand';
import type { AcademicEventDTO, SourceDocumentDTO, MissingInfoQueryDTO } from '../types/dto';

interface MasterAgentStore {
  events: AcademicEventDTO[];
  documents: SourceDocumentDTO[];
  missingQueries: MissingInfoQueryDTO[];
  agentLogs: string[];

  // Master Orchestrator Actions
  addEvent: (event: Omit<AcademicEventDTO, 'id'>) => void;
  orchestrateFile: (file: File | { name: string; size?: string }) => void;
  resolveMissingInfo: (queryId: string, answer: string) => void;
}

export const useMasterAgentStore = create<MasterAgentStore>((set) => ({
  events: [
    { id: 'evt-1', title: 'CS602 Midterm Examination', date: '2026-07-30', time: '10:00 AM', subjectCode: 'CS602', eventType: 'EXAM', location: 'Main Exam Hall B', details: 'Covers Raft consensus, Lamport clocks, and distributed RPCs.' },
    { id: 'evt-2', title: 'CS604 Lab Assignment #4 Due', date: '2026-07-28', time: '11:59 PM', subjectCode: 'CS604', eventType: 'ASSIGNMENT', location: 'LMS Submission Gateway', details: 'NP-completeness proof reduction set.' },
    { id: 'evt-3', title: 'Annual AI & Quantum Hackathon', date: '2026-08-05', time: '09:00 AM', subjectCode: 'GEN', eventType: 'HACKATHON', location: 'Innovation Hub Auditorium', details: '36-hour sprint for generative AI and quantum simulation.' },
    { id: 'evt-4', title: 'Guest Lecture: Scalable Storage at Scale', date: '2026-08-08', time: '02:00 PM', subjectCode: 'CS602', eventType: 'EVENT', location: 'Auditorium 1', details: 'Keynote by Chief Distributed Architect.' }
  ],
  documents: [
    { id: 'doc-101', filename: 'CS602_Syllabus_2026.pdf', filesize: '2.4 MB', filetype: 'PDF', uploadProgress: 100, status: 'INGESTED', uploadedAt: '10 mins ago', vectorsGenerated: 420, targetDestination: 'Course Library' },
    { id: 'doc-102', filename: 'CS604_Assignment3_Spec.pdf', filesize: '4.1 MB', filetype: 'PDF', uploadProgress: 100, status: 'INGESTED', uploadedAt: '2 hours ago', vectorsGenerated: 890, targetDestination: 'Study Journal' }
  ],
  missingQueries: [
    {
      id: 'q-101',
      documentId: 'doc-103',
      filename: 'CS605_Quantum_Midterm_Draft.pdf',
      question: 'Master Agent Warning: CS605 Quantum Midterm exam date was unmapped in the manuscript text. Please specify the target examination date.',
      parameterKey: 'exam_date',
      options: ['2026-08-04', '2026-08-10', '2026-08-15'],
      resolved: false
    }
  ],
  agentLogs: [
    'Master Agent active: Orchestrated CS602_Syllabus_2026.pdf -> Course Library',
    'Master Agent active: Orchestrated CS604_Assignment3_Spec.pdf -> Study Journal'
  ],

  addEvent: (newEvent) => {
    set((state) => ({
      events: [{ ...newEvent, id: `evt-${Date.now()}` }, ...state.events]
    }));
  },

  orchestrateFile: (file) => {
    const filename = file.name;
    let target = 'Course Library';
    let isQueryNeeded = false;

    if (filename.toLowerCase().includes('assignment') || filename.toLowerCase().includes('task') || filename.toLowerCase().includes('spec')) {
      target = 'Study Journal';
    } else if (filename.toLowerCase().includes('schedule') || filename.toLowerCase().includes('exam') || filename.toLowerCase().includes('date')) {
      target = 'Academic Calendar';
      isQueryNeeded = true;
    } else if (filename.toLowerCase().includes('notes') || filename.toLowerCase().includes('lecture')) {
      target = 'Course Library';
    }

    const newDoc: SourceDocumentDTO = {
      id: `doc-${Date.now()}`,
      filename,
      filesize: '3.6 MB',
      filetype: 'PDF',
      uploadProgress: 100,
      status: 'INGESTED',
      uploadedAt: 'Just now',
      vectorsGenerated: 340,
      targetDestination: target
    };

    set((state) => {
      const nextDocs = [newDoc, ...state.documents];
      const nextLogs = [`Master Agent: Ingested & Routed ${filename} -> ${target}`, ...state.agentLogs];
      const nextQueries = isQueryNeeded
        ? [
            {
              id: `q-${Date.now()}`,
              documentId: newDoc.id,
              filename,
              question: `Master Agent Notice: Please confirm target exam date for ${filename}.`,
              parameterKey: 'exam_date',
              options: ['2026-08-02', '2026-08-06', '2026-08-12'],
              resolved: false
            },
            ...state.missingQueries
          ]
        : state.missingQueries;

      return {
        documents: nextDocs,
        agentLogs: nextLogs,
        missingQueries: nextQueries
      };
    });
  },

  resolveMissingInfo: (queryId, answer) => {
    set((state) => {
      const query = state.missingQueries.find((q) => q.id === queryId);
      if (!query) return state;

      // Automatically add event to Academic Calendar when user resolves exam date
      const newCalendarEvent: AcademicEventDTO = {
        id: `evt-${Date.now()}`,
        title: `Resolved Exam: ${query.filename}`,
        date: answer,
        time: '10:00 AM',
        subjectCode: 'CS605',
        eventType: 'EXAM',
        location: 'Hall A',
        details: `Confirmed by Master Agent from ${query.filename}`
      };

      return {
        missingQueries: state.missingQueries.map((q) => (q.id === queryId ? { ...q, resolved: true, userAnswer: answer } : q)),
        events: [newCalendarEvent, ...state.events],
        agentLogs: [`Master Agent: Resolved missing info (${answer}) -> Added Event to Academic Calendar`, ...state.agentLogs]
      };
    });
  }
}));
