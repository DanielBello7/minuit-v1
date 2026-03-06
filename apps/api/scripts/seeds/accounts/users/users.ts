import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { UserSchema } from '@/accounts/users/schemas/user.schema';
import { usersSeed } from './seeds';

class UserSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(UserSchema);
    let inserted = 0;
    let skipped = 0;
    for (const row of usersSeed) {
      const exists = await repo.findOneBy({ id: row.id });
      if (exists) {
        skipped++;
        continue;
      }
      await repo.save(repo.create(row));
      inserted++;
    }
    console.log(`Users: ${inserted} inserted, ${skipped} skipped (total ${usersSeed.length}).`);
  }
}

export { UserSeeder };
