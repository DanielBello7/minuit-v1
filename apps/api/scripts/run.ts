import { create_db } from './tools/create-db';
import { drop_db } from './tools/drop-db';
import { create_migration } from './tools/create-migrations';
import { run_migration } from './tools/run-migration';
import { seed_db } from './tools/seed-db';

const args = process.argv.slice(2).join(' ');
const tokens = args.split(' ');

const createdb = tokens.includes('createdb');
const dropdb = tokens.includes('dropdb');
const migration = tokens.includes('migrations');
const migrate = tokens.includes('migrate');
const seed = tokens.includes('seed');

/**
 * Builds and returns an array of database operations to execute based on command-line flags.
 * This function parses the environment and flags (createdb, dropdb, gen, migrate, seed) and
 * creates an array of async functions that will be executed sequentially.
 *
 * Supported operations:
 * - createdb: Creates the database if it doesn't exist
 * - dropdb: Drops the database (WARNING: destructive operation)
 * - gen: Generates a new migration file based on schema changes
 * - migrate: Runs pending database migrations
 * - seed: Seeds the database with initial data
 *
 * @returns Array of async functions representing operations to execute
 */
const get_options = (): Array<() => Promise<void>> => {
  const env_file = `.env`; // change this whenever you need to
  const log_file = `log/`;
  const datasource = `./scripts/datasource.ts`; // note its relative to the directory, basically __dirname
  const migrations = `./scripts/migrations/MIG-${Date.now()}`;
  const seed_files = `./scripts/seeder.ts`;

  const envs: Record<string, string> = {
    ENV_FILE: env_file,
    LOG_PATH: log_file,
  };

  const operations: Array<() => Promise<void>> = [];

  operations.push(async () => {
    if (createdb) {
      await create_db(envs);
    }
  });

  operations.push(async () => {
    if (dropdb) {
      await drop_db(envs);
    }
  });

  operations.push(async () => {
    if (migration) {
      await create_migration(datasource, migrations, envs);
      await run_migration(datasource, envs);
    }
  });

  operations.push(async () => {
    if (migrate) {
      await run_migration(datasource, envs);
    }
  });

  operations.push(async () => {
    if (seed) {
      await seed_db(seed_files, envs);
    }
  });

  return operations;
};

void (async () => {
  try {
    const operations = get_options();
    for (const operation of operations) {
      await operation();
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
