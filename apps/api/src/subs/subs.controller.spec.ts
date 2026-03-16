/**
 * Integration tests for SubsController using Postgres test container.
 * Real SubsService and controller; controller methods called directly.
 * Note: Controller exposes create (create_sub); other routes (findAll, findOne, update, remove)
 * may not match current service API (string ids, get_subs_by_index, etc.).
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
import { CreateSubDto } from './dto/create-sub.dto';
import {
  DURATION_PERIOD_ENUM,
  NGN,
  TRANSACTION_STATUS_ENUM,
  TRANSACTION_TYPE_ENUM,
} from '@repo/types';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';
import { JwtModule } from '@nestjs/jwt';
import { SettingsService } from '@/settings/settings.service';
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

  async function ensure_settings() {
    return app.get(SettingsService).find();
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
    await pkgRepo.save(
      pkgRepo.create({
        id: '8f3d6a2b-4c1e-4e9f-b6d2-3a7c5f1e9b44',
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
        metadata: { reason: 'test' },
        expires_at: new Date(Date.now() + 3600000),
      }),
    );
  });

  function valid_create_dto(): CreateSubDto {
    return {
      transaction_id: 'c1a7e9f4-2d5b-4a6c-9e31-7f2b8d4c6a90',
      user_id: users_id,
      package_id: '8f3d6a2b-4c1e-4e9f-b6d2-3a7c5f1e9b44',
      currency_code: NGN,
      amount: '10.00',
      last_used_at: new Date(),
      used_at: new Date(),
      charge: '1.00',
      duration: 30,
      duration_period: DURATION_PERIOD_ENUM.DAYS,
      expires_at: new Date(Date.now() + 30 * 24 * 3600000),
    };
  }

  describe('create', () => {
    it('creates subscription and returns it', async () => {
      const body = valid_create_dto();

      const result = await controller.create(body);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.user_id).toBe(body.user_id);
      expect(result.package_id).toBe(body.package_id);
      expect(result.amount).toBe(body.amount);
      expect(result.duration_period).toBe(body.duration_period);
    });

    it('propagates validation errors for invalid body', async () => {
      await expect(
        controller.create({
          ...valid_create_dto(),
          user_id: 'not-a-uuid',
        } as CreateSubDto),
      ).rejects.toThrow();
    });
  });
});
