/** Flutterwave Service V4 */
import axios from 'axios';
import { type v4_flconfig } from './flw.module';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Inject, Injectable } from '@nestjs/common';
import { Bank } from 'ng-banks/lib/types';
import {
  IPayment,
  IPaymentPaymentParams,
  IPaymentPaymentResult,
  IPaymentBankType,
  IPaymentBankCredentials,
  IPaymentAccountVerifyRes,
  IPaymentRefundParams,
  IPaymentVerifyCredentialsParams,
} from '@app/util/interfaces';
import {
  FlwAccBalance,
  FlwAccessTokenResponse,
  FlwAccVerify,
  FlwCreateTransferRecepientParams,
  FlwCurrencyType,
  FlwMakePaymentParams,
  FlwRecipientResponse,
  FlwRefundResponse,
  FlwTransferResponse,
  FlwPaymentVerifyResponse,
  FlwBankAccountLookupResponse,
} from './types.v4';

const banks = require('ng-banks');

// prettier-ignore
@Injectable()
export class FlwService extends IPayment {
  public gateway: string = "flutterwave";

  private readonly client_id: string;
  private readonly client_secret: string;
  private readonly a_currency: FlwCurrencyType;
  private readonly base_url: string;

  private readonly http: AxiosInstance;

  private access_token?: string;
  private access_token_expires_at?: number;

