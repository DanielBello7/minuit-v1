import { run } from './cmd';

/**
 * Executes pending database migrations using TypeORM CLI.
 * This function runs all pending migrations in order to update the database
 * schema to match the latest migration files.
 *
 * @param datasource - Path to the TypeORM datasource configuration file
 * @param envs - Environment variables to pass to the command
 * @returns Promise that resolves when all migrations complete successfully
 * @throws Error if any migration fails to execute
 */
export const run_migration = async (
  datasource: string,
  envs: Record<string, string> = {},
): Promise<void> => {
  await run(
    'npx',
    [
      'ts-node',
      '-r',
      'tsconfig-paths/register',
      '--project',
      './tsconfig.json',
      './node_modules/typeorm/cli',
      'migration:run',
      '-d',
      datasource,
    ],
    envs,
  );

  // don't use, this moves migrations into a "used" folder
  // await run(
  //   'mv',
  //   ['*', '../used'],
  //   {},
  //   { cwd: 'scripts/migrations', shell: true },
  // );
};
