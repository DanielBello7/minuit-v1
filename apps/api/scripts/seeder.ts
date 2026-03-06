import { AdminSeeder } from './seeds/accounts/admins/admins';
import { UserSeeder } from './seeds/accounts/users/users';
import { SettingsSeeder } from './seeds/settings/settings';
import { runSeeder } from 'typeorm-extension';
import datasource from './datasource';

const seeders = [UserSeeder, AdminSeeder, SettingsSeeder];

void (async () => {
  await datasource.initialize();

  for (const SeederClass of seeders) {
    await runSeeder(datasource, SeederClass);
  }

  await datasource.destroy();
})().catch(console.error);
