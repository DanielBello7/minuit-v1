import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { ClockSchema } from '@/clocks/schemas/clock.schema';
import { clocksSeed } from './seeds';

class ClocksSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(ClockSchema);
    let inserted = 0;
    let skipped = 0;
    for (const row of clocksSeed) {
      const exists = await repo.findOne({
        where: { user_id: row.user_id, city: row.city },
      });
      if (exists) {
        skipped++;
        continue;
      }
      await repo.save(repo.create(row));
      inserted++;
    }
    console.log(
      `Clocks: ${inserted} inserted, ${skipped} skipped (total ${clocksSeed.length}).`,
    );
  }
}

export { ClocksSeeder };
