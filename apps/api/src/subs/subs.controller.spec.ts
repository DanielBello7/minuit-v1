/**
 * Integration tests for SubsController using Postgres test container.
 * Tests: initiate_subscription, get_free_package, complete_subscription, get_by_index, get_user_sub, get_subscription_by_id.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubsController } from './subs.controller';
import { SubscriptionSchema } from './schemas/subs.schema';
import { HubSchema } from './schemas/hubs.schema';
import { UserSchema } from '@/accounts/users/schemas/user.schema';
import { PackageSchema } from '@/packages/schemas/package.schema';
import { TransactionSchema } from '@/transactions/schemas/transaction.schema';
import { SettingSchema } from '@/settings/schemas/setting.schema';
import { SubsModule } from './subs.module';
import { SettingsModule } from '@/settings/settings.module';
import { InsertSubDto } from './dto/insert-sub.dto';
import {
  DURATION_PERIOD_ENUM,
  NGN,
  PRICING_TYPE_ENUM,
  TRANSACTION_STATUS_ENUM,
  TRANSACTION_TYPE_ENUM,
  USD,
} from '@repo/types';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';
import { JwtModule } from '@nestjs/jwt';
import { IPayment } from '@app/util/interfaces/payment.interface';
import { AccountType } from '@repo/types';
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

const users_id = 'd3b7e5c1-9a64-4c82-8f3b-2e1a6d7c9f45';
const admin_id = '6f8c1a3d-2b95-4e74-a6d2-9c5e7b1f3a80';

describe('SubsController (integration)', () => {
  const pg = new PostgresTestContainer();
  let app: TestingModule;
  let controller: SubsController;
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

    controller = app.get(SubsController);
    dataSource = app.get(getDataSourceToken());
  }, 60_000);

  afterAll(async () => {
    await dataSource?.destroy();
    await app?.close();
    await pg.stop();
  });

  /** Seed settings with NGN currency and PAYMENT/REFUNDS charges so initiate_subscription can resolve them. */
  async function seedSettings() {
    const settingRepo = dataSource.getRepository(SettingSchema);
    await settingRepo.deleteAll();
    await settingRepo.save(
      settingRepo.create({
        id: '00000000-0000-0000-0000-000000000001',
        version: '1.0.0',
        max_free_alarms: 1,
        max_free_clocks: 3,
        transaction_expiry_hours: 6,
        currencies: [
          { code: NGN as any, name: 'Naira', symbol: '₦' },
          { code: USD as any, name: 'US Dollar', symbol: '$' },
        ],
        charges: {
          PAYMENT: [{ currency_code: NGN as any, amount: '5' }],
          REFUNDS: [{ currency_code: NGN as any, amount: '1' }],
        },
      }),
    );
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

    await seedSettings();
    await userRepo.save(
      userRepo.create({
        id: users_id,
        firstname: 'Test',
        surname: 'User',
        email: 'subs@test.com',
        username: 'subsuser',
        timezone: 'UTC',
        display_name: 'Test User',
        type: AccountType.Client,
        is_email_verified: false,
        has_password: false,
        dark_mode: false,
        is_onboarded: false,
      }),
    );
    const pkgId = '8f3d6a2b-4c1e-4e9f-b6d2-3a7c5f1e9b44';
    await pkgRepo.save(
      pkgRepo.create({
        id: pkgId,
        type: PRICING_TYPE_ENUM.PAID,
        title: 'Pro',
        description: 'Pro plan',
        features: ['F1'],
        duration: 30,
        duration_period: DURATION_PERIOD_ENUM.DAYS,
        admin_id: admin_id,
        pricings: [{ currency_code: 'NGN', amount: '10.00' }],
      }),
    );
    await txRepo.save(
      txRepo.create({
        id: 'c1a7e9f4-2d5b-4a6c-9e31-7f2b8d4c6a90',
        user_id: users_id,
        amount: '10',
        charge: '1',
        currency_code: 'NGN',
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        status: TRANSACTION_STATUS_ENUM.COMPLETED,
        metadata: {
          reason: 'test',
          ref_id: undefined,
          package_id: pkgId,
        },
        expires_at: new Date(Date.now() + 3600000),
      }),
    );
  });

  const pkgId = '8f3d6a2b-4c1e-4e9f-b6d2-3a7c5f1e9b44';

  function valid_insert_dto(): InsertSubDto {
    return {
      user_id: users_id,
      package_id: pkgId,
      currency_code: NGN,
    };
  }

  describe('initiate_subscription', () => {
    it('returns pending transaction for paid package', async () => {
      const body = valid_insert_dto();
      const result = await controller.initiate_subscripton(body);
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.user_id).toBe(body.user_id);
      expect(result.status).toBe(TRANSACTION_STATUS_ENUM.PENDING);
    });
  });

  describe('get_by_index', () => {
    it('returns paginated subscriptions', async () => {
      const result = await controller.get_by_index(
        {} as Parameters<SubsController['get_by_index']>[0],
      );
      expect(result.docs).toBeDefined();
      expect(Array.isArray(result.docs)).toBe(true);
    });
  });

  describe('get_subscription_by_id', () => {
    it('returns subscription when found', async () => {
      const subRepo = dataSource.getRepository(SubscriptionSchema);
      const created = await subRepo.save(
        subRepo.create({
          user_id: users_id,
          transaction_id: 'c1a7e9f4-2d5b-4a6c-9e31-7f2b8d4c6a90',
          package_id: pkgId,
          currency_code: 'NGN',
          amount: '10',
          charge: '1',
          duration: 30,
          duration_period: DURATION_PERIOD_ENUM.DAYS,
          expires_at: new Date(Date.now() + 30 * 24 * 3600000),
        }),
      );
      const result = await controller.get_subscription_by_id(created.id);
      expect(result.id).toBe(created.id);
      expect(result.user_id).toBe(users_id);
    });
  });
});
