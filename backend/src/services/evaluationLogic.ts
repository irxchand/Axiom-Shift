// Phase 4 formula rules (per Person_4 SDD):
// - numeric formulas are deterministic TypeScript
// - no LLM calls
// - no frontend formula dependency
//
// Everything in this file is a pure function: same input -> same output,
// no I/O, no side effects. That's what makes it unit-testable in isolation.

export interface AssessmentScoreInput {
  id: string;
  maxMarks: number;
  obtainedMarks: number | null; // null = not yet graded
}

export interface MarksLostResult {
  gradedCount: number;
  totalMaxMarks: number;
  totalObtainedMarks: number;
  marksLost: number;
  marksLostPercent: number; // 0-100, over graded assessments only
}

/** "Marks lost" — only counts assessments that have actually been graded. */
export function computeMarksLost(assessments: AssessmentScoreInput[]): MarksLostResult {
  const graded = assessments.filter((a) => a.obtainedMarks !== null);

  const totalMaxMarks = graded.reduce((sum, a) => sum + a.maxMarks, 0);
  const totalObtainedMarks = graded.reduce((sum, a) => sum + (a.obtainedMarks ?? 0), 0);
  const marksLost = totalMaxMarks - totalObtainedMarks;

  return {
    gradedCount: graded.length,
    totalMaxMarks,
    totalObtainedMarks,
    marksLost,
    marksLostPercent: totalMaxMarks > 0 ? (marksLost / totalMaxMarks) * 100 : 0,
  };
}

export interface ComponentInput {
  id: string;
  weightPercent: number;
  assessments: AssessmentScoreInput[];
}

export interface OverallScoreResult {
  /** Weighted percent secured so far, out of 100, based only on graded work. */
  securedWeightedPercent: number;
  /** Sum of component weight that still has ungraded assessments. */
  remainingWeightPercent: number;
}

/**
 * A component's weight is earned in proportion to (obtained/max) over its
 * OWN graded assessments; ungraded assessments' weight is "remaining", not
 * assumed to be zero or full.
 */
export function computeOverallScore(components: ComponentInput[]): OverallScoreResult {
  let securedWeightedPercent = 0;
  let remainingWeightPercent = 0;

  for (const component of components) {
    const graded = component.assessments.filter((a) => a.obtainedMarks !== null);
    const ungraded = component.assessments.filter((a) => a.obtainedMarks === null);

    const totalAssessments = component.assessments.length;
    if (totalAssessments === 0) {
      remainingWeightPercent += component.weightPercent;
      continue;
    }

    const gradedWeightShare = (graded.length / totalAssessments) * component.weightPercent;
    const ungradedWeightShare = (ungraded.length / totalAssessments) * component.weightPercent;

    if (graded.length > 0) {
      const gradedMax = graded.reduce((sum, a) => sum + a.maxMarks, 0);
      const gradedObtained = graded.reduce((sum, a) => sum + (a.obtainedMarks ?? 0), 0);
      const gradedRatio = gradedMax > 0 ? gradedObtained / gradedMax : 0;
      securedWeightedPercent += gradedWeightShare * gradedRatio;
    }

    remainingWeightPercent += ungradedWeightShare;
  }

  return { securedWeightedPercent, remainingWeightPercent };
}

/**
 * Required average (0-100) on all remaining (ungraded) weight to reach
 * `targetOverallPercent` overall. Returns null when there's no remaining
 * weight left to influence the outcome (already fully graded).
 */
export function computeRequiredFutureAverage(
  targetOverallPercent: number,
  overall: OverallScoreResult,
): number | null {
  if (overall.remainingWeightPercent <= 0) return null;

  const requiredPercent =
    ((targetOverallPercent - overall.securedWeightedPercent) / overall.remainingWeightPercent) *
    100;

  // Clamp to [0, 100+] — a value over 100 means the target is now
  // mathematically unreachable even with perfect remaining scores.
  return Math.max(0, requiredPercent);
}

// --- SGPA scenarios ---------------------------------------------------------

/**
 * 10-point scale mapping, matching common Indian university conventions.
 * This is a stated assumption, not a universal standard — confirm against
 * Person 2's actual grading policy before shipping.
 */
export function percentToGradePoint(percent: number): number {
  if (percent >= 90) return 10;
  if (percent >= 80) return 9;
  if (percent >= 70) return 8;
  if (percent >= 60) return 7;
  if (percent >= 50) return 6;
  if (percent >= 40) return 5;
  return 0;
}

export interface SubjectScenarioInput {
  subjectId: string;
  credits: number;
  projectedPercent: number;
}

export interface SgpaScenarioResult {
  sgpa: number;
  breakdown: { subjectId: string; gradePoint: number; credits: number }[];
}

export function computeSgpaScenario(subjects: SubjectScenarioInput[]): SgpaScenarioResult {
  const breakdown = subjects.map((s) => ({
    subjectId: s.subjectId,
    gradePoint: percentToGradePoint(s.projectedPercent),
    credits: s.credits,
  }));

  const totalCredits = breakdown.reduce((sum, b) => sum + b.credits, 0);
  const weightedSum = breakdown.reduce((sum, b) => sum + b.gradePoint * b.credits, 0);

  return {
    sgpa: totalCredits > 0 ? weightedSum / totalCredits : 0,
    breakdown,
  };
}

