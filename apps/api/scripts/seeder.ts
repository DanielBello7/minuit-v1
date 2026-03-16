import { AdminSeeder } from './seeds/accounts/admins/admins';
import { UserSeeder } from './seeds/accounts/users/users';
import { SettingsSeeder } from './seeds/settings/settings';
import { PackagesSeeder } from './seeds/packages/packages';
import { AlarmsSeeder } from './seeds/alarms/alarms';
import { ClocksSeeder } from './seeds/clocks/clocks';
import { FeedbacksSeeder } from './seeds/feedbacks/feedbacks';
import { TransactionsSeeder } from './seeds/transactions/transactions';
import { SubscriptionsSeeder } from './seeds/subscriptions/subscriptions';
import { HubsSeeder } from './seeds/hubs/hubs';
import { runSeeder } from 'typeorm-extension';
import datasource from './datasource';

const seeders = [
  UserSeeder,
  AdminSeeder,
  SettingsSeeder,
  PackagesSeeder,
  AlarmsSeeder,
  ClocksSeeder,
  FeedbacksSeeder,
  TransactionsSeeder,
  SubscriptionsSeeder,
  HubsSeeder,
];

void (async () => {
  await datasource.initialize();

  for (const SeederClass of seeders) {
    await runSeeder(datasource, SeederClass);
  }

  await datasource.destroy();
})().catch(console.error);
