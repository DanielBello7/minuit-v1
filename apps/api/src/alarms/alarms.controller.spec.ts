/**
 * Integration tests for AlarmsController using Postgres test container.
 * Real AlarmsService and controller; controller methods called directly (guards not executed).
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmsController } from './alarms.controller';
import { AlarmSchema } from './schemas/alarm.schema';
import { UserSchema } from '@/accounts/users/schemas/user.schema';
import { AlarmsModule } from './alarms.module';
import { CreateAlarmDto } from './dto/create-alarm.dto';
import { UpdateAlarmDto } from './dto/update-alarm.dto';
import { AccountType, SCHEDULE_TYPE, WEEKDAYS_ENUM } from '@repo/types';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';
import { JwtModule } from '@nestjs/jwt';
import { QueryAlarmsByPage } from './dto/query-alarm.dto';
import { InsertAlarmDto } from './dto/insert-alarm.dto';

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const user_id = '8f3d6a2b-4c1e-4e9f-b6d2-3a7c5f1e9b44';

function valid_create_dto(
  overrides: Partial<InsertAlarmDto> = {},
): InsertAlarmDto {
  return {
    user_id: user_id,
    ring_at: [
      {
        type: SCHEDULE_TYPE.WEEKLY,
        weekday: WEEKDAYS_ENUM.MONDAY,
        hour: 9,
        minute: 0,
        is_active: true,
      },
    ],
    city: 'Lagos',
    country: 'Nigeria',
    region: 'West',
    timezone: 'Africa/Lagos',
    ...overrides,
  };
}

describe('AlarmsController (integration)', () => {
  const pg = new PostgresTestContainer();
  let app: TestingModule;
  let controller: AlarmsController;
  let dataSource: DataSource;

  beforeAll(async () => {
    await pg.start();

    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          pg.getTypeOrmOptions({
            entities: [AlarmSchema, UserSchema],
          }),
        ),
        JwtModule.register({
          global: true,
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: 86400 },
        }),
        AlarmsModule,
      ],
    }).compile();

    controller = app.get(AlarmsController);
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
        id: user_id,
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
  });

  describe('create', () => {
    it('creates alarm and returns it', async () => {
      const body = valid_create_dto();
      const result = await controller.create(body);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.user_id).toBe(body.user_id);
      expect(result.city).toBe(body.city);
      expect(result.country).toBe(body.country);
      expect(result.ring_at).toEqual(body.ring_at);
      expect(result.is_active).toBe(true);
    });

    it('propagates validation errors for invalid body', async () => {
      await expect(
        controller.create({
          ...valid_create_dto(),
          user_id: 'not-a-uuid',
        } as CreateAlarmDto),
      ).rejects.toThrow();
    });
  });

  describe('find_by_id', () => {
    it('returns alarm when found', async () => {
      const create = await controller.create(valid_create_dto());
      const result = await controller.find_by_id(create.id);

      expect(result.id).toBe(create.id);
      expect(result.city).toBe(create.city);
    });

    it('propagates errors for non-existent id', async () => {
      await expect(
        controller.find_by_id('00000000-0000-0000-4000-000000000099'),
      ).rejects.toThrow();
    });
  });

  describe('get_by_pages', () => {
    it('returns paginated list (empty when none)', async () => {
      const result = await controller.get_by_pages(
        {} as QueryAlarmsByPage,
      );

      expect(result).toBeDefined();
      expect(result.docs).toEqual([]);
      expect(result.total_docs).toBe(0);
      expect(result).toHaveProperty('has_next_page');
      expect(result).toHaveProperty('page');
    });

    it('returns alarms after creating', async () => {
      await controller.create(valid_create_dto());
      await controller.create(valid_create_dto({ city: 'Abuja' }));

      const result = await controller.get_by_pages(
        {} as QueryAlarmsByPage,
      );

      expect(result.total_docs).toBe(2);
      expect(result.docs.length).toBe(2);
    });
  });

  describe('update', () => {
    it('updates alarm by id (only ring_at is updatable via modify)', async () => {
      const created = await controller.create(valid_create_dto());
      const newRingAt: UpdateAlarmDto['ring_at'] = [
        {
          type: SCHEDULE_TYPE.WEEKLY as const,
          weekday: WEEKDAYS_ENUM.TUESDAY,
          hour: 10,
          minute: 30,
          is_active: true,
        },
      ];
      const body: UpdateAlarmDto = { ring_at: newRingAt };

      const result = await controller.update(created.id, body);

      expect(result.ring_at).toEqual(newRingAt);
      expect(result.city).toBe(created.city); // city/region/timezone etc. are not updated by modify
    });

    it('propagates errors for invalid id', async () => {
      await expect(
        controller.update('00000000-0000-0000-4000-000000000099', {
          ring_at: valid_create_dto().ring_at,
        } as UpdateAlarmDto),
      ).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('removes alarm by id', async () => {
      const created = await controller.create(valid_create_dto());

      await controller.remove(created.id);

      const list = await controller.get_by_pages({} as any);
      expect(list.docs.find((d) => d.id === created.id)).toBeUndefined();
    });

    it('propagates errors for invalid id', async () => {
      await expect(
        controller.remove('00000000-0000-0000-4000-000000000099'),
      ).rejects.toThrow();
    });
  });
});
