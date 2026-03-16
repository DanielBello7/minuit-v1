import { CLOCK_FORMAT } from '@repo/types';
import { SEED_IDS } from '../ids';

export const clocksSeed = [
  {
    user_id: SEED_IDS.users.client,
    city: 'London',
    region: 'England',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    format: CLOCK_FORMAT.DIGITAL,
    is_active: true,
  },
  {
    user_id: SEED_IDS.users.client,
    city: 'Tokyo',
    region: 'Kanto',
    country: 'Japan',
    timezone: 'Asia/Tokyo',
    format: CLOCK_FORMAT.ANALOG,
    is_active: true,
  },
];
