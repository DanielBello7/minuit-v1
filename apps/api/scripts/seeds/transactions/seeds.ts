import {
  TRANSACTION_STATUS_ENUM,
  TRANSACTION_TYPE_ENUM,
} from '@repo/types';
import { SEED_IDS } from '../ids';
import { commonBase } from '../helpers';

const base = (id: string, index: number) => ({ ...commonBase(id, index) });

export const transactionsSeed = [
  {
    ...base(SEED_IDS.transaction, 1),
    id: SEED_IDS.transaction,
    user_id: SEED_IDS.users.client,
    amount: '0',
    charge: '0',
    currency_code: 'NGN',
    type: TRANSACTION_TYPE_ENUM.PAYMENT,
    status: TRANSACTION_STATUS_ENUM.COMPLETED,
    metadata: {
      reason: 'free subscription purchase',
      ref_id: 'seed',
      package_id: SEED_IDS.packages.free,
    },
    expires_at: new Date(Date.now() + 86400000),
    narration: undefined,
    gateway: 'internal',
    method: 'internal',
  },
];
