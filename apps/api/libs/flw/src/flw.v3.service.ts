/** Flutterwave Service V3 */
import axios from 'axios';
import { Inject, Injectable } from '@nestjs/common';
import { Bank } from 'ng-banks/lib/types';
import { type v3_flconfig } from './flw.module';
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
  FLUTTERWAVE_CURRENCY_TYPE,
  FLUTTERWAVE_ACC_VERIFY_ACCOUNT,
} from './types.v3';
import {
  FLUTTERWAVE_ACC_BALANCE,
  FLUTTERWAVE_PAYMENT_RESULT,
  FLUTTERWAVE_VERIFY_RESPONSE,
} from './types.v3';

const banks = require('ng-banks');
const flutterwave = require('flutterwave-node-v3');

// prettier-ignore
@Injectable()
export class FlwService extends IPayment {
  public readonly gateway: string = 'flutterwave';
  private secretkey: string;
  private publickey: string;
  private processor: any;
  private axios: axios.AxiosInstance;
  private aCurrency: FLUTTERWAVE_CURRENCY_TYPE;

  constructor(@Inject('FLUTTERWAVE') private readonly flconfig: v3_flconfig) {
    super();
    this.secretkey = this.flconfig.secretkey;
    this.publickey = this.flconfig.publickey;
    this.aCurrency = this.flconfig.aCurrency;
    this.processor = new flutterwave(this.publickey, this.secretkey);

    this.axios = axios.create({
      headers: { Authorization: `Bearer ${this.secretkey}` },
    });
  }

  find_payment = async (ref_id: string): Promise<IPaymentPaymentResult> => {
    const response = await this.verify_payment(ref_id);
    if (response.status === 'error') throw new Error(response.message);
    return {
      amount: response.data.amount,
      account_number: '',
      bank_code: '',
      bank_name: '',
      bank_slug: '',
      created_at: response.data.created_at,
      currency: response.data.currency,
      customer: {
        name: response.data.customer.name,
        email: response.data.customer.email,
        phone: response.data.customer.phone_number,
      },
      narration: response.data.narration,
      ref: response.data.tx_ref,
      status: response.data.status,
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

  get_payment_url = async (params: any): Promise<string> => {
    await new Promise((resolve) => {
      resolve(true);
    });
    return 'https://flutterwave.com/pay/';
  };

  make_payment = async (params: IPaymentPaymentParams): Promise<IPaymentPaymentResult> => {
    console.log('data', params);
    const response = await this.make_a_payment({
      account_bank: params.account_bank,
      account_number: params.account_number,
      amount: params.amount,
      beneficiary_name: params.beneficiary_name,
      currency: params.currency,
      narration: params.narration,
    });
    if (response.status === 'error') throw new Error(response.message);
    return {
      account_number: params.account_number,
      amount: response.data.amount,
      bank_name: params.account_bank,
      bank_code: response.data.bank_code,
      bank_slug: response.data.bank_name,
      created_at: response.data.created_at,
      currency: params.currency,
      customer: {
        email: '',
        phone: '',
        name: response.data.full_name,
      },
      narration: response.data.narration,
      ref: response.data.reference,
      status: response.data.status === 'FAILED' ? 'failed' : 'successful',
    };
  };

  verify_credentials = async (params: IPaymentVerifyCredentialsParams): Promise<IPaymentBankCredentials> => {
    const response = await this.check_account_details(
      params.account_number,
      params.bank_code,
    );
    if (response.status === 'error') throw new Error(response.message);
    return {
      account_name: response.data.account_name,
      account_number: response.data.account_number,
    };
  };

  verify_credentials_safe = async (params: IPaymentVerifyCredentialsParams): Promise<IPaymentAccountVerifyRes> => {
    const response = await this.check_account_details(
      params.account_number,
      params.bank_code,
    );
    return response;
  };

  refund_payment = (params: IPaymentRefundParams): Promise<any> => {
    throw new Error('Method not implemented.');
  };

  /** local */
  get_account_balance = async (): Promise<FLUTTERWAVE_ACC_BALANCE> => {
    const res = await this.axios.get('https://api.flutterwave.com/v3/balances');
    const balance: FLUTTERWAVE_ACC_BALANCE = res.data.data.find(
      (item: any) => item.currency === this.aCurrency,
    );
    if (balance) return balance;
    throw new Error('couldnt find currency account');
  };

  /** local */
  make_a_payment = async (data: IPaymentPaymentParams): Promise<FLUTTERWAVE_PAYMENT_RESULT> => {
    if (this.aCurrency.toLowerCase() !== data.currency.toLowerCase()) {
      throw new Error(
        'flutterwave currency mismatch, input currency not same with selected flutterwave account currency',
      );
    }
    const trx: FLUTTERWAVE_PAYMENT_RESULT =
      await this.processor.Transfer.initiate({
        account_number: data.account_number,
        account_bank: data.account_bank,
        amount: data.amount,
        currency: data.currency,
        beneficiary_name: data.beneficiary_name,
        narration: data.narration,
      });
    return trx;
  };

  /** local */
  get_banks = (): Bank[] => {
    const bank_list: Bank[] = banks.getBanks() as Bank[];
    if (!bank_list) throw new Error('couldnt get banks');
    return bank_list;
  };

  /** local */
  find_bank_using_name_or_slug_or_code = (keyword: string): Bank => {
    const key = keyword.toLowerCase();
    const response = this.get_banks();
    const bank = response.find((item) => {
      const itemName = item.name.toLowerCase();
      const itemSlug = item.slug.toLowerCase();
      const itemCode = item.code?.toLowerCase();
      if (itemName === key || itemSlug === key || itemCode === key) return item;
    });
    if (!bank) throw new Error('bank not found');
    return bank;
  };

  /** local */
  check_account_details = async (account_number: string,bank_code: string): Promise<FLUTTERWAVE_ACC_VERIFY_ACCOUNT> => {
    const details = { account_number, account_bank: bank_code };
    const response: FLUTTERWAVE_ACC_VERIFY_ACCOUNT = await this.processor.Misc.verify_Account(details);
    return response;
  };

  /** local */
  check_if_account_can_carry_amount = async (amount: number): Promise<boolean> => {
    const balance = await this.get_account_balance();
    if (balance.available_balance > amount) return true;
    if (balance.ledger_balance > amount) return true;
    return false;
  };

  /** local */
  verify_payment = async (trx_id: string): Promise<FLUTTERWAVE_VERIFY_RESPONSE> => {
    const response: FLUTTERWAVE_VERIFY_RESPONSE = await this.processor.Transaction.verify({
      id: trx_id,
    });
    return response;
  };
}
