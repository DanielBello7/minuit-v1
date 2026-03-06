import { createDatabase } from 'typeorm-extension';
import datasource from '../datasource';

/**
 * Helper script to create a PostgreSQL database using typeorm-extension.
 * This script is executed by create-db.ts using ts-node to ensure proper
 * TypeScript compilation and module resolution.
 *
 * The script:
 * - Loads the datasource configuration
 * - Uses typeorm-extension's createDatabase function
 * - Connects to the 'postgres' initial database to create the target database
 * - Exits with appropriate status codes
 */
async function main() {
  try {
    await createDatabase({
      options: datasource.options,
      initialDatabase: process.env.INITIAL_DATABASE ?? 'postgres',
      synchronize: false,
    });
    console.log('Database created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  }
}

main();
