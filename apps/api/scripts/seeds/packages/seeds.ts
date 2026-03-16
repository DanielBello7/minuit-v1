import {
  DURATION_PERIOD_ENUM,
  IPackage,
  NGN,
  PRICING_TYPE_ENUM,
  USD,
} from '@repo/types';
import { SEED_IDS } from '../ids';
import { commonBase } from '../helpers';

const base = (id: string, index: number) => ({ ...commonBase(id, index) });

export const packagesSeed: IPackage[] = [
  {
    ...base(SEED_IDS.packages.free, 1),
    id: SEED_IDS.packages.free,
    type: PRICING_TYPE_ENUM.FREE,
    title: 'Free',
    description: 'Free tier',
    features: [
      'Add a maximum of 3 cities for clocks',
      'Use the main clock timezone time comparison feature',
      'Maximum of 1 alarm',
    ],
    duration: 1188,
    duration_period: DURATION_PERIOD_ENUM.MONTHS,
    admin_id: SEED_IDS.users.admin,
    pricings: [
      { currency_code: NGN, amount: '0' },
      { currency_code: USD, amount: '0' },
    ],
  },
  {
    ...base(SEED_IDS.packages.pro, 2),
    id: SEED_IDS.packages.pro,
    type: PRICING_TYPE_ENUM.PAID,
    title: 'Pro',
    description: 'Pro monthly plan',
    features: [
      'Maximum of 10 cities for clocks',
      'Use the main clock features',
      'Maximum of 5 alarms',
    ],
    duration: 1,
    duration_period: DURATION_PERIOD_ENUM.MONTHS,
    admin_id: SEED_IDS.users.admin,
    pricings: [
      { currency_code: NGN, amount: '500' },
      { currency_code: USD, amount: '5' },
    ],
  },
  {
    ...base(SEED_IDS.packages.burst, 3),
    id: SEED_IDS.packages.burst,
    type: PRICING_TYPE_ENUM.PAID,
    title: 'Burst',
    description: 'Burst monthly plan',
    features: [
      'Unlimited cities for clocks',
      'Use the main clock feature apps',
      'Unlimited alarms',
    ],
    duration: 1,
    duration_period: DURATION_PERIOD_ENUM.MONTHS,
    admin_id: SEED_IDS.users.admin,
    pricings: [
      { currency_code: NGN, amount: '1000' },
      { currency_code: USD, amount: '10' },
    ],
  },
];
