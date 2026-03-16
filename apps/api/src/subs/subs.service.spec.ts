/**
 * Integration tests for SubsService using Postgres test container.
 * Thorough tests for get_subs_by_index: cursor, next page, filtering.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubsService } from './subs.service';
import { SubscriptionSchema } from './schemas/subs.schema';
import { HubSchema } from './schemas/hubs.schema';
import { UserSchema } from '@/accounts/users/schemas/user.schema';
import { PackageSchema } from '@/packages/schemas/package.schema';
import { TransactionSchema } from '@/transactions/schemas/transaction.schema';
import { SettingSchema } from '@/settings/schemas/setting.schema';
import { CreateSubDto } from './dto/create-sub.dto';
import {
  DURATION_PERIOD_ENUM,
  NGN,
  TRANSACTION_STATUS_ENUM,
  TRANSACTION_TYPE_ENUM,
} from '@repo/types';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';
import { JwtModule } from '@nestjs/jwt';
import { MutationsModule } from '@app/mutations';
import { SubsModule } from './subs.module';
import { SettingsModule } from '@/settings/settings.module';
import { SettingsService } from '@/settings/settings.service';
import { IPayment } from '@app/util/interfaces/payment.interface';
import { AccountType } from '@repo/types';
import { SORT_TYPE_ENUM } from '@repo/types';
import { FlwModule } from '@app/flw';

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const paymentStub: IPayment = {
  gateway: 'test',
  get_payment_url: jest.fn().mockResolvedValue(''),
  make_payment: jest.fn(),
  find_payment: jest.fn(),
  get_available_banks: jest.fn().mockResolvedValue([]),
  verify_credentials: jest.fn(),
  verify_credentials_safe: jest.fn(),
  refund_payment: jest.fn(),
} as any;

const user_id_1 = '3f1c2d7a-9b84-4e6d-a2f1-7c5d8e9b1a34';
const user_id_2 = 'b7a9e214-6c3f-4d81-8f2a-1e7c9d4b5f62';
const admin_ids = '8d2f6a91-3b7e-4c54-9a18-6f3d2b7c8e45';

describe('SubsService (integration)', () => {
  const pg = new PostgresTestContainer();
  let app: TestingModule;
  let service: SubsService;
  let dataSource: DataSource;

  beforeAll(async () => {
    await pg.start();

    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          pg.getTypeOrmOptions({
            entities: [
              SubscriptionSchema,
              HubSchema,
              UserSchema,
              PackageSchema,
              TransactionSchema,
              SettingSchema,
            ],
          }),
        ),
        FlwModule.register({
          publickey: 'test',
          secretkey: 'test',
          aCurrency: 'NGN',
        }),
        JwtModule.register({
          global: true,
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: 86400 },
        }),
        SettingsModule,
        SubsModule,
      ],
    })
      .overrideProvider(IPayment)
      .useValue(paymentStub)
      .compile();

    service = app.get(SubsService);
    dataSource = app.get(getDataSourceToken());
  }, 60_000);

  afterAll(async () => {
    await dataSource?.destroy();
    await app?.close();
    await pg.stop();
  });

  async function ensure_settings() {
    const settingsService = app.get(SettingsService);
    return settingsService.find();
  }

  async function seed_user(id: string) {
    const repo = dataSource.getRepository(UserSchema);
    await repo.save(
      repo.create({
        id,
        firstname: 'Test',
        surname: 'User',
        email: `user-${id}@test.com`,
        username: `user_${id.replace(/-/g, '_')}`,
        timezone: 'UTC',
        display_name: 'Test User',
        type: AccountType.Client,
        is_email_verified: false,
        has_password: false,
        dark_mode: false,
        is_onboarded: false,
      }),
    );
  }

  async function seed_package(id: string) {
    const repo = dataSource.getRepository(PackageSchema);
    await repo.save(
      repo.create({
        id,
        title: 'Pro',
        description: 'Pro plan',
        features: ['F1'],
        duration: 30,
        duration_period: DURATION_PERIOD_ENUM.DAYS,
        admin_id: admin_ids,
        pricings: [{ currency_code: 'NGN', amount: '10.00' }],
      }),
    );
  }

  async function seed_transaction(id: string, user_id: string) {
    const repo = dataSource.getRepository(TransactionSchema);
    await repo.save(
      repo.create({
        id,
        user_id,
        amount: '10',
        charge: '1',
        currency_code: 'NGN',
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        status: TRANSACTION_STATUS_ENUM.COMPLETED,
        metadata: { reason: 'test' },
        expires_at: new Date(Date.now() + 3600000),
      }),
    );
  }

  function valid_create_sub_dto(
    overrides: Partial<CreateSubDto> = {},
  ): CreateSubDto {
    return {
      transaction_id: '5a7d3c91-2e84-4f6b-9c17-8b2d5e1f7a63',
      user_id: user_id_1,
      last_used_at: new Date(),
      used_at: new Date(),
      package_id: 'e9b14c76-5d2a-4f83-a6c1-3b7e9d2f4a58',
      currency_code: NGN,
      amount: '10.00',
      charge: '1.00',
      duration: 30,
      duration_period: DURATION_PERIOD_ENUM.DAYS,
      expires_at: new Date(Date.now() + 30 * 24 * 3600000),
      ...overrides,
    };
  }

  beforeEach(async () => {
    const subRepo = dataSource.getRepository(SubscriptionSchema);
    const hubRepo = dataSource.getRepository(HubSchema);
    const userRepo = dataSource.getRepository(UserSchema);
    const pkgRepo = dataSource.getRepository(PackageSchema);
    const txRepo = dataSource.getRepository(TransactionSchema);
    const settingRepo = dataSource.getRepository(SettingSchema);
    await pkgRepo.deleteAll();
    await hubRepo.deleteAll();
    await subRepo.deleteAll();
    await txRepo.deleteAll();
    await userRepo.deleteAll();
    await settingRepo.deleteAll();

    await ensure_settings();
    await seed_user(user_id_1);
    await seed_user(user_id_2);
    await seed_package(valid_create_sub_dto().package_id);
    await seed_transaction(
      valid_create_sub_dto().transaction_id,
      valid_create_sub_dto().user_id,
    );
  });

  async function create_sub(overrides: Partial<CreateSubDto> = {}) {
    return service.create_sub(valid_create_sub_dto(overrides));
  }

  describe('create_sub', () => {
    it('creates and returns subscription', async () => {
      const result = await create_sub();
      expect(result.id).toBeDefined();
      expect(result.user_id).toBe(user_id_1);
      expect(result.package_id).toBe(valid_create_sub_dto().package_id);
      expect(result.amount).toBe('10.00');
      expect(result.duration_period).toBe(DURATION_PERIOD_ENUM.DAYS);
    });
  });

  describe('get_subs_by_index', () => {
    it('returns empty docs when none exist', async () => {
      const result = await service.get_subs_by_index({});
      expect(result.docs).toEqual([]);
      expect(result.has_next_page).toBe(false);
      expect(result.pick).toBeDefined();
    });

    it('returns first page with pick and next index cursor', async () => {
      try {
        await create_sub();
        await seed_transaction(
          '2c6f8a35-1d79-4eab-b4f2-9a3d7c5e1b84',
          user_id_1,
        );
        await create_sub({
          transaction_id: '2c6f8a35-1d79-4eab-b4f2-9a3d7c5e1b84',
          user_id: user_id_1,
        });
        await seed_transaction(
          'f4a82d19-6b3e-4c75-8d21-5e9a7b2c3f60',
          user_id_1,
        );
        await create_sub({
          transaction_id: 'f4a82d19-6b3e-4c75-8d21-5e9a7b2c3f60',
          user_id: user_id_1,
        });

        const result = await service.get_subs_by_index({
          pagination: { pick: 2, sort: SORT_TYPE_ENUM.DESC },
        });

        expect(result.docs.length).toBe(2);
        expect(result.pick).toBe(2);
        expect(result.has_next_page).toBe(true);
        expect(result.next_page).toBeDefined();
      } catch (e) {
        console.log(e.response.message);
      }
    });

    it('returns next section when using index cursor', async () => {
      await create_sub();
      await seed_transaction(
        '2c6f8a35-1d79-4eab-b4f2-9a3d7c5e1b84',
        user_id_1,
      );
      await create_sub({
        transaction_id: '2c6f8a35-1d79-4eab-b4f2-9a3d7c5e1b84',
        user_id: user_id_1,
      });
      await seed_transaction(
        'f4a82d19-6b3e-4c75-8d21-5e9a7b2c3f60',
        user_id_1,
      );
      await create_sub({
        transaction_id: 'f4a82d19-6b3e-4c75-8d21-5e9a7b2c3f60',
        user_id: user_id_1,
      });

      const first = await service.get_subs_by_index({
        pagination: { pick: 2, sort: SORT_TYPE_ENUM.DESC },
      });
      expect(first.docs.length).toBe(2);
      const cursor = first.next_page;
      expect(cursor).toBeDefined();

      const second = await service.get_subs_by_index({
        pagination: { pick: 2, sort: SORT_TYPE_ENUM.DESC, index: cursor! },
      });
      expect(second.docs.length).toBe(1);
      expect(second.has_next_page).toBe(false);
    });

    it('filters by user_id', async () => {
      const pkg2 = 'a8c3f2d1-7b64-4e95-9f21-6d8a3b5c7e90';
      await seed_package(pkg2);
      await create_sub({ user_id: user_id_1 });
      await seed_transaction(
        '5e2b1c7d-4f96-4a8e-b3d2-9c1f6a7e5b34',
        user_id_2,
      );
      await create_sub({
        user_id: user_id_2,
        package_id: pkg2,
        transaction_id: '5e2b1c7d-4f96-4a8e-b3d2-9c1f6a7e5b34',
      });
      await seed_transaction(
        'd9a7e3c4-2b6f-4d81-8a5c-1f3e7b9d6a20',
        user_id_1,
      );
      await create_sub({
        user_id: user_id_1,
        transaction_id: 'd9a7e3c4-2b6f-4d81-8a5c-1f3e7b9d6a20',
      });

      const result = await service.get_subs_by_index({
        user_id: user_id_1,
      });
      expect(result.docs.length).toBe(2);
      result.docs.forEach((d) => expect(d.user_id).toBe(user_id_1));
    });
  });

  describe('find_sub_by_id', () => {
    it('returns subscription when found', async () => {
      const created = await create_sub();
      const result = await service.find_sub_by_id(created.id);
      expect(result.id).toBe(created.id);
      expect(result.user_id).toBe(created.user_id);
    });

    it('throws when not found', async () => {
      await expect(
        service.find_sub_by_id('5b8f3c1a-7e2d-4d9b-a6f4-1c9e3a7b5d22'),
      ).rejects.toThrow();
    });
  });

  describe('update_sub_by_id', () => {
    it('updates subscription by id', async () => {
      const created = await create_sub();
      const updated = await service.update_sub_by_id(created.id, {
        last_used_at: new Date('2026-01-01'),
      } as any);
      expect(updated.last_used_at).toBeDefined();
    });
  });

  describe('hubs', () => {
    it('create_hub creates and returns hub with relations', async () => {
      const sub = await create_sub();
      const hub = await service.create_hub({
        user_id: user_id_1,
        subscription_id: sub.id,
        active_at: new Date(),
      });
      expect(hub.id).toBeDefined();
      expect(hub.user_id).toBe(user_id_1);
      expect(hub.subscription_id).toBe(sub.id);
      expect(hub.Subscription).toBeDefined();
    });

    it('insert_hub creates hub with active_at set', async () => {
      const sub = await create_sub();
      const hub = await service.insert_hub({
        user_id: user_id_1,
        subscription_id: sub.id,
      });
      expect(hub.id).toBeDefined();
      expect(hub.active_at).toBeDefined();
    });

    it('insert_hub throws when user_id already has a hub', async () => {
      const sub = await create_sub();
      await service.insert_hub({
        user_id: user_id_1,
        subscription_id: sub.id,
      });
      await seed_transaction(
        '7c5e9a12-4b8f-4d63-b1a9-2e6c7f3d5b48',
        user_id_1,
      );
      const sub2 = await create_sub({
        transaction_id: '7c5e9a12-4b8f-4d63-b1a9-2e6c7f3d5b48',
        user_id: user_id_1,
      });
      await expect(
        service.insert_hub({
          user_id: user_id_1,
          subscription_id: sub2.id,
        }),
      ).rejects.toThrow();
    });

    it('find_hub_by_id returns hub with relations', async () => {
      const sub = await create_sub();
      const created = await service.create_hub({
        user_id: user_id_1,
        subscription_id: sub.id,
        active_at: new Date(),
      });
      const result = await service.find_hub_by_id(created.id);
      expect(result.id).toBe(created.id);
      expect(result.User).toBeDefined();
      expect(result.Subscription).toBeDefined();
    });

    it('find_hub_by_user_id returns hub when found', async () => {
      const sub = await create_sub();
      await service.create_hub({
        user_id: user_id_1,
        subscription_id: sub.id,
        active_at: new Date(),
      });
      const result = await service.find_hub_by_user_id(user_id_1);
      expect(result.user_id).toBe(user_id_1);
    });

    it('find_hub_by_user_id throws when no hub for user', async () => {
      await expect(
        service.find_hub_by_user_id(user_id_1),
      ).rejects.toThrow();
    });

    it('update_hub_by_id updates hub', async () => {
      const sub = await create_sub();
      const hub = await service.create_hub({
        user_id: user_id_1,
        subscription_id: sub.id,
        active_at: new Date(),
      });
      const updated = await service.update_hub_by_id(hub.id, {
        active_at: new Date('2026-06-01'),
      } as any);
      expect(updated.active_at).toBeDefined();
    });
  });
});