  constructor(@Inject('FLUTTERWAVE') private readonly config: v4_flconfig) {
    super();

    this.client_id = this.config.client_id;
    this.client_secret = this.config.client_secret;
    this.a_currency = this.config.a_currency;

    this.base_url =
      this.config.env === 'production'
        ? 'https://f4bexperience.flutterwave.com'
        : 'https://developersandbox-api.flutterwave.com';

    this.http = axios.create({
      baseURL: this.base_url,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private generate_trace_id = (): string =>{
    return `flw_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  private get_access_token = async (): Promise<string> => {
    const now = Date.now();

    if (
      this.access_token &&
      this.access_token_expires_at &&
      now < this.access_token_expires_at
    ) {
      return this.access_token;
    }

    const body = new URLSearchParams({
      client_id: this.client_id,
      client_secret: this.client_secret,
      grant_type: 'client_credentials',
    });

    const response = await axios.post<FlwAccessTokenResponse>(
      'https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token',
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    this.access_token = response.data.access_token;

    // Refresh a bit early to avoid edge-of-expiry failures
    this.access_token_expires_at = now + Math.max(response.data.expires_in - 30, 60) * 1000;

    return this.access_token;
  }

  private request = async <T>(config: AxiosRequestConfig, idempotency_key?: string): Promise<T> => {
    const token = await this.get_access_token();

    const response = await this.http.request<T>({
      ...config,
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Trace-Id': this.generate_trace_id(),
        ...(idempotency_key ? { 'X-Idempotency-Key': idempotency_key } : {}),
        ...(config.headers ?? {}),
      },
    });

    return response.data;
  }

  private get_recipient_type = (currency: string): string => {
    switch (currency.toUpperCase()) {
      case 'NGN':
        return 'bank_ngn';
      default:
        throw new Error(`unsupported transfer recipient type for currency: ${currency}`);
    }
  }

  private create_transfer_recipient = async (params: FlwCreateTransferRecepientParams): Promise<string> => {
    const response = await this.request<FlwRecipientResponse>(
      {
        method: 'POST',
        url: '/transfers/recipients',
        data: {
          type: this.get_recipient_type(params.currency),
          bank: {
            account_number: params.account_number,
            code: params.account_bank,
          },
        },
      },
      `recipient_${params.currency}_${params.account_bank}_${params.account_number}`,
    );

    return response.data.id;
  }

  find_payment = async (ref_id: string): Promise<IPaymentPaymentResult> => {
    const response = await this.verify_payment(ref_id);
    const transfer = response.data as any;

    return {
      amount: transfer.amount,
      account_number: transfer.bank?.account_number ?? '',
      bank_code: transfer.bank?.code ?? '',
      bank_name: transfer.bank?.name ?? '',
      bank_slug: transfer.bank?.name ?? '',
      created_at: transfer.created_datetime ?? transfer.created_at ?? new Date().toISOString(),
      currency: transfer.source_currency ?? transfer.destination_currency ?? this.a_currency,
      customer: {
        name: '',
        email: '',
        phone: '',
      },
      narration: transfer.narration ?? '',
      ref: transfer.reference ?? transfer.id,
      status:
        transfer.status === 'SUCCESSFUL'
          ? 'successful'
          : transfer.status === 'FAILED'
            ? 'failed'
            : 'pending',
    };
  };

  get_available_banks = async (): Promise<IPaymentBankType[]> => {
    const response = this.get_banks();
    return response.map((item) => ({
      code: item.code,
      name: item.name,
      slug: item.slug,
    }));
  };

  get_payment_url = async (_params: unknown): Promise<string> => {
    return 'https://flutterwave.com/pay/';
  };

  make_payment = async (params: IPaymentPaymentParams): Promise<IPaymentPaymentResult> => {
    const response = await this.make_a_payment({
      account_bank: params.account_bank,
      account_number: params.account_number,
      amount: Number(params.amount),
      beneficiary_name: params.beneficiary_name,
      currency: params.currency,
      narration: params.narration,
      reference: params.ref,
    });

    const transfer = response.data;

    return {
      account_number: params.account_number,
      amount: transfer.amount,
      bank_name: params.account_bank,
      bank_code: transfer.bank?.code ?? params.account_bank,
      bank_slug: transfer.bank?.name ?? '',
      created_at: transfer.created_datetime ?? transfer.created_at ?? new Date().toISOString(),
      currency: params.currency,
      customer: {
        email: '',
        phone: '',
        name: params.beneficiary_name,
      },
      narration: params.narration ?? "",
      ref: transfer.reference ?? transfer.id,
      // initial create comes back as NEW, so map to pending until it settles
      status:
        transfer.status === 'SUCCESSFUL'
          ? 'successful'
          : transfer.status === 'FAILED'
            ? 'failed'
            : 'pending',
    };
  };

  verify_credentials = async (params: IPaymentVerifyCredentialsParams): Promise<IPaymentBankCredentials> => {
    const response = await this.check_account_details(params.account_number, params.bank_code);

    if (response.status === 'error' || !response.data) {
      throw new Error(response.message);
    }

    return {
      account_number: response.data.account_number,
      account_name: response.data.account_name,
    };
  };

  verify_credentials_safe = async (params: IPaymentVerifyCredentialsParams): Promise<IPaymentAccountVerifyRes> => {
    return await this.check_account_details(params.account_number, params.bank_code);
  };

  refund_payment = async (params: IPaymentRefundParams): Promise<any> => {
    return await this.request<FlwRefundResponse>(
      {
        method: 'POST',
        url: '/refunds',
        data: {
          charge_id: params.chargeId,
          amount: params.amount,
          reason: params.reason,
          callbackurl: params.callbackUrl,
          meta: params.meta,
        },
      },
      params.idempotencyKey ?? `refund_${params.chargeId}_${params.amount}`,
    );
  }

  /** local */
  public get_account_balance = async (): Promise<FlwAccBalance> => {
    const res = await this.request<{
      message: string;
      data: {
        available_balance: number;
        ledger_balance: number;
        currency: string;
      };
    }>({
      method: 'GET',
      url: `/wallets/${this.a_currency}/balance`,
    });

    return {
      currency: res.data.currency,
      available_balance: res.data.available_balance,
      ledger_balance: res.data.ledger_balance,
    };
  };

  /** local */
  public get_banks = (): Bank[] => {
    const bank_list: Bank[] = banks.getBanks() as Bank[];
    if (!bank_list) throw new Error('couldnt get banks');
    return bank_list;
  };

  /** local */
  public find_bank_using_name_or_slug_or_code = (keyword: string): Bank => {
    const key = keyword.toLowerCase();
    const response = this.get_banks();

    const bank = response.find((item) => {
      const itemName = item.name.toLowerCase();
      const itemSlug = item.slug.toLowerCase();
      const itemCode = item.code?.toLowerCase();

      return itemName === key || itemSlug === key || itemCode === key;
    });

    if (!bank) throw new Error('bank not found');
    return bank;
  };

  /** local */
  public check_account_details = async (account_number: string, bank_code: string): Promise<FlwAccVerify> => {
    try {
      const response = await this.request<FlwBankAccountLookupResponse>({
        method: 'POST',
        url: '/banks/account-resolve',
        data: {
          account: {
            code: bank_code,
            number: account_number,
          },
          currency: this.a_currency,
        },
      });

      return {
        status: 'success',
        message: response.message,
        data: {
          account_number: response.data.account_number,
          account_name: response.data.account_name,
        },
      };
    } catch (error: any) {
      return {
        status: 'error',
        message:
          error?.response?.data?.error?.message ??
          error?.message ??
          'account verification failed',
        data: null,
      };
    }
  };

  /** local */
  public check_if_account_can_carry_amount = async (amount: number): Promise<boolean> => {
    const balance = await this.get_account_balance();
    if (balance.available_balance > amount) return true;
    if (balance.ledger_balance > amount) return true;
    return false;
  };

  /** local */
  public make_a_payment = async (params: FlwMakePaymentParams): Promise<FlwTransferResponse> => {
    if (this.a_currency.toLowerCase() !== params.currency.toLowerCase()) {
      throw new Error(
        'flutterwave currency mismatch, input currency not same with selected flutterwave account currency',
      );
    }

    const rep_id = await this.create_transfer_recipient({
      account_number: params.account_number,
      account_bank: params.account_bank,
      currency: params.currency,
    });

    return await this.request<FlwTransferResponse>(
      {
        method: 'POST',
        url: '/transfers',
        data: {
          action: 'instant',
          callback_url: undefined,
          payment_instruction: {
            amount: params.amount,
            source_currency: params.currency,
            recipient_id: rep_id,
          },
          narration: params.narration,
          reference: params.reference,
          meta: {
            beneficiary_name: params.beneficiary_name,
          },
        },
      },
      params.reference ?? `transfer_${params.account_bank}_${params.account_number}_${params.amount}`,
    );
  };

  /** local */
  public verify_payment = async (transfer_id: string): Promise<FlwPaymentVerifyResponse> => {
    return await this.request<FlwPaymentVerifyResponse>({
      method: 'GET',
      url: `/transfers/${transfer_id}`,
    });
  };


  /** local */
  public find_refund = async (refund_id: string): Promise<FlwRefundResponse> => {
    return await this.request<FlwRefundResponse>({
      method: 'GET',
      url: `/refunds/${refund_id}`,
    });
  };
}
