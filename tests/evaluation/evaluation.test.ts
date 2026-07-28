import { calculateSubjectMetrics } from '../../backend/src/modules/evaluation/evaluation.logic';
import { calculateRiskSeverity } from '../../backend/src/modules/evaluation/evaluation.risk';
import { SubjectState, Assessment } from '../../backend/src/modules/evaluation/evaluation.types';

describe('Phase 4: Evaluation and Risk Logic', () => {
  it('should correctly calculate marks lost and required future average', () => {
    const state: SubjectState = {
      subjectId: 'CS101',
      totalMarks: 100,
      targetMarks: 85,
      assessments: [
        { id: '1', name: 'Midterm', marksMax: 30, marksObtained: 20, isCompleted: true, weightage: 0.3 }
      ]
    };

    const metrics = calculateSubjectMetrics(state);
    
    expect(metrics.possibleSoFar).toBe(30);
    expect(metrics.earnedSoFar).toBe(20);
    expect(metrics.marksLost).toBe(10);
    expect(metrics.remainingMarks).toBe(70);
    // (85 target - 20 earned) / 70 remaining = 65 / 70 = 0.928...
    expect(metrics.requiredFutureAverage).toBeGreaterThan(0.92); 
  });

  it('should elevate risk to CRITICAL if required average exceeds 0.90', () => {
    const metrics = {
      earnedSoFar: 20,
      possibleSoFar: 30,
      marksLost: 10,
      remainingMarks: 70,
      requiredFutureAverage: 0.93
    };

    const risk = calculateRiskSeverity(metrics, []);
    expect(risk.severity).toBe('CRITICAL');
    expect(risk.drivers[0]).toContain('extremely high');
  });

  it('should escalate risk based on temporal proximity of heavy assessments', () => {
    const metrics = {
      earnedSoFar: 60,
      possibleSoFar: 70,
      marksLost: 10,
      remainingMarks: 30,
      requiredFutureAverage: 0.65 // Base: MEDIUM
    };

    const upcoming: Assessment[] = [
      { 
        id: '2', 
        name: 'Final Project', 
        marksMax: 30, 
        isCompleted: false, 
        weightage: 0.3,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      }
    ];

    const risk = calculateRiskSeverity(metrics, upcoming);
    
    // MEDIUM escalates to HIGH because of the heavy, looming deadline
    expect(risk.severity).toBe('HIGH');
    expect(risk.drivers.length).toBe(2);
    expect(risk.drivers[1]).toContain("High-weight assessment 'Final Project' is due within 7 days");
  });
});