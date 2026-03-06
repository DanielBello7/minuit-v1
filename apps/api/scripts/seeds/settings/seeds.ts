import { ISettings } from '@repo/types';
import { SEED_IDS } from '../ids';
import { commonBase } from '../helpers';

const base = (id: string, index: number) => ({ ...commonBase(id, index) });

export const settingsSeed: ISettings[] = [
  {
    ...base(SEED_IDS.settings, 1),
    id: SEED_IDS.settings,
    version: '1.0.0',
    max_free_alarms: 1,
    max_free_clocks: 3,
  },
];
