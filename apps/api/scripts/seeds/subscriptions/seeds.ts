import { DURATION_PERIOD_ENUM } from '@repo/types';
import { SEED_IDS } from '../ids';
import { commonBase } from '../helpers';

const base = (id: string, index: number) => ({ ...commonBase(id, index) });

const now = new Date();
const expiresAt = new Date(
  now.getTime() + 1188 * 30 * 24 * 60 * 60 * 1000,
); // ~1188 months

export const subscriptionsSeed = [
  {
    ...base(SEED_IDS.subscription, 1),
    id: SEED_IDS.subscription,
    transaction_id: SEED_IDS.transaction,
    user_id: SEED_IDS.users.client,
    package_id: SEED_IDS.packages.free,
    currency_code: 'NGN',
    amount: '0',
    charge: '0',
    duration: 1188,
    duration_period: DURATION_PERIOD_ENUM.MONTHS,
    expires_at: expiresAt,
    last_used_at: now,
    used_at: now,
  },
];
