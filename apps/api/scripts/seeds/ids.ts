/**
 * Fixed UUIDs for seed data so relations can reference each other.
 * Aligned with API entities: users, admins.
 */
export const SEED_IDS = {
  users: {
    client: '11111111-1111-1111-1111-111111111101',
    admin: '22222222-2222-2222-2222-222222222201',
  },
  admins: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
  settings: '00000000-0000-0000-0000-000000000001',
} as const;
