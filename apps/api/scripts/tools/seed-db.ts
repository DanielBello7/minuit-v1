import { run } from './cmd';

/**
 * Seeds the database with initial data by running a seed script.
 * This function executes a TypeScript seed file to populate the database
 * with initial/default data.
 *
 * @param seed_url - Path to the seed TypeScript file to execute
 * @param envs - Environment variables to pass to the command
 * @returns Promise that resolves when seeding completes or is skipped
 * @throws Error Silently catches errors and logs 'skipping seeding'
 */
export const seed_db = async (
  seed_url: string,
  envs: Record<string, string> = {},
): Promise<void> => {
  try {
    await run(
      'npx',
      ['ts-node', '-r', 'tsconfig-paths/register', seed_url],
      envs,
    );
  } catch {
    console.log('skipping seeding');
  }
};
