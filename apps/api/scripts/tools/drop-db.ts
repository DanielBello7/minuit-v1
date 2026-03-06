import { run } from './cmd';
import * as path from 'path';

/**
 * Drops a PostgreSQL database using TypeORM extension.
 * This function will drop the database specified in the datasource configuration.
 *
 * WARNING: This operation is destructive and will permanently delete the database
 * and all its data. Use with caution!
 *
 * @param datasource - Path to the TypeORM datasource configuration file (not used, kept for API compatibility)
 * @param env - Environment variables to pass to the command
 * @returns Promise that resolves when database drop completes successfully
 * @throws Error if database drop fails
 */
export const drop_db = async (
  env: Record<string, string> = {},
): Promise<void> => {
  // Use ts-node to run the helper script that uses typeorm-extension programmatically
  // This ensures TypeScript files can be loaded properly
  const helperScript = path.join(__dirname, 'drop-db-helper.ts');

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
