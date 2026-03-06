import { run } from './cmd';
import * as path from 'path';

/**
 * Creates a new PostgreSQL database using TypeORM extension.
 * This function will create the database if it doesn't exist, using the
 * specified datasource configuration and environment variables.
 *
 * @param datasource - Path to the TypeORM datasource configuration file (not used, kept for API compatibility)
 * @param env - Environment variables to pass to the command
 * @returns Promise that resolves when database creation completes successfully
 * @throws Error if database creation fails
 */
export const create_db = async (
  env: Record<string, string> = {},
): Promise<void> => {
  // Use ts-node to run the helper script that uses typeorm-extension programmatically
  // This ensures TypeScript files can be loaded properly
  const helperScript = path.join(__dirname, 'create-db-helper.ts');

  await run(
    'npx',
    [
      'ts-node',
      '-r',
      'tsconfig-paths/register',
      '--project',
      './tsconfig.json',
      helperScript,
    ],
    env,
  );
};
