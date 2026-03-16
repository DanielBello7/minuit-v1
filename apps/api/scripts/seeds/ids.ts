/**
 * Fixed UUIDs for seed data so relations can reference each other.
 * Aligned with API entities: users, admins, packages, transactions, subscriptions, hubs, alarms, clocks, feedbacks.
 */
export const SEED_IDS = {
  users: {
    /** Regular user - danielbello.pro@gmail.com */
    client: '11111111-1111-1111-1111-111111111101',
    /** Admin user - gokebello@gmail.com */
    admin: '22222222-2222-2222-2222-222222222201',
  },
  admins: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
  settings: '00000000-0000-0000-0000-000000000001',
  packages: {
    free: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb001',
    pro: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb002',
    burst: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb003',
  },
  transaction: 'cccccccc-cccc-cccc-cccc-cccccccccc01',
  subscription: 'dddddddd-dddd-dddd-dddd-dddddddddd01',
  hub: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
  alarm: 'ffffffff-ffff-ffff-ffff-ffffffffff01',
  clocks: {
    one: '77777777-7777-7777-7777-777777777701',
    two: '77777777-7777-7777-7777-777777777702',
  },
  feedback: '99999999-9999-9999-9999-999999999901',
  alarms: '3b5f2a2b-9a7e-4c6a-9c3c-4c8c2b6d8f71',
} as const;
