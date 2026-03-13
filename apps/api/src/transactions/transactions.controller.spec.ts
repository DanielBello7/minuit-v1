/**
 * Integration tests for TransactionsController using Postgres test container.
 * Real TransactionsService and controller; IPayment stubbed; controller methods called directly.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionSchema } from './schemas/transaction.schema';
import { UserSchema } from '@/accounts/users/schemas/user.schema';
import { SettingSchema } from '@/settings/schemas/setting.schema';
import { TransactionsModule } from './transactions.module';
import { SettingsModule } from '@/settings/settings.module';
import { UsersModule } from '@/accounts/users/users.module';
import { MutationsModule } from '@app/mutations';
import { IPayment } from '@app/util/interfaces/payment.interface';
import { NGN, TRANSACTION_STATUS_ENUM, TRANSACTION_TYPE_ENUM } from '@repo/types';
import { CreateUserDto } from '@/accounts/users/dto/create-user.dto';
import { AccountType } from '@repo/types';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';
import { UsersService } from '@/accounts/users/users.service';
import { FlwModule } from '@app/flw';
import { JwtModule } from '@nestjs/jwt';
import { QueryTransactionByDatesDto } from './dto/query-transaction-by-dates.dto';

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

const TEST_JWT_SECRET = 'secret';

describe('TransactionsController (integration)', () => {
  const pg = new PostgresTestContainer();
  let app: TestingModule;
  let controller: TransactionsController;
  let transactions_service: TransactionsService;
  let users_service: UsersService;
  let data_source: DataSource;

  beforeAll(async () => {
    await pg.start();

    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          pg.getTypeOrmOptions({
            entities: [TransactionSchema, UserSchema, SettingSchema],
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
          signOptions: { expiresIn: 86400 }, // 24h in seconds
        }),
        TransactionsModule,
        SettingsModule,
        UsersModule,
        MutationsModule,
      ],
    })
      .overrideProvider(IPayment)
      .useValue(paymentStub)
      .compile();

    controller = app.get(TransactionsController);
    transactions_service = app.get(TransactionsService);
    users_service = app.get(UsersService);
    data_source = app.get(getDataSourceToken());
  }, 60_000);

  afterAll(async () => {
    await data_source?.destroy();
    await app?.close();
    await pg.stop();
  });

  beforeEach(async () => {
    const txRepo = data_source.getRepository(TransactionSchema);
    const userRepo = data_source.getRepository(UserSchema);
    const settingRepo = data_source.getRepository(SettingSchema);
    await txRepo.deleteAll();
    await userRepo.deleteAll();
    await settingRepo.deleteAll();
  });

  async function create_user(overrides: Partial<CreateUserDto> = {}): Promise<{ id: string }> {
    const dto: CreateUserDto = {
      firstname: 'Test',
      surname: 'User',
      email: 'txuser@example.com',
      username: 'txuser',
      timezone: 'UTC',
      display_name: 'Test User',
      type: AccountType.Client,
      is_email_verified: false,
      has_password: false,
      dark_mode: false,
      is_onboarded: false,
      password: undefined,
      avatar: undefined,
      refresh_token: undefined,
      last_login_date: undefined,
      ...overrides,
    };
    const user = await users_service.create_user(dto);
    return { id: user.id };
  }

  async function create_transaction(userId: string) {
    const a = await transactions_service.insert(
      {
        user_id: userId,
        amount: '100',
        charge: '5',
        currency_code: NGN,
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        metadata: { reason: 'test', ref_id: undefined },
      },
      undefined,
    );
    return a;
  }

  describe('get_by_dates', () => {
    it('returns paginated list (empty when none)', async () => {
      const result = await controller.get_by_dates({} as QueryTransactionByDatesDto);

      expect(result).toBeDefined();
      expect(result.docs).toEqual([]);
      expect(result.docs.length).toBe(0);
      expect(result).toHaveProperty('has_next_page');
      expect(result).toHaveProperty('prev_page');
    });

    it('returns transactions after creating', async () => {
      const { id: user_id } = await create_user();
      await create_transaction(user_id);
      await create_transaction(user_id);

      const result = await controller.get_by_dates({} as QueryTransactionByDatesDto);

      expect(result.docs.length).toBe(2);
    });
  });

  describe('get_by_index', () => {
    it('returns paginated list (empty when none)', async () => {
      const result = await controller.get_by_index({} as any);

      expect(result).toBeDefined();
      expect(result.docs).toEqual([]);
      expect(result.docs.length).toBe(0);
      expect(result).toHaveProperty('has_next_page');
    });

    it('returns transactions after creating', async () => {
      const { id: userId } = await create_user();
      await create_transaction(userId);

      const result = await controller.get_by_index({} as any);

      expect(result.docs.length).toBe(1);
    });
  });

  describe('find_trx', () => {
    it('returns transaction when id exists', async () => {
      const { id: userId } = await create_user();
      const trx = await create_transaction(userId);

      const result = await controller.find_trx(trx.id);

      expect(result.id).toBe(trx.id);
      expect(result.user_id).toBe(userId);
      expect(result.amount).toBe('100.00');
      expect(result.status).toBe(TRANSACTION_STATUS_ENUM.PENDING);
    });

    it('propagates errors for invalid id', async () => {
      await expect(controller.find_trx('00000000-0000-0000-0000-000000000000')).rejects.toThrow();
    });
  });
});
