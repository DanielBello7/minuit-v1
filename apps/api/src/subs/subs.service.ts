import { BadGatewayException, Injectable } from '@nestjs/common';
import { CreateSubDto } from './dto/create-sub.dto';
import { UpdateSubDto } from './dto/update-sub.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionSchema } from './schemas/subs.schema';
import { EntityManager, Repository } from 'typeorm';
import { MutationsService } from '@app/mutations';
import { PackagesService } from '@/packages/packages.service';
import { HubSchema } from './schemas/hubs.schema';
import { CreateHubDto } from './dto/hubs/create-hub.dto';
import { InsertSubDto } from './dto/insert-sub.dto';
import { InsertHubDto } from './dto/hubs/insert-hub.dto';
import { decimal_number, sanitize } from '@app/util/fns';
import { TransactionsService } from '@/transactions/transactions.service';
import { UsersService } from '@/accounts/users/users.service';
import {
  create_helper,
  find_by_id_helper,
  paginate_by_index,
  update_by_id_helper,
} from '@app/util';
import { UpdateHubDto } from './dto/hubs/update-hub.dto';
import { QuerySubsByIndex } from './dto/query-sub.dto';
import {
  DURATION_PERIOD_ENUM,
  IPaymentTxMetadata,
  NGN,
  PRICING_TYPE_ENUM,
  TRANSACTION_TYPE_ENUM,
} from '@repo/types';
import { CompletePaymentDto } from '@/transactions/dto/payment/complete-payment.dto';
import { addDays, addMonths, addWeeks, addYears, sub } from 'date-fns';

const hub_relations = ['User', 'Subscription'];

@Injectable()
export class SubsService {
  constructor(
    @InjectRepository(SubscriptionSchema)
    private readonly subs: Repository<SubscriptionSchema>,
    @InjectRepository(HubSchema)
    private readonly hubs: Repository<HubSchema>,
    private readonly mutation: MutationsService,
    private readonly packages: PackagesService,
    private readonly transactions: TransactionsService,
    private readonly users: UsersService,
  ) {}

  private get_duration = (
    type: DURATION_PERIOD_ENUM,
    duration: number,
  ) => {
    switch (type) {
      case DURATION_PERIOD_ENUM.DAYS:
        return addDays(new Date(), duration);
      case DURATION_PERIOD_ENUM.MONTHS:
        return addMonths(new Date(), duration);
      case DURATION_PERIOD_ENUM.WEEKS:
        return addWeeks(new Date(), duration);
      case DURATION_PERIOD_ENUM.YEARS:
        return addYears(new Date(), duration);
      default:
        throw new BadGatewayException('Unknown duration type');
    }
  };

  get_free_package = async (body: InsertSubDto) => {
    const parsed = sanitize(body, InsertSubDto);
    return this.mutation.execute(async (em) => {
      const user = await this.users.find_by_id_lock(body.user_id, em);
      const _package = await this.packages.find_by_id_lock(
        parsed.package_id,
        em,
      );

      if (_package.type !== PRICING_TYPE_ENUM.FREE) {
        throw new BadGatewayException('cannot process this package');
      }

      const transaction = await this.transactions.initiate_payment(
        {
          user_id: user.id,
          type: TRANSACTION_TYPE_ENUM.PAYMENT,
          currency_code: NGN,
          amount: '0.00',
          metadata: {
            package_id: _package.id,
            ref_id: undefined,
            reason: 'free subscription purchase',
          },
        },
        em,
      );

      const response = await this.complete_subscription_purchase({
        gateway: 'internal',
        id: transaction.id,
        method: 'internal',
        ref_id: 'internal',
      });

      return response;
    });
  };

  initiate_subscription_purchase = async (body: InsertSubDto) => {
    const parsed = sanitize(body, InsertSubDto);

    return this.mutation.execute(async (em) => {
      const user = await this.users.find_by_id_lock(body.user_id, em);
      const _package = await this.packages.find_by_id_lock(
        parsed.package_id,
        em,
      );

      if (_package.type !== PRICING_TYPE_ENUM.PAID) {
        throw new BadGatewayException('cannot process this package');
      }

      const pricing = _package.pricings.find(
        (p) => p.currency_code === body.currency_code,
      );
      if (!pricing) throw new BadGatewayException('invalid currency');

      const transaction = await this.transactions.initiate_payment(
        {
          user_id: user.id,
          type: TRANSACTION_TYPE_ENUM.PAYMENT,
          metadata: {
            package_id: _package.id,
            reason: 'subscription purchase',
            ref_id: undefined,
          },
          currency_code: pricing.currency_code,
          amount: decimal_number(pricing.amount).toString(),
        },
        em,
      );

      return transaction;
    });
  };

