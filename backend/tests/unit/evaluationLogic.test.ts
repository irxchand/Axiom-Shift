import { describe, it, expect } from "vitest";
import {
  computeMarksLost,
  computeOverallScore,
  computeRequiredFutureAverage,
  computeSgpaScenario,
  computeSgpaOutlook,
  minPercentForGradePoint,
  computeRiskSeverity,
  percentToGradePoint,
} from "../../src/services/evaluationLogic.js";

describe("computeMarksLost", () => {
  it("counts only graded assessments", () => {
    const result = computeMarksLost([
      { id: "a1", maxMarks: 50, obtainedMarks: 41 },
      { id: "a2", maxMarks: 30, obtainedMarks: null }, // not graded yet
    ]);
    expect(result.gradedCount).toBe(1);
    expect(result.totalMaxMarks).toBe(50);
    expect(result.marksLost).toBe(9);
    expect(result.marksLostPercent).toBeCloseTo(18, 5);
  });

  it("returns zeroed result when nothing is graded", () => {
    const result = computeMarksLost([{ id: "a1", maxMarks: 50, obtainedMarks: null }]);
    expect(result.gradedCount).toBe(0);
    expect(result.marksLostPercent).toBe(0);
  });
});

describe("computeRequiredFutureAverage", () => {
  it("returns null when there is no remaining weight", () => {
    const overall = { securedWeightedPercent: 80, remainingWeightPercent: 0 };
    expect(computeRequiredFutureAverage(75, overall)).toBeNull();
  });

  it("computes the average needed on remaining weight to hit the target", () => {
    // Secured 40 of 100 target with 50 weight remaining -> need 70% on the rest.
    const overall = { securedWeightedPercent: 40, remainingWeightPercent: 50 };
    const required = computeRequiredFutureAverage(75, overall);
    expect(required).toBeCloseTo(70, 5);
  });

  it("clamps to 0 when already exceeding the target", () => {
    const overall = { securedWeightedPercent: 90, remainingWeightPercent: 10 };
    const required = computeRequiredFutureAverage(75, overall);
    expect(required).toBe(0);
  });

  it("can exceed 100, signaling an unreachable target", () => {
    const overall = { securedWeightedPercent: 10, remainingWeightPercent: 20 };
    const required = computeRequiredFutureAverage(75, overall);
    expect(required).toBeGreaterThan(100);
  });
});

describe("computeOverallScore", () => {
  it("secures weight proportional to graded ratio within a component", () => {
    const result = computeOverallScore([
      {
        id: "c1",
        weightPercent: 50,
        assessments: [{ id: "a1", maxMarks: 100, obtainedMarks: 80 }], // 80%
      },
      {
        id: "c2",
        weightPercent: 50,
        assessments: [{ id: "a2", maxMarks: 100, obtainedMarks: null }], // ungraded
      },
    ]);
    expect(result.securedWeightedPercent).toBeCloseTo(40, 5); // 50 * 0.8
    expect(result.remainingWeightPercent).toBeCloseTo(50, 5);
  });
});

describe("percentToGradePoint / computeSgpaScenario", () => {
  it("maps percent bands to grade points", () => {
    expect(percentToGradePoint(95)).toBe(10);
    expect(percentToGradePoint(85)).toBe(9);
    expect(percentToGradePoint(65)).toBe(7);
    expect(percentToGradePoint(30)).toBe(0);
  });

  it("computes a credit-weighted SGPA", () => {
    const result = computeSgpaScenario([
      { subjectId: "s1", credits: 4, projectedPercent: 90 }, // GP 10
      { subjectId: "s2", credits: 2, projectedPercent: 60 }, // GP 7
    ]);
    // (4*10 + 2*7) / 6 = 54/6 = 9
    expect(result.sgpa).toBeCloseTo(9, 5);
  });

  it("returns 0 for an empty subject list rather than dividing by zero", () => {
    expect(computeSgpaScenario([]).sgpa).toBe(0);
  });
});

