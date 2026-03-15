/**
 * Integration tests for AlarmsService using Postgres test container.
 * Thorough tests for get_by_page: page pointer, next page, filtering.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmsService } from './alarms.service';
import { AlarmSchema } from './schemas/alarm.schema';
import { UserSchema } from '@/accounts/users/schemas/user.schema';
import { CreateAlarmDto } from './dto/create-alarm.dto';
import { SCHEDULE_TYPE, WEEKDAYS_ENUM } from '@repo/types';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';
import { JwtModule } from '@nestjs/jwt';
import { MutationsModule } from '@app/mutations';
import { AccountType } from '@repo/types';

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const userId = '00000000-0000-0000-4000-000000000001';
const userId2 = '00000000-0000-0000-4000-000000000002';

describe('AlarmsService (integration)', () => {
  const pg = new PostgresTestContainer();
  let app: TestingModule;
  let service: AlarmsService;
  let dataSource: DataSource;

  function validCreateDto(overrides: Partial<CreateAlarmDto> = {}): CreateAlarmDto {
    return {
      user_id: userId,
      ring_at: [
        {
          type: SCHEDULE_TYPE.WEEKLY,
          weekday: WEEKDAYS_ENUM.MONDAY,
          hour: 9,
          minute: 0,
          is_active: true,
        },
      ],
      is_active: true,
      city: 'Lagos',
      country: 'Nigeria',
      region: 'West',
      timezone: 'Africa/Lagos',
      ...overrides,
    };
  }

  beforeAll(async () => {
    await pg.start();

    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          pg.getTypeOrmOptions({
            entities: [AlarmSchema, UserSchema],
          }),
        ),
        TypeOrmModule.forFeature([AlarmSchema]),
        MutationsModule,
        JwtModule.register({
          global: true,
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: 86400 },
        }),
      ],
      providers: [AlarmsService],
    }).compile();

    service = app.get(AlarmsService);
    dataSource = app.get(getDataSourceToken());
  }, 60_000);

  afterAll(async () => {
    await dataSource?.destroy();
    await app?.close();
    await pg.stop();
  });

  beforeEach(async () => {
    const alarmRepo = dataSource.getRepository(AlarmSchema);
    const userRepo = dataSource.getRepository(UserSchema);
    await alarmRepo.deleteAll();
    await userRepo.deleteAll();
    await userRepo.save(
      userRepo.create({
        id: userId,
        firstname: 'Test',
        surname: 'User',
        email: 'alarms@test.com',
        username: 'alarmuser',
        timezone: 'Africa/Lagos',
        display_name: 'Test User',
        type: AccountType.Client,
        is_email_verified: false,
        has_password: false,
        dark_mode: false,
        is_onboarded: false,
      }),
    );
    await userRepo.save(
      userRepo.create({
        id: userId2,
        firstname: 'Other',
        surname: 'User',
        email: 'other@test.com',
        username: 'otheruser',
        timezone: 'UTC',
        display_name: 'Other User',
        type: AccountType.Client,
        is_email_verified: false,
        has_password: false,
        dark_mode: false,
        is_onboarded: false,
      }),
    );
  });

  async function createAlarm(overrides: Partial<CreateAlarmDto> = {}) {
    return service.create(validCreateDto(overrides));
  }

  describe('create', () => {
    it('creates and returns alarm with User relation', async () => {
      const result = await service.create(validCreateDto());
      expect(result.id).toBeDefined();
      expect(result.city).toBe('Lagos');
      expect(result.user_id).toBe(userId);
    });
  });

  describe('get_by_page', () => {
    it('returns empty docs when none exist', async () => {
      const result = await service.get_by_page({});
      expect(result.docs).toEqual([]);
      expect(result.total_docs).toBe(0);
      expect(result.page).toBe(1);
      expect(result.has_next_page).toBe(false);
    });

    it('returns first page with pick size and total_docs', async () => {
      await createAlarm({ city: 'Lagos' });
      await createAlarm({ city: 'Abuja' });
      await createAlarm({ city: 'Port Harcourt' });

      const result = await service.get_by_page({
        pagination: { page: 1, pick: 2 },
      });

      expect(result.docs.length).toBe(2);
      expect(result.pick).toBe(2);
      expect(result.total_docs).toBe(3);
      expect(result.page).toBe(1);
      expect(result.total_pages).toBe(2);
      expect(result.has_next_page).toBe(true);
      expect(result.next_page).toBe(2);
    });

    it('returns next page when using page pointer', async () => {
      await createAlarm({ city: 'A' });
      await createAlarm({ city: 'B' });
      await createAlarm({ city: 'C' });

      const first = await service.get_by_page({
        pagination: { page: 1, pick: 2 },
      });
      expect(first.docs.length).toBe(2);
      expect(first.next_page).toBe(2);

      const second = await service.get_by_page({
        pagination: { page: 2, pick: 2 },
      });
      expect(second.docs.length).toBe(1);
      expect(second.page).toBe(2);
      expect(second.has_next_page).toBe(false);
    });

    it('filters by user_id', async () => {
      await createAlarm({ user_id: userId, city: 'Lagos' });
      await createAlarm({ user_id: userId2, city: 'Abuja' });
      await createAlarm({ user_id: userId, city: 'PH' });

      const result = await service.get_by_page({ user_id: userId });
      expect(result.docs.length).toBe(2);
      result.docs.forEach((d) => expect(d.user_id).toBe(userId));
      expect(result.total_docs).toBe(2);
    });

    it('filters by city', async () => {
      await createAlarm({ city: 'Lagos' });
      await createAlarm({ city: 'Abuja' });
      await createAlarm({ city: 'Lagos' });

      const result = await service.get_by_page({ city: 'Lagos' });
      expect(result.docs.length).toBe(2);
      result.docs.forEach((d) => expect(d.city).toBe('Lagos'));
    });
  });

  describe('find_by_id', () => {
    it('returns alarm with User relation when found', async () => {
      const created = await createAlarm();
      const result = await service.find_by_id(created.id);
      expect(result.id).toBe(created.id);
      expect(result.User).toBeDefined();
      expect(result.User?.id).toBe(userId);
    });

    it('throws when not found', async () => {
      await expect(
        service.find_by_id('00000000-0000-0000-4000-000000000099'),
      ).rejects.toThrow();
    });
  });

  describe('modify / update', () => {
    it('updates only ring_at (modify strips city, region, timezone, user_id, is_active)', async () => {
      const created = await createAlarm();
      const newRingAt = [
        {
          type: SCHEDULE_TYPE.WEEKLY,
          weekday: WEEKDAYS_ENUM.WEDNESDAY,
          hour: 14,
          minute: 45,
          is_active: false,
        },
      ];
      const updated = await service.modify(created.id, { ring_at: newRingAt } as any);
      expect(updated.ring_at).toEqual(newRingAt);
      expect(updated.city).toBe(created.city);
    });
  });

  describe('remove', () => {
    it('removes alarm by id', async () => {
      const created = await createAlarm();
      await service.remove(created.id);
      await expect(service.find_by_id(created.id)).rejects.toThrow();
    });
  });
});
