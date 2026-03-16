import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { SubscriptionSchema } from '@/subs/schemas/subs.schema';
import { subscriptionsSeed } from './seeds';

class SubscriptionsSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(SubscriptionSchema);
    let inserted = 0;
    let skipped = 0;
    for (const row of subscriptionsSeed) {
      const exists = await repo.findOneBy({ id: row.id });
      if (exists) {
        skipped++;
        continue;
      }
      await repo.save(repo.create(row as any));
      inserted++;
    }
    console.log(
      `Subscriptions: ${inserted} inserted, ${skipped} skipped (total ${subscriptionsSeed.length}).`,
    );
  }
}

export { SubscriptionsSeeder };
