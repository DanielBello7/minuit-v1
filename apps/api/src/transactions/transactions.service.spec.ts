/**
 * Integration tests for TransactionsService using Postgres test container.
 * Thorough tests for get_by_dates and get_by_index: cursor/pointer, next page, filtering.
 */
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionSchema } from './schemas/transaction.schema';
import { UserSchema } from '@/accounts/users/schemas/user.schema';
import { SettingSchema } from '@/settings/schemas/setting.schema';
import { TransactionsModule } from './transactions.module';
import { SettingsModule } from '@/settings/settings.module';
import { UsersModule } from '@/accounts/users/users.module';
import { MutationsModule } from '@app/mutations';
import { FlwModule } from '@app/flw';
import { IPayment } from '@app/util/interfaces/payment.interface';
import {
  CurrencyCode,
  NGN,
  TRANSACTION_STATUS_ENUM,
  TRANSACTION_TYPE_ENUM,
  USD,
} from '@repo/types';
import { SORT_TYPE_ENUM } from '@repo/types';
import { UsersService } from '@/accounts/users/users.service';
import { CreateUserDto } from '@/accounts/users/dto/create-user.dto';
import { AccountType } from '@repo/types';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';
import { InitiatePaymentDto } from './dto/payment/initiate-payment.dto';
import { CompletePaymentDto } from './dto/payment/complete-payment.dto';
import { InitiateRefundsDto } from './dto/refunds/initiate-refunds.dto';
import { CompleteRefundsDto } from './dto/refunds/complete-refunds.dto';
import type { IPaymentPaymentResult } from '@app/util/interfaces/payment.interface';
import type { IPaymentRefundResult } from '@app/util/interfaces/payment.interface';
import { JwtModule } from '@nestjs/jwt';

const PAYMENT_REF_ID = 'flw_ref_123';
const TEST_PACKAGE_ID = 'c47a2774-2a6e-4a3b-9f1d-8e7c6b5a4321'; // valid UUID v4 for tests

const TEST_JWT_SECRET = 'secret';

const payment_stub: IPayment = {
  gateway: 'test',
  get_payment_url: jest.fn().mockResolvedValue(''),
  make_payment: jest.fn(),
  find_payment: jest.fn(),
  get_available_banks: jest.fn().mockResolvedValue([]),
  verify_credentials: jest.fn(),
  verify_credentials_safe: jest.fn(),
  refund_payment: jest.fn(),
} as any;

