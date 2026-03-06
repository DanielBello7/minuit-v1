import { DataSource } from 'typeorm';
import { run } from './cmd';
import * as path from 'path';

/**
 * Checks whether there are schema changes between
 * entities and the current database schema.
 *
 * This uses TypeORM's internal schema diff engine —
 * the same mechanism used by migration:generate.
 */
const hasSchemaChanges = async (dataSource: DataSource): Promise<boolean> => {
  const schemaBuilder = dataSource.driver.createSchemaBuilder();
  const sqlInMemory = await schemaBuilder.log();

  return sqlInMemory.upQueries.length > 0 || sqlInMemory.downQueries.length > 0;
};

/**
 * Generates a new TypeORM migration ONLY if schema changes exist.
 *
 * @param datasourcePath Path to the TypeORM datasource file
 * @param migrationName Name/path of the migration to generate
 * @param envs Environment variables for the process
 */
export const create_migration = async (
  datasourcePath: string,
  migrationName: string,
  envs: Record<string, string> = {},
): Promise<void> => {
  let dataSource: DataSource | null = null;

  try {
    // Resolve the datasource path to absolute path for dynamic import
    const resolvedDatasourcePath = path.isAbsolute(datasourcePath)
      ? datasourcePath
      : path.resolve(process.cwd(), datasourcePath);

    // Dynamically import the datasource
    const datasourceModule = await import(resolvedDatasourcePath);
    dataSource = datasourceModule.default ?? datasourceModule.AppDataSource;

    if (!(dataSource instanceof DataSource)) {
      throw new Error(
        'Datasource file must export a TypeORM DataSource (default or AppDataSource)',
      );
    }

    // Initialize datasource
    await dataSource.initialize();

    // 🔍 Check for actual schema changes
    const hasChanges = await hasSchemaChanges(dataSource);

    if (!hasChanges) {
      console.log('No schema changes detected — skipping migration generation');
      return;
    }

    // Close connection BEFORE running CLI
    await dataSource.destroy();

    // 🧬 Generate migration
    await run(
      'npx',
      [
        'ts-node',
        '-r',
        'tsconfig-paths/register',
        '--project',
        './tsconfig.json',
        './node_modules/typeorm/cli',
        '-d',
        datasourcePath,
        'migration:generate',
        migrationName,
      ],
      envs,
    );

    console.log(`Migration generated successfully: ${migrationName}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error('Migration generation failed:', message);
  } finally {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  }
};
