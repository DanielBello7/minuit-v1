import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { SettingSchema } from '@/settings/schemas/setting.schema';
import { settingsSeed } from './seeds';

class SettingsSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(SettingSchema);
    let inserted = 0;
    let skipped = 0;
    for (const row of settingsSeed) {
      const exists = await repo.findOneBy({ id: row.id });
      if (exists) {
        skipped++;
        continue;
      }
      await repo.save(repo.create(row));
      inserted++;
    }
    console.log(
      `Settings: ${inserted} inserted, ${skipped} skipped (total ${settingsSeed.length}).`,
    );
  }
}

export { SettingsSeeder };
