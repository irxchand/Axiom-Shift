export interface EvaluationComponentInput {
  name: string;
  weightPercent: number;
}

export interface EvaluationPlanInput {
  subjectId: string;
  components: EvaluationComponentInput[];
}