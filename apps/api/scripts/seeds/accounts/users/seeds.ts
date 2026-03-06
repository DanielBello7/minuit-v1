import { AccountType, IUser } from '@repo/types';
import { SEED_IDS } from '@scripts/seeds/ids';
import { commonBase } from '@scripts/seeds/helpers';

const base = (id: string, index: number) => ({ ...commonBase(id, index) });

export const usersSeed: IUser[] = [
  {
    ...base(SEED_IDS.users.client, 1),
    firstname: 'Seed',
    surname: 'Client',
    email: 'client@seed.example.com',
    username: 'seedclient',
    timezone: 'UTC',
    display_name: 'Seed Client',
    type: AccountType.Client,
    is_email_verified: false,
    has_password: false,
    dark_mode: false,
    is_onboarded: false,
    password: undefined,
    avatar: undefined,
    refresh_token: undefined,
    last_login_date: undefined,
  },
  {
    ...base(SEED_IDS.users.admin, 2),
    firstname: 'Seed',
    surname: 'Admin',
    email: 'admin@seed.example.com',
    username: 'seedadmin',
    timezone: 'UTC',
    display_name: 'Seed Admin',
    type: AccountType.Admins,
    is_email_verified: false,
    has_password: false,
    dark_mode: false,
    is_onboarded: false,
    password: undefined,
    avatar: undefined,
    refresh_token: undefined,
    last_login_date: undefined,
  },
];
