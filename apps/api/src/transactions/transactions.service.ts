import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { EntityManager, Repository } from 'typeorm';
import { TransactionSchema } from './schemas/transaction.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { MutationsService } from '@app/mutations';
import {
  create_helper,
  find_by_id_helper,
  find_by_id_lock_helper,
  IPayment,
  isValidDto,
  paginate_by_date_helper,
  paginate_by_index,
  update_by_id_helper,
} from '@app/util';
import { QueryTransactionByDatesDto } from './dto/query-transaction-by-dates.dto';
import { QueryTransactionByIndexDto } from './dto/query-transaction-by-index.dto';
import { InsertTransactionDto } from './dto/insert-transaction.dto';
import {
  IPaymentTxMetadata,
  IRefundsTxMetadata,
  TRANSACTION_STATUS_ENUM,
  TRANSACTION_TYPE_ENUM,
} from '@repo/types';
import { InitiatePaymentDto } from './dto/payment/initiate-payment.dto';
import { CompletePaymentDto } from './dto/payment/complete-payment.dto';
import { InitiateRefundsDto } from './dto/refunds/initiate-refunds.dto';
import { CompleteRefundsDto } from './dto/refunds/complete-refunds.dto';
import { decimal_number, is_same_ccy } from '@app/util/fns';
import { SettingsService } from '@/settings/settings.service';
import { UsersService } from '@/accounts/users/users.service';
import { addHours, isPast } from 'date-fns';

