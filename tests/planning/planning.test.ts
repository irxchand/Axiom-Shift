import { rankSubjectsByUrgency, generateDeterministicReason, PlanningSubjectContext } from '../../backend/src/modules/planning/planning.fallback';
import { validateStudyPlanCalendar, checkTimeOverlap } from '../../backend/src/modules/planning/planning.validator';

describe('Phase 8: Deterministic Planning Fallback and Validation', () => {

  describe('Fallback Engine', () => {
    it('should rank a CRITICAL risk subject above a HIGH risk subject', () => {
      const subjects: PlanningSubjectContext[] = [
        { subjectId: 'S1', subjectName: 'Stats', risk: { severity: 'HIGH', drivers: [] }, upcomingAssessments: [], marksLost: 5 },
        { subjectId: 'S2', subjectName: 'Math', risk: { severity: 'CRITICAL', drivers: [] }, upcomingAssessments: [], marksLost: 2 }
      ];
      const ranked = rankSubjectsByUrgency(subjects);
      expect(ranked[0].subjectId).toBe('S2'); 
    });

    it('should break ties using the nearest upcoming assessment', () => {
      const now = Date.now();
      const subjects: PlanningSubjectContext[] = [
        { 
          subjectId: 'S1', subjectName: 'Physics', risk: { severity: 'HIGH', drivers: [] }, 
          upcomingAssessments: [{ id: 'a1', name: 'Midterm', marksMax: 20, isCompleted: false, weightage: 0.2, dueDate: new Date(now + 100000) }], 
          marksLost: 5 
        },
        { 
          subjectId: 'S2', subjectName: 'Chem', risk: { severity: 'HIGH', drivers: [] }, 
          upcomingAssessments: [{ id: 'a2', name: 'Quiz', marksMax: 10, isCompleted: false, weightage: 0.1, dueDate: new Date(now + 50000) }], 
          marksLost: 5 
        }
      ];
      // Both HIGH risk, but Chem (S2) is due sooner
      const ranked = rankSubjectsByUrgency(subjects);
      expect(ranked[0].subjectId).toBe('S2');
    });

    it('should generate a strict, data-driven rationale', () => {
      const subject: PlanningSubjectContext = {
        subjectId: 'S1', subjectName: 'Bio', risk: { severity: 'HIGH', drivers: ['Required average is 85%'] },
        upcomingAssessments: [], marksLost: 12
      };
      const reason = generateDeterministicReason(subject);
      expect(reason).toContain('HIGH risk');
      expect(reason).toContain('deficit of 12 marks');
      expect(reason).toContain('Required average is 85%');
    });
  });

  describe('Calendar Sanity Validator', () => {
    const baseTime = new Date('2026-07-29T10:00:00Z').getTime();

    it('should detect overlap between a proposed block and an existing class', () => {
      const existingClasses = [
        { startTime: new Date(baseTime), endTime: new Date(baseTime + 3600000) } // 10:00 to 11:00
      ];
      const proposedBlocks = [
        { taskId: 'T1', window: { startTime: new Date(baseTime + 1800000), endTime: new Date(baseTime + 5400000) } } // 10:30 to 11:30 (Overlaps)
      ];

      const validation = validateStudyPlanCalendar(proposedBlocks, existingClasses);
      expect(validation.isValid).toBe(false);
      expect(validation.collisions[0]).toContain('overlaps with a scheduled class');
    });

    it('should detect internal overlaps between multiple AI-proposed blocks', () => {
      const proposedBlocks = [
        { taskId: 'T1', window: { startTime: new Date(baseTime), endTime: new Date(baseTime + 3600000) } }, // 10:00 to 11:00
        { taskId: 'T2', window: { startTime: new Date(baseTime + 1800000), endTime: new Date(baseTime + 5400000) } } // 10:30 to 11:30
      ];

      const validation = validateStudyPlanCalendar(proposedBlocks, []);
      expect(validation.isValid).toBe(false);
      expect(validation.collisions[0]).toContain('overlaps internally');
    });

    it('should validate a perfectly aligned, non-overlapping schedule', () => {
      const existingClasses = [
        { startTime: new Date(baseTime), endTime: new Date(baseTime + 3600000) } // 10:00 to 11:00
      ];
      const proposedBlocks = [
        { taskId: 'T1', window: { startTime: new Date(baseTime + 3600000), endTime: new Date(baseTime + 7200000) } } // 11:00 to 12:00
      ];

      const validation = validateStudyPlanCalendar(proposedBlocks, existingClasses);
      expect(validation.isValid).toBe(true);
      expect(validation.collisions.length).toBe(0);
    });
  });
});