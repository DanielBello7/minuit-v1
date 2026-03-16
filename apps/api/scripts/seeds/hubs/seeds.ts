import { SEED_IDS } from '../ids';
import { commonBase } from '../helpers';

const base = (id: string, index: number) => ({ ...commonBase(id, index) });

export const hubsSeed = [
  {
    ...base(SEED_IDS.hub, 1),
    id: SEED_IDS.hub,
    user_id: SEED_IDS.users.client,
    subscription_id: SEED_IDS.subscription,
    active_at: new Date(),
  },
];
