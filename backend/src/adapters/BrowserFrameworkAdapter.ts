import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
export class AdapterError extends Error {
  constructor(message: string) { super(message); this.name = 'AdapterError'; }
}
export class TimeoutError extends Error {
  constructor(message: string) { super(message); this.name = 'TimeoutError'; }
}

const execFileAsync = promisify(execFile);

export interface BrowserTaskInput {
  action: 'INITIALIZE' | 'SEND_CHAT' | 'UPLOAD_FILE' | 'GET_STATUS';
  chatUrl?: string;
  workspaceId?: string;
  payload?: Record<string, unknown>;
  filePath?: string;
}

export interface BrowserTaskOutput<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  logs?: string[];
}

export class BrowserFrameworkAdapter {
  private pythonPath: string;
  private cliScriptPath: string;
  private defaultTimeoutMs: number;

  constructor(
    pythonPath = process.env.PYTHON_PATH || 'python',
    cliScriptPath = process.env.BROWSER_CLI_PATH || '../browser/runner/browser_framework_cli.py',
    defaultTimeoutMs = 60000
  ) {
    this.pythonPath = pythonPath;
    this.cliScriptPath = cliScriptPath;
    this.defaultTimeoutMs = defaultTimeoutMs;
  }

  async execute<T>(input: BrowserTaskInput, timeoutMs?: number): Promise<BrowserTaskOutput<T>> {
    const timeout = timeoutMs || this.defaultTimeoutMs;
    const jsonPayload = JSON.stringify(input);

    try {
      const { stdout, stderr } = await execFileAsync(
        this.pythonPath,
        [this.cliScriptPath, '--input', jsonPayload],
        { timeout, maxBuffer: 10 * 1024 * 1024 }
      );

      const parsed: BrowserTaskOutput<T> = JSON.parse(stdout.trim());
      if (!parsed.success) {
        throw new AdapterError(parsed.error || 'Browser framework returned failure status');
      }

      return parsed;
    } catch (err: any) {
      if (err.killed || err.signal === 'SIGTERM') {
        throw new TimeoutError(`Browser adapter timed out after ${timeout}ms`);
      }
      if (err instanceof AdapterError) throw err;
      throw new AdapterError(`Browser framework execution failed: ${err.message}`);
    }
  }
}