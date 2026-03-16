import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { AlarmSchema } from '@/alarms/schemas/alarm.schema';
import { alarmsSeed } from './seeds';

class AlarmsSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(AlarmSchema);
    let inserted = 0;
    let skipped = 0;
    for (const row of alarmsSeed) {
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
      `Alarms: ${inserted} inserted, ${skipped} skipped (total ${alarmsSeed.length}).`,
    );
  }
}

export { AlarmsSeeder };