/** Minimum percent needed to reach a given 10-point grade point (reverse of percentToGradePoint). */
const GRADE_POINT_THRESHOLDS: [gradePoint: number, minPercent: number][] = [
  [10, 90],
  [9, 80],
  [8, 70],
  [7, 60],
  [6, 50],
  [5, 40],
];

export function minPercentForGradePoint(targetGradePoint: number): number {
  if (targetGradePoint <= 0) return 0;

  // Ascending order: find the smallest known band whose grade point is
  // still >= the target, so a fractional target (e.g. 7.5) correctly
  // rounds UP to the next real band (8 -> 70%), not down.
  const ascending = [...GRADE_POINT_THRESHOLDS].sort((a, b) => a[0] - b[0]);
  for (const [gp, threshold] of ascending) {
    if (targetGradePoint <= gp) return threshold;
  }
  return 100; // target exceeds the highest known band
}

export interface SgpaOutlookInput {
  subjectId: string;
  credits: number;
  /** From computeOverallScore: weighted percent already secured from graded work. */
  securedWeightedPercent: number;
  /** From computeOverallScore: weight percent still ungraded. */
  remainingWeightPercent: number;
}

export interface SgpaOutlookResult {
  /** SGPA as of right now, normalized over only the graded portion of each subject. */
  currentSgpa: number;
  /** SGPA if every remaining assessment scores 100%. */
  bestCaseSgpa: number;
  /** SGPA if every remaining assessment scores 0%. */
  worstCaseSgpa: number;
}

function sgpaForProjection(
  subjects: SgpaOutlookInput[],
  projectPercent: (s: SgpaOutlookInput) => number,
): number {
  const rows = subjects.map((s) => ({
    credits: s.credits,
    gradePoint: percentToGradePoint(projectPercent(s)),
  }));
  const totalCredits = rows.reduce((sum, r) => sum + r.credits, 0);
  const weightedSum = rows.reduce((sum, r) => sum + r.credits * r.gradePoint, 0);
  return totalCredits > 0 ? weightedSum / totalCredits : 0;
}

/** Current / best-case / worst-case SGPA outlook, per subject secured+remaining weight. */
export function computeSgpaOutlook(subjects: SgpaOutlookInput[]): SgpaOutlookResult {
  const currentSgpa = sgpaForProjection(subjects, (s) => {
    const gradedWeight = 100 - s.remainingWeightPercent;
    return gradedWeight > 0 ? (s.securedWeightedPercent / gradedWeight) * 100 : 0;
  });

  const bestCaseSgpa = sgpaForProjection(
    subjects,
    (s) => s.securedWeightedPercent + s.remainingWeightPercent,
  );

  const worstCaseSgpa = sgpaForProjection(subjects, (s) => s.securedWeightedPercent);

  return { currentSgpa, bestCaseSgpa, worstCaseSgpa };
}

// --- Risk severity -----------------------------------------------------------

export type RiskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RiskInput {
  securedWeightedPercent: number;
  remainingWeightPercent: number;
  requiredFutureAverage: number | null;
  /** Days until the next unstarted assessment's due date, if any. */
  daysToNextDeadline: number | null;
}

export interface RiskResult {
  severity: RiskSeverity;
  score: number; // 0-100, higher = riskier
  drivers: string[];
  recommendedActions: string[];
}

/**
 * Deterministic risk scoring. Drivers accumulate score; thresholds map score
 * to severity. No ML, no LLM — every number here traces to a rule below.
 */
export function computeRiskSeverity(input: RiskInput): RiskResult {
  let score = 0;
  const drivers: string[] = [];
  const recommendedActions: string[] = [];

  if (input.requiredFutureAverage !== null) {
    if (input.requiredFutureAverage > 100) {
      score += 60;
      drivers.push("Target grade is no longer mathematically achievable.");
      recommendedActions.push("Revisit your target grade for this subject.");
    } else if (input.requiredFutureAverage > 85) {
      score += 40;
      drivers.push("Remaining assessments require a very high average to hit your target.");
      recommendedActions.push("Prioritize study time for upcoming assessments in this subject.");
    } else if (input.requiredFutureAverage > 70) {
      score += 20;
      drivers.push("Remaining assessments require an above-average score.");
    }
  }

  if (input.securedWeightedPercent < 40 && input.remainingWeightPercent < 40) {
    score += 25;
    drivers.push("Most of the grade weight is already graded and currently low.");
    recommendedActions.push("Consider discussing options with your instructor.");
  }

  if (input.daysToNextDeadline !== null && input.daysToNextDeadline <= 3) {
    score += 15;
    drivers.push("An assessment in this subject is due within 3 days.");
    recommendedActions.push("Schedule focused prep time before the upcoming deadline.");
  }

  score = Math.min(100, score);

  let severity: RiskSeverity;
  if (score >= 70) severity = "CRITICAL";
  else if (score >= 45) severity = "HIGH";
  else if (score >= 20) severity = "MEDIUM";
  else severity = "LOW";

  if (drivers.length === 0) {
    drivers.push("No significant risk drivers detected.");
  }

  return { severity, score, drivers, recommendedActions };
}
