export interface Assessment {
  id: string;
  name: string;
  marksMax: number;
  isCompleted: boolean;
  weightage: number;
  dueDate?: Date;
}

export interface RiskProfile {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  drivers: string[];
}

export interface SubjectState {
  subjectId: string;
  subjectName: string;
  risk: RiskProfile;
  assessments: Assessment[];
}