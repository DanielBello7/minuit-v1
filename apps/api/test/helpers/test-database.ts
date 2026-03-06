import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

export type TestDbConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

let container: StartedPostgreSqlContainer | null = null;

/**
 * Start a Postgres container for integration tests.
 * Call once in beforeAll; use getTestDbConfig() in tests.
 */
export async function startTestDatabase(): Promise<TestDbConfig> {
  if (container) {
    return getTestDbConfig();
  }
  container = await new PostgreSqlContainer('postgres:16-alpine').start();
  return getTestDbConfig();
}

export function getTestDbConfig(): TestDbConfig {
  if (!container) {
    throw new Error('Test database not started. Call startTestDatabase() in beforeAll.');
  }
  return {
    host: container.getHost(),
    port: container.getPort(),
    username: container.getUsername(),
    password: container.getPassword(),
    database: container.getDatabase(),
  };
}

/**
 * Stop the Postgres container. Call in afterAll.
 */
export async function stopTestDatabase(): Promise<void> {
  if (container) {
    await container.stop();
    container = null;
  }
}
