export interface SubjectWorkspaceMapping {
  subjectId: string;
  sourceWorkspaceId: string;
  externalWorkspaceUrl: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING' | 'ERROR';
}

export interface SourceWorkspaceQueryPlan {
  subjectId: string;
  query: string;
  rationale: string;
  requiresCitations: boolean;
  fallbackAction?: string;
}

export class SchemaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaValidationError';
  }
}

// The Iron Validator
export function validateSourceWorkspaceQueryPlan(output: any, status: string): SourceWorkspaceQueryPlan {
  if (!output || typeof output !== 'object') {
    throw new SchemaValidationError('Output must be a valid JSON object.');
  }

  if (typeof output.subjectId !== 'string' || output.subjectId.trim() === '') {
    throw new SchemaValidationError('Missing or invalid subjectId. The agent must specify the target subject.');
  }

  if (typeof output.requiresCitations !== 'boolean') {
    throw new SchemaValidationError('requiresCitations must be a strict boolean.');
  }

  if (status === 'SUCCEEDED' && (typeof output.query !== 'string' || output.query.trim() === '')) {
    throw new SchemaValidationError('A SUCCEEDED status requires a non-empty query string.');
  }

  if (status === 'FAILED' && (!output.fallbackAction || output.fallbackAction.trim() === '')) {
    throw new SchemaValidationError('A FAILED status requires a clear fallbackAction for the user.');
  }

  return output as SourceWorkspaceQueryPlan;
}