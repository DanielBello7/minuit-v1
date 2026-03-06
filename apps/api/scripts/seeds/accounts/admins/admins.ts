import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { AdminSchema } from '@/accounts/admins/schemas/admin.schema';
import { adminsSeed } from './seeds';

class AdminSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(AdminSchema);
    let inserted = 0;
    let skipped = 0;
    for (const row of adminsSeed) {
      const exists = await repo.findOneBy({ id: row.id });
      if (exists) {
        skipped++;
        continue;
      }
      await repo.save(repo.create(row));
      inserted++;
    }
    console.log(`Admins: ${inserted} inserted, ${skipped} skipped (total ${adminsSeed.length}).`);
  }
}

export { AdminSeeder };