describe("computeRiskSeverity", () => {
  it("reports LOW risk with no significant drivers when comfortably on track", () => {
    const result = computeRiskSeverity({
      securedWeightedPercent: 80,
      remainingWeightPercent: 20,
      requiredFutureAverage: 40,
      daysToNextDeadline: 20,
    });
    expect(result.severity).toBe("LOW");
  });

  it("reports CRITICAL when the target is mathematically unreachable", () => {
    const result = computeRiskSeverity({
      securedWeightedPercent: 10,
      remainingWeightPercent: 20,
      requiredFutureAverage: 130,
      daysToNextDeadline: 10,
    });
    expect(result.severity).toBe("CRITICAL");
    expect(result.drivers.some((d) => d.includes("mathematically"))).toBe(true);
  });

  it("escalates severity when a deadline is imminent", () => {
    const withoutDeadline = computeRiskSeverity({
      securedWeightedPercent: 50,
      remainingWeightPercent: 50,
      requiredFutureAverage: 75,
      daysToNextDeadline: null,
    });
    const withDeadline = computeRiskSeverity({
      securedWeightedPercent: 50,
      remainingWeightPercent: 50,
      requiredFutureAverage: 75,
      daysToNextDeadline: 1,
    });
    expect(withDeadline.score).toBeGreaterThan(withoutDeadline.score);
  });
});

describe("minPercentForGradePoint", () => {
  it("returns the correct threshold for exact and in-between grade points", () => {
    expect(minPercentForGradePoint(10)).toBe(90);
    expect(minPercentForGradePoint(9)).toBe(80);
    expect(minPercentForGradePoint(7.5)).toBe(70); // between 7 and 8 -> needs GP 8 threshold
    expect(minPercentForGradePoint(0)).toBe(0);
  });
});

describe("computeSgpaOutlook (current / best case / worst case)", () => {
  it("best case is always >= current, which is always >= worst case", () => {
    const subjects = [
      { subjectId: "s1", credits: 4, securedWeightedPercent: 40, remainingWeightPercent: 50 },
      { subjectId: "s2", credits: 3, securedWeightedPercent: 20, remainingWeightPercent: 30 },
    ];
    const outlook = computeSgpaOutlook(subjects);
    expect(outlook.bestCaseSgpa).toBeGreaterThanOrEqual(outlook.currentSgpa);
    expect(outlook.currentSgpa).toBeGreaterThanOrEqual(outlook.worstCaseSgpa);
  });

  it("collapses to a single value when everything is already graded (no remaining weight)", () => {
    const subjects = [
      { subjectId: "s1", credits: 4, securedWeightedPercent: 85, remainingWeightPercent: 0 },
    ];
    const outlook = computeSgpaOutlook(subjects);
    expect(outlook.currentSgpa).toBe(outlook.bestCaseSgpa);
    expect(outlook.currentSgpa).toBe(outlook.worstCaseSgpa);
    expect(outlook.currentSgpa).toBe(9); // 85% -> grade point 9
  });

  it("worst case assumes 0 on all remaining weight", () => {
    const subjects = [
      { subjectId: "s1", credits: 4, securedWeightedPercent: 30, remainingWeightPercent: 70 },
    ];
    const outlook = computeSgpaOutlook(subjects);
    // 30% secured out of 100 total -> grade point for 30% = 0
    expect(outlook.worstCaseSgpa).toBe(0);
  });

  it("best case assumes 100 on all remaining weight (secured + remaining)", () => {
    const subjects = [
      { subjectId: "s1", credits: 4, securedWeightedPercent: 30, remainingWeightPercent: 70 },
    ];
    const outlook = computeSgpaOutlook(subjects);
    // 30 + 70 = 100% -> grade point 10
    expect(outlook.bestCaseSgpa).toBe(10);
  });

  it("returns 0 for an empty subject list rather than dividing by zero", () => {
    expect(computeSgpaOutlook([]).currentSgpa).toBe(0);
  });
});
