import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { HubSchema } from '@/subs/schemas/hubs.schema';
import { hubsSeed } from './seeds';

class HubsSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(HubSchema);
    let inserted = 0;
    let skipped = 0;
    for (const row of hubsSeed) {
      const exists = await repo.findOneBy({ id: row.id });
      if (exists) {
        skipped++;
        continue;
      }
      await repo.save(repo.create(row as any));
      inserted++;
    }
    console.log(
      `Hubs: ${inserted} inserted, ${skipped} skipped (total ${hubsSeed.length}).`,
    );
  }
}

export { HubsSeeder };
