import { ADMIN_LEVEL_ENUM, IAdmin } from '@repo/types';
import { SEED_IDS } from '@scripts/seeds/ids';
import { commonBase } from '@scripts/seeds/helpers';

const base = (id: string, index: number) => ({ ...commonBase(id, index) });

export const adminsSeed: IAdmin[] = [
  {
    ...base(SEED_IDS.admins, 1),
    user_id: SEED_IDS.users.admin,
    level: ADMIN_LEVEL_ENUM.MASTER,
  },
];