describe('TransactionsService (integration)', () => {
  const pg = new PostgresTestContainer();
  let app: TestingModule;
  let service: TransactionsService;
  let usersService: UsersService;
  let dataSource: DataSource;

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
      .useValue(payment_stub)
      .compile();

    service = app.get(TransactionsService);
    usersService = app.get(UsersService);
    dataSource = app.get(getDataSourceToken());
  }, 60_000);

  afterAll(async () => {
    await dataSource?.destroy();
    await app?.close();
    await pg.stop();
  });

  /** Seed settings with NGN currency and PAYMENT/REFUNDS charges so initiate_payment and initiate_refunds can resolve them. */
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
    const txRepo = dataSource.getRepository(TransactionSchema);
    const userRepo = dataSource.getRepository(UserSchema);
    const settingRepo = dataSource.getRepository(SettingSchema);
    await txRepo.deleteAll();
    await userRepo.deleteAll();
    await settingRepo.deleteAll();
    await seedSettings();
    jest.clearAllMocks();
  });

  async function createUser(overrides: Partial<CreateUserDto> = {}) {
    const dto: CreateUserDto = {
      firstname: 'Test',
      surname: 'User',
      email: 'tx@example.com',
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
    return usersService.create_user(dto);
  }

  async function create_transaction(
    userId: string,
    overrides: {
      type?: TRANSACTION_TYPE_ENUM;
      status?: TRANSACTION_STATUS_ENUM;
      currency_code?: CurrencyCode;
    } = {},
  ) {
    return service.create(
      {
        user_id: userId,
        amount: '100',
        currency_code: NGN,
        metadata: {
          reason: 'test',
          ref_id: undefined,
          package_id: TEST_PACKAGE_ID,
        },
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        charge: '5',
        expires_at: new Date(4),
        gateway: undefined,
        method: undefined,
        narration: 'test',
        status: TRANSACTION_STATUS_ENUM.PENDING,
        ...overrides,
      },
      undefined,
    );
  }

  describe('get_by_dates', () => {
    it('returns empty docs when none exist', async () => {
      const result = await service.get_by_dates({});
      expect(result.docs).toEqual([]);
      expect(result.has_next_page).toBe(false);
    });

    it('returns first page with pick and date cursor for next page', async () => {
      const user = await createUser();
      await create_transaction(user.id);
      await create_transaction(user.id);
      await create_transaction(user.id);

      const result = await service.get_by_dates({
        pagination: { pick: 2, sort: SORT_TYPE_ENUM.DESC },
      });

      expect(result.docs.length).toBe(2);
      expect(result.pick).toBe(2);
      expect(result.has_next_page).toBe(true);
      expect(result.next_page).toBeDefined();
      expect(result.next_page).toEqual(
        result.docs[result.docs.length - 1].created_at,
      );
    });

    it('returns next section when using date cursor (pointer)', async () => {
      const user = await createUser();
      await create_transaction(user.id);
      await create_transaction(user.id);
      await create_transaction(user.id);

      const first = await service.get_by_dates({
        pagination: { pick: 2, sort: SORT_TYPE_ENUM.DESC },
      });
      const cursor = first.next_page;
      expect(cursor).toBeDefined();

      const second = await service.get_by_dates({
        pagination: {
          pick: 2,
          sort: SORT_TYPE_ENUM.DESC,
          date: cursor as Date,
        },
      });
      expect(second.docs.length).toBe(1);
      expect(second.has_next_page).toBe(false);
    });

    it('filters by user_id', async () => {
      const user1 = await createUser({
        email: 'u1@example.com',
        username: 'u1',
      });
      const user2 = await createUser({
        email: 'u2@example.com',
        username: 'u2',
      });
      await create_transaction(user1.id);
      await create_transaction(user2.id);
      await create_transaction(user1.id);

      const result = await service.get_by_dates({ user_id: user1.id });
      expect(result.docs.length).toBe(2);
      result.docs.forEach((d) => expect(d.user_id).toBe(user1.id));
    });

    it('filters by type and status', async () => {
      const user = await createUser();
      await create_transaction(user.id, {
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        status: TRANSACTION_STATUS_ENUM.PENDING,
      });
      await create_transaction(user.id, {
        type: TRANSACTION_TYPE_ENUM.REFUNDS,
        status: TRANSACTION_STATUS_ENUM.PENDING,
      });
      await create_transaction(user.id, {
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        status: TRANSACTION_STATUS_ENUM.COMPLETED,
      });

      const result = await service.get_by_dates({
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        status: TRANSACTION_STATUS_ENUM.PENDING,
      });
      expect(result.docs.length).toBe(1);
      expect(result.docs[0].type).toBe(TRANSACTION_TYPE_ENUM.PAYMENT);
      expect(result.docs[0].status).toBe(TRANSACTION_STATUS_ENUM.PENDING);
    });
  });

  describe('get_by_index', () => {
    it('returns empty docs when none exist', async () => {
      const result = await service.get_by_index({});
      expect(result.docs).toEqual([]);
    });

    it('returns first page with pick and index cursor', async () => {
      const user = await createUser();
      await create_transaction(user.id);
      await create_transaction(user.id);
      await create_transaction(user.id);

      const result = await service.get_by_index({
        pagination: { pick: 2, sort: SORT_TYPE_ENUM.DESC },
      });

      expect(result.docs.length).toBe(2);
      expect(result.has_next_page).toBe(true);
      expect(typeof result.next_page).toBe('number');
      expect(result.next_page).toBe(
        result.docs[result.docs.length - 1].index,
      );
    });

    it('returns next section when using index cursor (pointer)', async () => {
      const user = await createUser();
      await create_transaction(user.id);
      await create_transaction(user.id);
      await create_transaction(user.id);

      const first = await service.get_by_index({
        pagination: { pick: 2, sort: SORT_TYPE_ENUM.DESC },
      });
      const cursor = first.next_page;
      expect(cursor).toBeDefined();

      const second = await service.get_by_index({
        pagination: {
          pick: 2,
          sort: SORT_TYPE_ENUM.DESC,
          index: cursor as number,
        },
      });
      expect(second.docs.length).toBe(1);
      expect(second.has_next_page).toBe(false);
    });

    it('filters by user_id and currency_code', async () => {
      const user = await createUser();
      await create_transaction(user.id, { currency_code: NGN });
      await create_transaction(user.id, { currency_code: USD });
      await create_transaction(user.id, { currency_code: NGN });

      const result = await service.get_by_index({
        user_id: user.id,
        currency_code: NGN as any,
      });
      expect(result.docs.length).toBe(2);
      result.docs.forEach((d) => {
        expect(d.user_id).toBe(user.id);
        expect(d.currency_code).toBe(NGN);
      });
    });
  });

  describe('find_by_id', () => {
    it('returns transaction with User relation when found', async () => {
      const user = await createUser();
      const trx = await create_transaction(user.id);
      const result = await service.find_by_id(trx.id);
      expect(result?.id).toBe(trx.id);
      expect(result?.User).toBeDefined();
    });
  });

  describe('initiate_payment', () => {
    it('creates a PENDING PAYMENT transaction with charge and expiry from settings', async () => {
      const user = await createUser();
      const body: InitiatePaymentDto = {
        user_id: user.id,
        amount: '100',
        currency_code: NGN,
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        metadata: {
          reason: 'subscription payment',
          ref_id: undefined,
          package_id: TEST_PACKAGE_ID,
        },
      };

      const result = await service.initiate_payment(body);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.user_id).toBe(user.id);
      expect(result.type).toBe(TRANSACTION_TYPE_ENUM.PAYMENT);
      expect(result.status).toBe(TRANSACTION_STATUS_ENUM.PENDING);
      expect(result.amount).toBe('100.00');
      expect(result.charge).toBe('5.00'); // from seeded settings charges.PAYMENT for NGN
      expect(result.currency_code).toBe(NGN);
      expect(result.metadata).toMatchObject({
        reason: 'subscription payment',
      });
      expect(result.expires_at).toBeDefined();
      expect(new Date(result.expires_at).getTime()).toBeGreaterThan(
        Date.now(),
      );
    });

    it('throws BadRequestException when DTO validation fails', async () => {
      const user = await createUser();
      await expect(
        service.initiate_payment({
          user_id: user.id,
          amount: 'invalid',
          currency_code: NGN,
          type: TRANSACTION_TYPE_ENUM.PAYMENT,
          metadata: { reason: 'x', package_id: TEST_PACKAGE_ID },
        } as InitiatePaymentDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws InternalServerErrorException when no charge for currency', async () => {
      const user = await createUser();
      await expect(
        service.initiate_payment({
          user_id: user.id,
          amount: '100',
          currency_code: 'EUR' as any, // not in seeded charges
          type: TRANSACTION_TYPE_ENUM.PAYMENT,
          metadata: {
            reason: 'subscription payment',
            package_id: TEST_PACKAGE_ID,
          },
        } as InitiatePaymentDto),
      ).rejects.toThrow(InternalServerErrorException);

      await expect(
        service.initiate_payment({
          user_id: user.id,
          amount: '100',
          currency_code: 'EUR' as any,
          type: TRANSACTION_TYPE_ENUM.PAYMENT,
          metadata: {
            reason: 'subscription payment',
            package_id: TEST_PACKAGE_ID,
          },
        } as InitiatePaymentDto),
      ).rejects.toThrow('Cannot find charge for transaction');
    });

    it('throws InternalServerErrorException when no currency config', async () => {
      const user = await createUser();
      const settingRepo = dataSource.getRepository(SettingSchema);
      await settingRepo.update(
        { id: '00000000-0000-0000-0000-000000000001' },
        { currencies: [] },
      );

      await expect(
        service.initiate_payment({
          user_id: user.id,
          amount: '100',
          currency_code: NGN as any,
          type: TRANSACTION_TYPE_ENUM.PAYMENT,
          metadata: {
            reason: 'subscription payment',
            package_id: TEST_PACKAGE_ID,
          },
        } as InitiatePaymentDto),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        service.initiate_payment({
          user_id: user.id,
          amount: '100',
          currency_code: NGN as any,
          type: TRANSACTION_TYPE_ENUM.PAYMENT,
          metadata: {
            reason: 'subscription payment',
            package_id: TEST_PACKAGE_ID,
          },
        } as InitiatePaymentDto),
      ).rejects.toThrow('Cannot find currency');
    });
  });

  describe('complete_payment', () => {
    function make_successful_payment(
      amount: number,
      currency: string,
    ): IPaymentPaymentResult {
      return {
        status: 'successful',
        ref: PAYMENT_REF_ID,
        amount,
        currency,
        narration: 'ok',
        created_at: new Date(),
        account_number: '',
        bank_name: '',
        bank_slug: '',
        bank_code: null,
        customer: { name: '', phone: '', email: '' },
      };
    }

    it('marks transaction COMPLETED and sets gateway, method, metadata.ref_id when external payment is successful', async () => {
      const user = await createUser();
      const pending = await service.initiate_payment({
        user_id: user.id,
        amount: '100',
        currency_code: NGN as any,
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        metadata: {
          reason: 'subscription payment',
          package_id: TEST_PACKAGE_ID,
        },
      } as InitiatePaymentDto);

      (payment_stub.find_payment as jest.Mock).mockResolvedValue(
        make_successful_payment(105, NGN), // 100 + 5 charge
      );

      const body: CompletePaymentDto = {
        id: pending.id,
        ref_id: PAYMENT_REF_ID,
        gateway: 'flutterwave',
        method: 'card',
      };

      const result = await service.complete_payment(body);

      expect(result.status).toBe(TRANSACTION_STATUS_ENUM.COMPLETED);
      expect(result.gateway).toBe('flutterwave');
      expect(result.method).toBe('card');
      expect(result.narration).toBe('payment completed successfully');
      expect(result.metadata).toMatchObject({
        reason: 'subscription payment',
        ref_id: PAYMENT_REF_ID,
      });
      expect(payment_stub.find_payment).toHaveBeenCalledWith(
        PAYMENT_REF_ID,
      );
    });

    it('throws BadRequestException when transaction is already processed', async () => {
      const user = await createUser();
      const pending = await service.initiate_payment({
        user_id: user.id,
        amount: '100',
        currency_code: NGN as any,
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        metadata: {
          reason: 'subscription payment',
          package_id: TEST_PACKAGE_ID,
        },
      } as InitiatePaymentDto);
      await service.update(pending.id, {
        status: TRANSACTION_STATUS_ENUM.COMPLETED,
      });

      (payment_stub.find_payment as jest.Mock).mockResolvedValue(
        make_successful_payment(105, NGN),
      );

      await expect(
        service.complete_payment({
          id: pending.id,
          ref_id: PAYMENT_REF_ID,
          gateway: 'flw',
          method: 'card',
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.complete_payment({
          id: pending.id,
          ref_id: PAYMENT_REF_ID,
          gateway: 'flw',
          method: 'card',
        }),
      ).rejects.toThrow('transaction is already processed');
    });

    it('marks transaction FAILED and throws when external payment status is not successful', async () => {
      const user = await createUser();
      const pending = await service.initiate_payment({
        user_id: user.id,
        amount: '100',
        currency_code: NGN,
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        metadata: {
          reason: 'subscription payment',
          package_id: TEST_PACKAGE_ID,
        },
      } as InitiatePaymentDto);

      (payment_stub.find_payment as jest.Mock).mockResolvedValue({
        ...make_successful_payment(105, NGN),
        status: 'failed',
        narration: 'Insufficient funds',
      });

      await expect(
        service.complete_payment({
          id: pending.id,
          ref_id: PAYMENT_REF_ID,
          gateway: 'flw',
          method: 'card',
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.complete_payment({
          id: pending.id,
          ref_id: PAYMENT_REF_ID,
          gateway: 'flw',
          method: 'card',
        }),
      ).rejects.toThrow('transaction is already processed');

      const updated = await service.find_by_id(pending.id);
      expect(updated?.status).toBe(TRANSACTION_STATUS_ENUM.FAILED);
      expect(updated?.narration).toBe('Insufficient funds');
    });

    it('marks transaction EXPIRED and throws when transaction has expired', async () => {
      const user = await createUser();
      const pending = await service.initiate_payment({
        user_id: user.id,
        amount: '100',
        currency_code: NGN as any,
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        metadata: {
          reason: 'subscription payment',
          package_id: TEST_PACKAGE_ID,
        },
      } as InitiatePaymentDto);
      await service.update(pending.id, { expires_at: new Date(0) } as any);

      (payment_stub.find_payment as jest.Mock).mockResolvedValue(
        make_successful_payment(105, NGN),
      );

      await expect(
        service.complete_payment({
          id: pending.id,
          ref_id: PAYMENT_REF_ID,
          gateway: 'flw',
          method: 'card',
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.complete_payment({
          id: pending.id,
          ref_id: PAYMENT_REF_ID,
          gateway: 'flw',
          method: 'card',
        }),
      ).rejects.toThrow('transaction is already processed');

      const updated = await service.find_by_id(pending.id);
      expect(updated?.status).toBe(TRANSACTION_STATUS_ENUM.EXPIRED);
    });

    it('throws BadRequestException when transaction type is not PAYMENT', async () => {
      const user = await createUser();
      const refundTrx = await service.insert(
        {
          user_id: user.id,
          amount: '50',
          charge: '1',
          currency_code: NGN as any,
          type: TRANSACTION_TYPE_ENUM.REFUNDS,
          metadata: {
            reason: 'refund',
            og_trx_id: '00000000-0000-0000-0000-000000000001',
          },
        },
        undefined,
      );

      (payment_stub.find_payment as jest.Mock).mockResolvedValue(
        make_successful_payment(51, NGN),
      );

      await expect(
        service.complete_payment({
          id: refundTrx.id,
          ref_id: PAYMENT_REF_ID,
          gateway: 'flw',
          method: 'card',
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.complete_payment({
          id: refundTrx.id,
          ref_id: PAYMENT_REF_ID,
          gateway: 'flw',
          method: 'card',
        }),
      ).rejects.toThrow('invalid transaction type');
    });

    it('marks FAILED and throws when payment currency does not match transaction', async () => {
      const user = await createUser();
      const pending = await service.initiate_payment({
        user_id: user.id,
        amount: '100',
        currency_code: NGN,
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        metadata: {
          reason: 'subscription payment',
          package_id: TEST_PACKAGE_ID,
        },
      } as InitiatePaymentDto);

      (payment_stub.find_payment as jest.Mock).mockResolvedValue(
        make_successful_payment(105, USD), // wrong currency
      );

      await expect(
        service.complete_payment({
          id: pending.id,
          ref_id: PAYMENT_REF_ID,
          gateway: 'flw',
          method: 'card',
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.complete_payment({
          id: pending.id,
          ref_id: PAYMENT_REF_ID,
          gateway: 'flw',
          method: 'card',
        }),
      ).rejects.toThrow('transaction is already processed');

      const updated = await service.find_by_id(pending.id);
      expect(updated?.status).toBe(TRANSACTION_STATUS_ENUM.FAILED);
      expect(updated?.narration).toBe('currency mismatch');
    });

    it('marks FAILED and throws when amount paid is less than expected', async () => {
      const user = await createUser();
      const pending = await service.initiate_payment({
        user_id: user.id,
        amount: '100',
        currency_code: NGN,
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        metadata: {
          reason: 'subscription payment',
          package_id: TEST_PACKAGE_ID,
        },
      } as InitiatePaymentDto);

      (payment_stub.find_payment as jest.Mock).mockResolvedValue(
        make_successful_payment(50, NGN), // 50 < 100+5
      );

      await expect(
        service.complete_payment({
          id: pending.id,
          ref_id: PAYMENT_REF_ID,
          gateway: 'flw',
          method: 'card',
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.complete_payment({
          id: pending.id,
          ref_id: PAYMENT_REF_ID,
          gateway: 'flw',
          method: 'card',
        }),
      ).rejects.toThrow('transaction is already processed');

      const updated = await service.find_by_id(pending.id);
      expect(updated?.status).toBe(TRANSACTION_STATUS_ENUM.FAILED);
      expect(updated?.narration).toBe('invalid amount paid');
    });
  });

  describe('initiate_refunds', () => {
    it('creates a PENDING REFUNDS transaction linked to original transaction', async () => {
      const user = await createUser();
      const paymentTrx = await service.initiate_payment({
        user_id: user.id,
        amount: '100',
        currency_code: NGN as any,
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        metadata: {
          reason: 'subscription payment',
          package_id: TEST_PACKAGE_ID,
        },
      } as InitiatePaymentDto);
      (payment_stub.find_payment as jest.Mock).mockResolvedValue({
        status: 'successful',
        ref: PAYMENT_REF_ID,
        amount: 105,
        currency: NGN,
        narration: 'ok',
        created_at: new Date(),
        account_number: '',
        bank_name: '',
        bank_slug: '',
        bank_code: null,
        customer: { name: '', phone: '', email: '' },
      });
      await service.complete_payment({
        id: paymentTrx.id,
        ref_id: PAYMENT_REF_ID,
        gateway: 'flw',
        method: 'card',
      });

      const body: InitiateRefundsDto = {
        user_id: user.id,
        amount: '100',
        currency_code: NGN as any,
        type: TRANSACTION_TYPE_ENUM.REFUNDS,
        metadata: { og_trx_id: paymentTrx.id, reason: 'customer request' },
      };

      const result = await service.initiate_refunds(body);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.type).toBe(TRANSACTION_TYPE_ENUM.REFUNDS);
      expect(result.status).toBe(TRANSACTION_STATUS_ENUM.PENDING);
      expect(result.amount).toBe('100.00');
      expect(result.charge).toBe('1.00'); // from seeded settings charges.REFUNDS for NGN
      expect(result.currency_code).toBe(NGN);
      expect(result.metadata).toMatchObject({
        og_trx_id: paymentTrx.id,
        reason: 'customer request',
      });
    });

    it('throws BadRequestException when original transaction is not COMPLETED', async () => {
      const user = await createUser();
      const pendingPayment = await service.initiate_payment({
        user_id: user.id,
        amount: '100',
        currency_code: NGN,
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        metadata: {
          reason: 'subscription payment',
          package_id: TEST_PACKAGE_ID,
        },
      } as InitiatePaymentDto);

      await expect(
        service.initiate_refunds({
          user_id: user.id,
          amount: '100',
          currency_code: NGN,
          type: TRANSACTION_TYPE_ENUM.REFUNDS,
          metadata: { og_trx_id: pendingPayment.id, reason: 'refund' },
        } as InitiateRefundsDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.initiate_refunds({
          user_id: user.id,
          amount: '100',
          currency_code: NGN,
          type: TRANSACTION_TYPE_ENUM.REFUNDS,
          metadata: { og_trx_id: pendingPayment.id, reason: 'refund' },
        } as InitiateRefundsDto),
      ).rejects.toThrow('transaction is not refundable');
    });

    it('throws BadRequestException when transaction already refunded', async () => {
      const user = await createUser();
      const paymentTrx = await service.initiate_payment({
        user_id: user.id,
        amount: '100',
        currency_code: NGN as any,
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        metadata: {
          reason: 'subscription payment',
          package_id: TEST_PACKAGE_ID,
        },
      } as InitiatePaymentDto);
      (payment_stub.find_payment as jest.Mock).mockResolvedValue({
        status: 'successful',
        ref: PAYMENT_REF_ID,
        amount: 105,
        currency: NGN,
        narration: 'ok',
        created_at: new Date(),
        account_number: '',
        bank_name: '',
        bank_slug: '',
        bank_code: null,
        customer: { name: '', phone: '', email: '' },
      });
      await service.complete_payment({
        id: paymentTrx.id,
        ref_id: PAYMENT_REF_ID,
        gateway: 'flw',
        method: 'card',
      });

      await service.initiate_refunds({
        user_id: user.id,
        amount: '100',
        currency_code: NGN as any,
        type: TRANSACTION_TYPE_ENUM.REFUNDS,
        metadata: { og_trx_id: paymentTrx.id, reason: 'first refund' },
      } as InitiateRefundsDto);

      await expect(
        service.initiate_refunds({
          user_id: user.id,
          amount: '100',
          currency_code: NGN as any,
          type: TRANSACTION_TYPE_ENUM.REFUNDS,
          metadata: { og_trx_id: paymentTrx.id, reason: 'second refund' },
        } as InitiateRefundsDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.initiate_refunds({
          user_id: user.id,
          amount: '100',
          currency_code: NGN as any,
          type: TRANSACTION_TYPE_ENUM.REFUNDS,
          metadata: { og_trx_id: paymentTrx.id, reason: 'second refund' },
        } as InitiateRefundsDto),
      ).rejects.toThrow('Transaction already refunded');
    });
  });

  describe('complete_refunds', () => {
    it('marks REFUNDS transaction COMPLETED when refund_payment returns successful', async () => {
      const user = await createUser();
      const paymentTrx = await service.initiate_payment({
        user_id: user.id,
        amount: '100',
        currency_code: NGN as any,
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        metadata: {
          reason: 'subscription payment',
          package_id: TEST_PACKAGE_ID,
        },
      } as InitiatePaymentDto);
      (payment_stub.find_payment as jest.Mock).mockResolvedValue({
        status: 'successful',
        ref: PAYMENT_REF_ID,
        amount: 105,
        currency: NGN,
        narration: 'ok',
        created_at: new Date(),
        account_number: '',
        bank_name: '',
        bank_slug: '',
        bank_code: null,
        customer: { name: '', phone: '', email: '' },
      });
      await service.complete_payment({
        id: paymentTrx.id,
        ref_id: PAYMENT_REF_ID,
        gateway: 'flw',
        method: 'card',
      });
      const refundTrx = await service.initiate_refunds({
        user_id: user.id,
        amount: '100',
        currency_code: NGN as any,
        type: TRANSACTION_TYPE_ENUM.REFUNDS,
        metadata: { og_trx_id: paymentTrx.id, reason: 'refund' },
      } as InitiateRefundsDto);

      (payment_stub.refund_payment as jest.Mock).mockResolvedValue({
        id: 'refund_1',
        charge_id: refundTrx.id,
        amount_refunded: 101,
        status: 'successful',
      } as IPaymentRefundResult);

      const result = await service.complete_refunds({
        id: refundTrx.id,
        amount_refunded: '101',
        currency_code: NGN as any,
      } as CompleteRefundsDto);

      expect(result.status).toBe(TRANSACTION_STATUS_ENUM.COMPLETED);
      expect(payment_stub.refund_payment).toHaveBeenCalledWith({
        amount: 101, // 100 + 1 charge
        chargeId: refundTrx.id,
        reason: expect.any(String),
      });
    });

    it('throws BadRequestException when refund transaction already processed', async () => {
      const user = await createUser();
      const paymentTrx = await service.initiate_payment({
        user_id: user.id,
        amount: '100',
        currency_code: NGN as any,
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        metadata: {
          reason: 'subscription payment',
          package_id: TEST_PACKAGE_ID,
        },
      } as InitiatePaymentDto);
      (payment_stub.find_payment as jest.Mock).mockResolvedValue({
        status: 'successful',
        ref: PAYMENT_REF_ID,
        amount: 105,
        currency: NGN,
        narration: 'ok',
        created_at: new Date(),
        account_number: '',
        bank_name: '',
        bank_slug: '',
        bank_code: null,
        customer: { name: '', phone: '', email: '' },
      });
      await service.complete_payment({
        id: paymentTrx.id,
        ref_id: PAYMENT_REF_ID,
        gateway: 'flw',
        method: 'card',
      });
      const refundTrx = await service.initiate_refunds({
        user_id: user.id,
        amount: '100',
        currency_code: NGN as any,
        type: TRANSACTION_TYPE_ENUM.REFUNDS,
        metadata: { og_trx_id: paymentTrx.id, reason: 'refund' },
      } as InitiateRefundsDto);
      (payment_stub.refund_payment as jest.Mock).mockResolvedValue({
        id: 'r1',
        charge_id: refundTrx.id,
        amount_refunded: 101,
        status: 'successful',
      });
      await service.complete_refunds({
        id: refundTrx.id,
        amount_refunded: '101',
        currency_code: NGN as any,
      } as CompleteRefundsDto);

      await expect(
        service.complete_refunds({
          id: refundTrx.id,
          amount_refunded: '101',
          currency_code: NGN as any,
        } as CompleteRefundsDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.complete_refunds({
          id: refundTrx.id,
          amount_refunded: '101',
          currency_code: NGN as any,
        } as CompleteRefundsDto),
      ).rejects.toThrow('transaction already processed');
    });

    it('marks REFUNDS transaction EXPIRED and throws when expired', async () => {
      const user = await createUser();
      const payment_trx = await service.initiate_payment({
        user_id: user.id,
        amount: '100',
        currency_code: NGN as any,
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        metadata: {
          reason: 'subscription payment',
          package_id: TEST_PACKAGE_ID,
        },
      } as InitiatePaymentDto);

      (payment_stub.find_payment as jest.Mock).mockResolvedValue({
        status: 'successful',
        ref: PAYMENT_REF_ID,
        amount: 105,
        currency: NGN,
        narration: 'ok',
        created_at: new Date(),
        account_number: '',
        bank_name: '',
        bank_slug: '',
        bank_code: null,
        customer: { name: '', phone: '', email: '' },
      });
      await service.complete_payment({
        id: payment_trx.id,
        ref_id: PAYMENT_REF_ID,
        gateway: 'flw',
        method: 'card',
      });
      const refund_trx = await service.initiate_refunds({
        user_id: user.id,
        amount: '100',
        currency_code: NGN,
        type: TRANSACTION_TYPE_ENUM.REFUNDS,
        metadata: { og_trx_id: payment_trx.id, reason: 'refund' },
      } as InitiateRefundsDto);

      await service.update(refund_trx.id, {
        expires_at: new Date(0),
      });

      await expect(
        service.complete_refunds({
          id: refund_trx.id,
          amount_refunded: '101',
          currency_code: NGN,
        } as CompleteRefundsDto),
      ).rejects.toThrow(BadRequestException);

      const updated = await service.find_by_id(refund_trx.id);
      expect(updated?.status).toBe(TRANSACTION_STATUS_ENUM.EXPIRED);
    });

    it('throws BadRequestException when transaction type is not REFUNDS', async () => {
      const user = await createUser();
      const paymentTrx = await service.initiate_payment({
        user_id: user.id,
        amount: '100',
        currency_code: NGN as any,
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        metadata: {
          reason: 'subscription payment',
          package_id: TEST_PACKAGE_ID,
        },
      } as InitiatePaymentDto);

      (payment_stub.refund_payment as jest.Mock).mockResolvedValue({
        id: 'r1',
        charge_id: paymentTrx.id,
        amount_refunded: 105,
        status: 'successful',
      });

      await expect(
        service.complete_refunds({
          id: paymentTrx.id,
          amount_refunded: '105',
          currency_code: NGN as any,
        } as CompleteRefundsDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.complete_refunds({
          id: paymentTrx.id,
          amount_refunded: '105',
          currency_code: NGN as any,
        } as CompleteRefundsDto),
      ).rejects.toThrow('transaction already processed');
    });

    it('marks FAILED and throws when refund_payment returns non-successful', async () => {
      const user = await createUser();
      const paymentTrx = await service.initiate_payment({
        user_id: user.id,
        amount: '100',
        currency_code: NGN as any,
        type: TRANSACTION_TYPE_ENUM.PAYMENT,
        metadata: {
          reason: 'subscription payment',
          package_id: TEST_PACKAGE_ID,
        },
      } as InitiatePaymentDto);
      (payment_stub.find_payment as jest.Mock).mockResolvedValue({
        status: 'successful',
        ref: PAYMENT_REF_ID,
        amount: 105,
        currency: NGN,
        narration: 'ok',
        created_at: new Date(),
        account_number: '',
        bank_name: '',
        bank_slug: '',
        bank_code: null,
        customer: { name: '', phone: '', email: '' },
      });
      await service.complete_payment({
        id: paymentTrx.id,
        ref_id: PAYMENT_REF_ID,
        gateway: 'flw',
        method: 'card',
      });
      const refundTrx = await service.initiate_refunds({
        user_id: user.id,
        amount: '100',
        currency_code: NGN,
        type: TRANSACTION_TYPE_ENUM.REFUNDS,
        metadata: { og_trx_id: paymentTrx.id, reason: 'refund' },
      } as InitiateRefundsDto);

      (payment_stub.refund_payment as jest.Mock).mockResolvedValue({
        id: 'r1',
        charge_id: refundTrx.id,
        amount_refunded: 101,
        status: 'failed',
      });

      await expect(
        service.complete_refunds({
          id: refundTrx.id,
          amount_refunded: '101',
          currency_code: NGN,
        } as CompleteRefundsDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.complete_refunds({
          id: refundTrx.id,
          amount_refunded: '101',
          currency_code: NGN,
        } as CompleteRefundsDto),
      ).rejects.toThrow('transaction already processed');

      const updated = await service.find_by_id(refundTrx.id);
      expect(updated?.status).toBe(TRANSACTION_STATUS_ENUM.FAILED);
    });
  });
});
