import { ISettings, NGN, USD, TRANSACTION_TYPE_ENUM } from '@repo/types';
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
    transaction_expiry_hours: 6,
    currencies: [
      { code: NGN, name: 'Naira', symbol: '₦' },
      { code: USD, name: 'US Dollar', symbol: '$' },
    ],
    charges: {
      [TRANSACTION_TYPE_ENUM.PAYMENT]: [
        { currency_code: NGN, amount: '5' },
        { currency_code: USD, amount: '0.05' },
      ],
      [TRANSACTION_TYPE_ENUM.REFUNDS]: [
        { currency_code: NGN, amount: '1' },
        { currency_code: USD, amount: '0.01' },
      ],
    },
  },
];
