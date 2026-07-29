import { filterDuplicates, evaluateAssessmentDeadlines, evaluateRiskElevations } from '../../backend/src/modules/notifications/notifications.engine';
import { synthesizeDailyBriefing } from '../../backend/src/modules/notifications/briefing.builder';
import { AppNotification } from '../../backend/src/modules/notifications/notifications.types';

describe('Phase 9: Notifications and Daily Briefing', () => {

  describe('The Silencer (Deduplication)', () => {
    it('should drop a proposed notification if the exact dedupeKey was sent recently', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const history: AppNotification[] = [
        { id: '1', type: 'ASSESSMENT_DEADLINE', severity: 'CRITICAL', title: 'Test', message: 'Test', dedupeKey: 'deadline_os', timestamp: oneHourAgo }
      ];
      
      const proposed: AppNotification[] = [
        { id: '2', type: 'ASSESSMENT_DEADLINE', severity: 'CRITICAL', title: 'Test', message: 'Test', dedupeKey: 'deadline_os', timestamp: now }
      ];

      // With a 24-hour cooldown, this 1-hour old alert should block the new one
      const filtered = filterDuplicates(proposed, history, 24 * 60 * 60 * 1000);
      expect(filtered.length).toBe(0);
    });

    it('should allow a proposed notification if the cooldown has expired', () => {
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      
      const history: AppNotification[] = [
        { id: '1', type: 'RISK_ELEVATION', severity: 'WARNING', title: 'Test', message: 'Test', dedupeKey: 'risk_os', timestamp: twoDaysAgo }
      ];
      
      const proposed: AppNotification[] = [
        { id: '2', type: 'RISK_ELEVATION', severity: 'WARNING', title: 'Test', message: 'Test', dedupeKey: 'risk_os', timestamp: now }
      ];

      // Cooldown is 24 hours, last sent was 48 hours ago. Should pass.
      const filtered = filterDuplicates(proposed, history, 24 * 60 * 60 * 1000);
      expect(filtered.length).toBe(1);
    });
  });

  describe('The Watchtower (Triggers)', () => {
    it('should trigger an alert for an assessment exactly at or under 48 hours', () => {
      const now = new Date();
      const inFortyHours = new Date(now.getTime() + 40 * 60 * 60 * 1000);
      const inSeventyHours = new Date(now.getTime() + 70 * 60 * 60 * 1000);

      const assessments = [
        { id: 'a1', name: 'Math Quiz', marksMax: 10, isCompleted: false, weightage: 0.1, dueDate: inFortyHours }, // Should trigger
        { id: 'a2', name: 'Physics Exam', marksMax: 50, isCompleted: false, weightage: 0.5, dueDate: inSeventyHours } // Should NOT trigger
      ];

      const alerts = evaluateAssessmentDeadlines(assessments, now);
      expect(alerts.length).toBe(1);
      expect(alerts[0].dedupeKey).toBe('deadline_48h_a1');
    });

    it('should trigger a WARNING for HIGH risk and CRITICAL for CRITICAL risk', () => {
      const deltas = [
        { subjectId: 's1', subjectName: 'Math', previous: 'MEDIUM', current: 'HIGH' },
        { subjectId: 's2', subjectName: 'Physics', previous: 'HIGH', current: 'CRITICAL' },
        { subjectId: 's3', subjectName: 'Chem', previous: 'LOW', current: 'LOW' } // Should not trigger
      ];

      const alerts = evaluateRiskElevations(deltas, new Date());
      expect(alerts.length).toBe(2);
      expect(alerts.find(a => a.dedupeKey.includes('s1'))?.severity).toBe('WARNING');
      expect(alerts.find(a => a.dedupeKey.includes('s2'))?.severity).toBe('CRITICAL');
    });
  });

  describe('The Synthesizer (Briefing Builder)', () => {
    it('should strictly cap top priorities at 3 and output a deterministic recommendation', () => {
      const priorities = [
        { taskId: '1', title: 'Task 1', reason: 'R1' },
        { taskId: '2', title: 'Task 2', reason: 'R2' },
        { taskId: '3', title: 'Task 3', reason: 'R3' },
        { taskId: '4', title: 'Task 4', reason: 'R4' } // Should be truncated
      ];
      const assessments = [{ name: 'Urgent Exam', daysRemaining: 1 }];
      
      const briefing = synthesizeDailyBriefing([], priorities, assessments, [], new Date());
      
      expect(briefing.topPriorities.length).toBe(3);
      expect(briefing.topPriorities[2].taskId).toBe('3');
      // The urgent assessment should hijack the recommendation string
      expect(briefing.recommendedAction).toContain('Immediate Focus Required');
    });
  });
});