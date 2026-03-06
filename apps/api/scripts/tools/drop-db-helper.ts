import { dropDatabase } from 'typeorm-extension';
import datasource from '../datasource';

/**
 * Helper script to drop a PostgreSQL database using typeorm-extension.
 * This script is executed by drop-db.ts using ts-node to ensure proper
 * TypeScript compilation and module resolution.
 *
 * The script:
 * - Loads the datasource configuration
 * - Uses typeorm-extension's dropDatabase function
 * - Connects to the 'postgres' initial database to drop the target database
 * - Exits with appropriate status codes
 *
 * WARNING: This will permanently delete the database and all its data!
 */
async function main() {
  try {
    await dropDatabase({
      options: datasource.options,
      initialDatabase: 'postgres',
    });
    console.log('Database dropped successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error dropping database:', error);
    process.exit(1);
  }
}

main();