const relations = ['User'];

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionSchema)
    private readonly transactions: Repository<TransactionSchema>,
    private readonly paymemts: IPayment,
    private readonly settings: SettingsService,
    private readonly mutations: MutationsService,
    private readonly users: UsersService,
  ) {}

  /**
   * Starts a payment transaction: validates the request, resolves charge and currency from settings, and inserts a pending transaction.
   * @param body - Payment initiation data (user_id, amount, currency_code)
   * @param session - Optional TypeORM entity manager for running within an existing transaction
   * @returns The created pending transaction record
   * @throws BadRequestException if validation fails
   * @throws InternalServerErrorException if no charge or currency is configured for the given currency code
   */
  initiate_payment = async (body: InitiatePaymentDto, session?: EntityManager) => {
    const errors = isValidDto(body, InitiatePaymentDto);
    if (errors.length > 0) throw new BadRequestException(errors);

    const perform = async (em: EntityManager) => {
      const user = await this.users.find_by_id_lock(body.user_id, em);
      const settings = await this.settings.find(em);
      const charge = settings.charges.PAYMENT.find((i) =>
        is_same_ccy(i.currency_code, body.currency_code),
      );
      const currency = settings.currencies.find((i) => is_same_ccy(i.code, body.currency_code));
      if (!charge) {
        throw new InternalServerErrorException('Cannot find charge for transaction');
      }
      if (!currency) {
        throw new InternalServerErrorException('Cannot find currency');
      }
      const response = await this.insert(
        {
          amount: decimal_number(body.amount).toString(),
          charge: decimal_number(charge.amount).toString(),
          currency_code: currency.code,
          metadata: {
            reason: 'subscription payment',
            ref_id: undefined,
          } as IPaymentTxMetadata,
          type: TRANSACTION_TYPE_ENUM.PAYMENT,
          user_id: user.id,
        },
        em,
      );
      return response;
    };

    if (session) return perform(session);
    return this.mutations.execute(perform);
  };

  /**
   * Completes a payment: validates the external payment, ensures idempotency, checks amount/currency/expiry, then marks the transaction completed.
   * @param body - Completion data (transaction id, external ref_id, gateway, method)
   * @param session - Optional TypeORM entity manager for running within an existing transaction
   * @returns The updated transaction with status COMPLETED and gateway/metadata set
   * @throws BadRequestException if already processed, payment failed, expired, wrong type, currency mismatch, or invalid amount
   */
  complete_payment = async (body: CompletePaymentDto, session?: EntityManager) => {
    const errors = isValidDto(body, CompletePaymentDto);
    if (errors.length > 0) throw new BadRequestException(errors);

    const perform = async (em: EntityManager) => {
      // get the required transaction and external payment
      const transaction = await this.find_by_id_lock(body.id, em);
      const payment = await this.paymemts.find_payment(body.ref_id);

      // make sure the transaction hasn't already been processed
      if (transaction.status !== TRANSACTION_STATUS_ENUM.PENDING) {
        return {
          error: new BadRequestException('transaction is already processed'),
        };
      }

      // make sure its actually a payment transaction
      if (transaction.type !== TRANSACTION_TYPE_ENUM.PAYMENT) {
        return {
          error: new BadRequestException('invalid transaction type'),
        };
      }

      // lock the transaction and make sure it is idempotent
      await this.update(body.id, { status: TRANSACTION_STATUS_ENUM.PROCESSING }, em);

      // be sure the external transaction was successful
      if (payment.status !== 'successful') {
        await this.update(
          body.id,
          {
            status: TRANSACTION_STATUS_ENUM.FAILED,
            narration: payment.narration,
          },
          em,
        );
        return { error: new BadRequestException('Payment failed') };
      }

      // make sure the transaction isn't expired
      if (isPast(transaction.expires_at)) {
        await this.update(
          body.id,
          {
            status: TRANSACTION_STATUS_ENUM.EXPIRED,
            narration: 'expired',
          },
          em,
        );
        return {
          error: new BadRequestException('transaction is expired'),
        };
      }

      // make sure the currency between the paid one and the transaction is the same
      if (!is_same_ccy(payment.currency, transaction.currency_code)) {
        await this.update(
          body.id,
          {
            status: TRANSACTION_STATUS_ENUM.FAILED,
            narration: 'currency mismatch',
          },
          em,
        );
        return { error: new BadRequestException('invalid currency') };
      }

      const amount_expected = decimal_number(transaction.amount);
      const charge_amount_expected = decimal_number(transaction.charge);
      const total_amount_paid = decimal_number(payment.amount);
      const total_amount_expected = amount_expected.add(charge_amount_expected);

      // confirm the amount paid is the amount expected are the same
      if (total_amount_paid.lessThan(total_amount_expected)) {
        await this.update(
          body.id,
          {
            status: TRANSACTION_STATUS_ENUM.FAILED,
            narration: 'invalid amount paid',
          },
          em,
        );
        return { error: new BadRequestException('invalid amount paid') };
      }

      // update the body of the transaction
      const response = await this.update(
        body.id,
        {
          gateway: body.gateway,
          method: body.method,
          status: TRANSACTION_STATUS_ENUM.COMPLETED,
          narration: 'payment completed successfully',
          metadata: {
            ...transaction.metadata,
            ref_id: body.ref_id,
          } as IPaymentTxMetadata,
        },
        em,
      );
      return { data: response };
    };

    const response = session ? await perform(session) : await this.mutations.execute(perform);

    if (response?.error) throw response?.error;
    return response?.data;
  };

  /**
   * Initiates refund(s) for one or more transactions. Validates the request and runs within a transaction when no session is provided.
   * @param body - Refund initiation data
   * @param session - Optional TypeORM entity manager for running within an existing transaction
   * @returns Result of the refund initiation (implementation in progress)
   * @throws BadRequestException if validation fails
   */
  initiate_refunds = async (body: InitiateRefundsDto, session?: EntityManager) => {
    const errors = isValidDto(body, InitiateRefundsDto);
    if (errors.length > 0) throw new BadRequestException(errors);

    const perform = async (em: EntityManager) => {
      const user = await this.users.find_by_id_lock(body.user_id, em);
      const settings = await this.settings.find(em);
      const charge = settings.charges.REFUNDS.find((i) =>
        is_same_ccy(i.currency_code, body.currency_code),
      );
      const currency = settings.currencies.find((i) => is_same_ccy(i.code, body.currency_code));
      if (!charge) {
        throw new InternalServerErrorException('Cannot find charge for transaction');
      }
      if (!currency) {
        throw new InternalServerErrorException('Cannot find currency');
      }

      const og_transaction = await this.find_by_id_lock(body.metadata.og_trx_id, em);
      if (og_transaction.status !== TRANSACTION_STATUS_ENUM.COMPLETED) {
        throw new BadRequestException('transaction is not refundable');
      }

      const check_if_refunded = await this.find_og_transaction_id_lock(body.metadata.og_trx_id, em);
      if (check_if_refunded) {
        throw new BadRequestException('Transaction already refunded');
      }

      return this.insert(
        {
          amount: decimal_number(body.amount).toString(),
          charge: decimal_number(charge.amount).toString(),
          currency_code: currency.code,
          metadata: {
            og_trx_id: og_transaction.id,
            reason: body.metadata.reason,
          } as IRefundsTxMetadata,
          type: TRANSACTION_TYPE_ENUM.REFUNDS,
          user_id: user.id,
        },
        em,
      );
    };

    if (session) return perform(session);
    return this.mutations.execute(perform);
  };

  /**
   * Completes refund(s) after external refund processing. Validates the request and runs within a transaction when no session is provided.
   * @param body - Refund completion data
   * @param session - Optional TypeORM entity manager for running within an existing transaction
   * @returns Result of the refund completion (implementation in progress)
   * @throws BadRequestException if validation fails
   */
  complete_refunds = async (body: CompleteRefundsDto, session?: EntityManager) => {
    const errors = isValidDto(body, CompleteRefundsDto);
    if (errors.length > 0) throw new BadRequestException(errors);

    const perform = async (em: EntityManager) => {
      const transaction = await this.find_by_id_lock(body.id, em);

      if (transaction.status !== TRANSACTION_STATUS_ENUM.PENDING) {
        return {
          error: new BadRequestException('transaction already processed'),
        };
      }

      await this.update(body.id, { status: TRANSACTION_STATUS_ENUM.PROCESSING }, em);

      if (isPast(transaction.expires_at)) {
        await this.update(body.id, { status: TRANSACTION_STATUS_ENUM.EXPIRED }, em);
        return { error: new BadRequestException('transaction expired') };
      }

      if (transaction.type !== TRANSACTION_TYPE_ENUM.REFUNDS) {
        return { error: new BadRequestException('invalid transaction') };
      }

      const amount_paid = decimal_number(transaction.amount);
      const amount_charged = decimal_number(transaction.charge);

      const response = await this.paymemts.refund_payment({
        amount: amount_paid.plus(amount_charged).toNumber(),
        chargeId: transaction.id,
        reason: transaction.narration ?? 'refunded transaction',
      });

      if (response.status !== 'successful') {
        await this.update(transaction.id, { status: TRANSACTION_STATUS_ENUM.FAILED }, em);
        return { error: new BadRequestException('Error occured') };
      }

      const result = await this.update(
        transaction.id,
        {
          status: TRANSACTION_STATUS_ENUM.COMPLETED,
        },
        em,
      );
      return { data: result };
    };

    const response = session ? await perform(session) : await this.mutations.execute(perform);

    if (response?.error) throw response?.error;
    return response.data;
  };

  /**
   * Finds a refund transaction that references the given original transaction id, with a pessimistic write lock.
   * Used to ensure a transaction is not refunded more than once.
   * @param trx_id - Original transaction id (metadata.og_trx_id)
   * @param session - TypeORM entity manager (required for locking)
   * @returns The refund transaction with metadata.og_trx_id = trx_id, or undefined if none exists
   */
  find_og_transaction_id_lock = async (trx_id: string, session: EntityManager) => {
    return session
      .getRepository(this.transactions.target)
      .createQueryBuilder('trx')
      .where("trx.metadata->>'og_trx_id' = :id", { id: trx_id })
      .setLock('pessimistic_write')
      .getOne();
  };

  /**
   * Inserts a new transaction with default pending status and 6-hour expiry. Delegates to create with normalized fields.
   * @param body - Transaction data to insert (amount, charge, currency_code, metadata, type, user_id)
   * @param session - Optional TypeORM entity manager for running within an existing transaction
   * @returns The created transaction record with PENDING status and expires_at set
   * @throws BadRequestException if validation fails
   */
  insert = async (body: InsertTransactionDto, session?: EntityManager) => {
    const errors = isValidDto(body, InsertTransactionDto);
    if (errors.length > 0) throw new BadRequestException(errors);

    const perform = async (em: EntityManager) => {
      const settings = await this.settings.find(em);
      const a = await this.create(
        {
          ...body,
          narration: undefined,
          method: undefined,
          gateway: undefined,
          status: TRANSACTION_STATUS_ENUM.PENDING,
          expires_at: addHours(new Date(), settings.transaction_expiry_hours),
        },
        em,
      );
      return a;
    };

    if (session) return perform(session);
    return this.mutations.execute(perform);
  };

  /**
   * Creates a new transaction record in the database and returns it with relations loaded.
   * @param body - Full transaction create payload (validated against CreateTransactionDto)
   * @param session - Optional TypeORM entity manager for running within an existing transaction
   * @returns The created transaction with relations (e.g. User)
   * @throws BadRequestException if validation fails
   */
  create = async (body: CreateTransactionDto, session?: EntityManager) => {
    const errors = isValidDto(body, CreateTransactionDto);
    if (errors.length > 0) throw new BadRequestException(errors);
    const response = await create_helper<TransactionSchema>(this.transactions, body, session);
    return this.find_by_id(response.id, session);
  };

  /**
   * Paginates transactions by index (cursor/offset) with optional filters.
   * @param query - Query params (e.g. limit, cursor) per QueryTransactionByIndexDto
   * @returns Paginated list of transactions with relations
   * @throws BadRequestException if validation fails
   */
  get_by_index = async (query: Partial<QueryTransactionByIndexDto> = {}) => {
    const errors = isValidDto(query, QueryTransactionByIndexDto);
    if (errors.length > 0) throw new BadRequestException(errors);
    return paginate_by_index(query, this.transactions, undefined, {
      relations,
    });
  };

  /**
   * Paginates transactions by date range with optional filters.
   * @param query - Query params (e.g. from, to, limit) per QueryTransactionByDatesDto
   * @returns Paginated list of transactions with relations
   * @throws BadRequestException if validation fails
   */
  get_by_dates = async (query: Partial<QueryTransactionByDatesDto> = {}) => {
    const errors = isValidDto(query, QueryTransactionByDatesDto);
    if (errors.length > 0) throw new BadRequestException(errors);
    return paginate_by_date_helper(query, this.transactions, undefined, {
      relations,
    });
  };

  /**
   * Fetches a single transaction by id with relations (e.g. User).
   * @param id - Transaction id
   * @param session - Optional TypeORM entity manager for running within an existing transaction
   * @returns The transaction record or undefined if not found
   */
  find_by_id = async (id: string, session?: EntityManager) => {
    return find_by_id_helper(this.transactions, id, { relations }, session);
  };

  /**
   * Fetches a single transaction by id with a pessimistic write lock (for use within a transaction).
   * @param id - Transaction id
   * @param session - TypeORM entity manager (required for locking)
   * @returns The locked transaction record or undefined if not found
   */
  find_by_id_lock = async (id: string, session: EntityManager) => {
    return find_by_id_lock_helper(this.transactions, id, session);
  };

  /**
   * Updates a transaction by id with the provided fields (e.g. status, narration, gateway, metadata).
   * @param id - Transaction id
   * @param body - Fields to update (validated against UpdateTransactionDto)
   * @param session - Optional TypeORM entity manager for running within an existing transaction
   * @returns The updated transaction with relations
   * @throws BadRequestException if validation fails
   */
  update = async (id: string, body: UpdateTransactionDto, session?: EntityManager) => {
    const errors = isValidDto(body, UpdateTransactionDto);
    if (errors.length > 0) throw new BadRequestException(errors);
    return update_by_id_helper(this.transactions, id, body, session, {
      relations,
    });
  };
}