  complete_subscription_purchase = async (body: CompletePaymentDto) => {
    const parsed = sanitize(body, CompletePaymentDto);

    return this.mutation.execute(async (em) => {
      const transaction = await this.transactions.complete_payment(
        {
          gateway: body.gateway,
          id: body.id,
          method: body.method,
          ref_id: body.ref_id,
        },
        em,
      );

      const metadata = transaction.metadata as IPaymentTxMetadata;

      const _package = await this.packages.find_by_id_lock(
        metadata.package_id,
        em,
      );

      const expires_at_date = this.get_duration(
        _package.duration_period,
        _package.duration,
      );

      const subscription = await this.create_sub(
        {
          amount: transaction.amount,
          charge: transaction.charge,
          currency_code: transaction.currency_code,
          duration: _package.duration,
          duration_period: _package.duration_period,
          expires_at: expires_at_date,
          last_used_at: new Date(),
          used_at: new Date(),
          package_id: _package.id,
          transaction_id: transaction.id,
          user_id: transaction.user_id,
        },
        em,
      );

      const existing = await this.find_hub_by_user_id_safe(
        transaction.user_id,
        em,
      );

      const hub = existing
        ? await this.update_hub_by_id(
            existing.id,
            { subscription_id: subscription.id, active_at: new Date() },
            em,
          )
        : await this.insert_hub(
            {
              subscription_id: subscription.id,
              user_id: transaction.user_id,
            },
            em,
          );

      return { transaction, subscription: hub };
    });
  };

  insert_hub = async (body: InsertHubDto, session?: EntityManager) => {
    const parsed = sanitize(body, InsertHubDto);
    const db = this.mutation.getRepo(this.hubs, session);
    const check = await db.findOne({ where: { user_id: body.user_id } });
    if (check) throw new BadGatewayException('already existing');
    return this.create_hub(
      {
        ...parsed,
        active_at: new Date(),
      },
      session,
    );
  };

  create_sub = async (body: CreateSubDto, session?: EntityManager) => {
    const parsed = sanitize(body, CreateSubDto);
    return create_helper<SubscriptionSchema>(this.subs, parsed, session);
  };

  create_hub = async (body: CreateHubDto, session?: EntityManager) => {
    const parsed = sanitize(body, CreateHubDto);
    const response = await create_helper<HubSchema>(
      this.hubs,
      parsed,
      session,
    );
    return this.find_hub_by_id(response.id, session);
  };

  find_hub_by_user_id = async (id: string) => {
    const response = await this.hubs.findOne({
      where: { user_id: id },
      relations: hub_relations,
    });
    if (response) return response;
    throw new BadGatewayException('No subscription for this user');
  };

  get_subs_by_index = async (query: Partial<QuerySubsByIndex> = {}) => {
    return paginate_by_index(query, this.subs);
  };

  find_sub_by_id = async (id: string, session?: EntityManager) => {
    return find_by_id_helper(this.subs, id, undefined, session);
  };

  find_hub_by_id = async (id: string, session?: EntityManager) => {
    return find_by_id_helper(
      this.hubs,
      id,
      { relations: hub_relations },
      session,
    );
  };

  find_hub_by_user_id_safe = async (
    id: string,
    session?: EntityManager,
  ) => {
    const db = this.mutation.getRepo(this.hubs, session);
    return db.findOne({
      where: { user_id: id },
      relations: hub_relations,
    });
  };

  update_sub_by_id = async (
    id: string,
    body: UpdateSubDto,
    session?: EntityManager,
  ) => {
    const parsed = sanitize(body, UpdateSubDto);
    return update_by_id_helper<SubscriptionSchema>(
      this.subs,
      id,
      parsed,
      session,
    );
  };

  update_hub_by_id = async (
    id: string,
    body: UpdateHubDto,
    session?: EntityManager,
  ) => {
    const parsed = sanitize(body, UpdateHubDto);
    return update_by_id_helper<HubSchema>(this.hubs, id, parsed, session);
  };
}
