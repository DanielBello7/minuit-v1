import { spawn, ChildProcess } from 'child_process';

interface RunOptions {
  stdio?: 'inherit' | 'pipe' | Array<'inherit' | 'pipe' | 'ignore'>;
  shell?: boolean;
  cwd?: string;
}

interface CmdResult {
  stdout: string;
  stderr: string;
  code: number;
}

/**
 * Executes a command with spawn and inherits stdio by default.
 * This function runs a command and resolves/rejects based on the exit code.
 *
 * @param cmd - The command to execute
 * @param arg - Array of command arguments
 * @param env - Environment variables to merge with process.env
 * @param options - Additional spawn options
 * @returns Promise that resolves with exit code 0 on success
 * @throws Error if command exits with non-zero code
 */
export const run = (
  cmd: string,
  arg: string[],
  env: Record<string, string> = {},
  options?: RunOptions,
): Promise<number> => {
  return new Promise((resolve, reject) => {
    const child: ChildProcess = spawn(cmd, arg, {
      stdio: options?.stdio ?? 'inherit',
      shell: options?.shell ?? false,
      cwd: options?.cwd,
      env: {
        ...process.env,
        ...env,
      },
    });

    child.on('exit', (code) => {
      if (code === 0) resolve(code ?? 0);
      else reject(new Error(`command exited with code ${code}`));
    });
  });
};

/**
 * Executes a command and captures stdout/stderr output.
 * Unlike `run`, this function collects the command output and returns it.
 *
 * @param cmd - The command to execute
 * @param arg - Array of command arguments
 * @param env - Environment variables to merge with process.env
 * @returns Promise that resolves with command output and exit code
 * @throws Error with error message including stderr if command fails
 */
export const cmd = (
  cmd: string,
  arg: string[],
  env: Record<string, string> = {},
): Promise<CmdResult> => {
  return new Promise((resolve, reject) => {
    const child: ChildProcess = spawn(cmd, arg, {
      shell: false,
      env: {
        ...process.env,
        ...env,
      },
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr, code: code ?? 0 });
      else reject(new Error(`command failed with code ${code}\n${stderr}`));
    });
  });
};

/**
 * List of valid environment names that can be used in migration scripts.
 */
export const known_envs = [
  'development',
  'local',
  'production',
  'staging',
  'container',
] as const;

export const known_apps = ['finance', 'navigation', 'user'] as const;

/**
 * Checks if the provided value is a known/valid environment name.
 *
 * @param value - The environment name to validate
 * @returns True if the environment is known, false otherwise
 */
export function isKnownEnv(value: string): boolean {
  return known_envs.includes(value as (typeof known_envs)[number]);
}

/**
 * Checks if the provided app name is a known seedable application.
 * Valid seed apps: 'finance', 'navigation', 'user'
 *
 * @param app - The application name to validate
 * @returns True if the app is known and can be seeded, false otherwise
 */
export function isKnownSeed(app: string): boolean {
  return known_apps.includes(app as (typeof known_apps)[number]);
}
