import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { PackageSchema } from '@/packages/schemas/package.schema';
import { packagesSeed } from './seeds';

class PackagesSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(PackageSchema);
    let inserted = 0;
    let skipped = 0;
    for (const row of packagesSeed) {
      const exists = await repo.findOneBy({ id: row.id });
      if (exists) {
        skipped++;
        continue;
      }
      await repo.save(repo.create(row));
      inserted++;
    }
    console.log(
      `Packages: ${inserted} inserted, ${skipped} skipped (total ${packagesSeed.length}).`,
    );
  }
}

export { PackagesSeeder };
