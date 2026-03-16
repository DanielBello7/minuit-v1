import { IAlarm, SCHEDULE_TYPE, WEEKDAYS_ENUM } from '@repo/types';
import { SEED_IDS } from '../ids';
import { commonBase } from '../helpers';

const base = (id: string, index: number) => ({ ...commonBase(id, index) });

export const alarmsSeed: IAlarm[] = [
  {
    ...base(SEED_IDS.alarms, 0),
    user_id: SEED_IDS.users.client,
    ring_at: [
      {
        type: SCHEDULE_TYPE.WEEKLY,
        weekday: WEEKDAYS_ENUM.MONDAY,
        hour: 8,
        minute: 0,
        is_active: true,
      },
    ],
    is_active: true,
    city: 'Lagos',
    country: 'Nigeria',
    region: 'Lagos',
    timezone: 'Africa/Lagos',
  },
];
