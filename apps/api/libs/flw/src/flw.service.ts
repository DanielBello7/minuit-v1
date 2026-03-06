import axios from 'axios';
import { Inject, Injectable } from '@nestjs/common';
import { Bank } from 'ng-banks/lib/types';
import { type flconfig } from './flw.module';
import {
  IPayment,
  PaymentParams,
  PaymentResult,
  BankType,
  BankCredentials,
} from '@app/util/interfaces';
import { CurrencyType } from './types';
import {
  ACC_BALANCE,
  PAYMENT_PARAMETERS,
  PAYMENT_RESULT,
  VERIFY_ACCOUNT,
  VerifyResponse,
} from './types';

const banks = require('ng-banks');
const flutterwave = require('flutterwave-node-v3');

@Injectable()
export class FlwService extends IPayment {
  private secretkey: string;
  private publickey: string;
  public gateway: string;
  private processor: any;
  private axios: axios.AxiosInstance;
  private aCurrency: CurrencyType;

  constructor(@Inject('FLUTTERWAVE') private readonly flconfig: flconfig) {
    super();
    this.gateway = 'flutterwave';
    this.secretkey = this.flconfig.secretkey;
    this.publickey = this.flconfig.publickey;
    this.aCurrency = this.flconfig.aCurrency;
    this.processor = new flutterwave(this.publickey, this.secretkey);

    this.axios = axios.create({
      headers: { Authorization: `Bearer ${this.secretkey}` },
    });
  }

  get_payment_url = async (data: any): Promise<string> => {
    await new Promise((resolve) => {
      resolve(true);
    });
    return 'https://flutterwave.com/pay/';
  };

  get_account_balance = async (): Promise<ACC_BALANCE> => {
    const res = await this.axios.get('https://api.flutterwave.com/v3/balances');
    const balance: ACC_BALANCE = res.data.data.find(
      (item: any) => item.currency === this.aCurrency,
    );
    if (balance) return balance;
    throw new Error('couldnt find currency account');
  };

  make_a_payment = async (data: PAYMENT_PARAMETERS): Promise<PAYMENT_RESULT> => {
    if (this.aCurrency.toLowerCase() !== data.currency.toLowerCase()) {
      throw new Error(
        'flutterwave currency mismatch, input currency not same with selected flutterwave account currency',
      );
    }
    const trx: PAYMENT_RESULT = await this.processor.Transfer.initiate({
      account_number: data.account_number,
      account_bank: data.account_bank,
      amount: data.amount,
      currency: data.currency,
      beneficiary_name: data.beneficiary_name,
      narration: data.narration,
    });
    return trx;
  };

  get_banks = (): Bank[] => {
    const bank_list: Bank[] = banks.getBanks() as Bank[];
    if (!bank_list) throw new Error('couldnt get banks');
    return bank_list;
  };

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

  check_account_details = async (
    account_number: string,
    bank_code: string,
  ): Promise<VERIFY_ACCOUNT> => {
    const details = {
      account_number: account_number,
      account_bank: bank_code,
    };
    const response: VERIFY_ACCOUNT = await this.processor.Misc.verify_Account(details);
    return response;
  };

  checkIfAccountCanCarryAmount = async (amount: number): Promise<boolean> => {
    const balance = await this.get_account_balance();
    if (balance.available_balance > amount) return true;
    if (balance.ledger_balance > amount) return true;
    return false;
  };

  verify_payment = async (trxId: string): Promise<VerifyResponse> => {
    const response: VerifyResponse = await this.processor.Transaction.verify({
      id: trxId,
    });
    return response;
  };

  make_payment = async (data: PaymentParams): Promise<PaymentResult> => {
    console.log('data', data);
    const response = await this.make_a_payment({
      account_bank: data.accountBank,
      account_number: data.accountNumber,
      amount: data.amount,
      beneficiary_name: data.beneficiaryName,
      currency: data.currency,
      narration: data.narration,
    });
    if (response.status === 'error') throw new Error(response.message);
    return {
      accountNumber: data.accountNumber,
      amount: response.data.amount,
      bankName: data.accountBank,
      bankCode: response.data.bank_code,
      bankSlug: response.data.bank_name,
      createdAt: response.data.created_at,
      currency: data.currency,
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

  find_payment = async (refId: string): Promise<PaymentResult> => {
    const response = await this.verify_payment(refId);
    if (response.status === 'error') throw new Error(response.message);
    return {
      amount: response.data.amount,
      accountNumber: '',
      bankCode: '',
      bankName: '',
      bankSlug: '',
      createdAt: response.data.created_at,
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

  // eslint-disable-next-line @typescript-eslint/require-await
  get_available_banks = async (): Promise<BankType[]> => {
    const response = this.get_banks();
    return response.map((item) => ({
      code: item.code,
      name: item.name,
      slug: item.slug,
    }));
  };

  verify_credentials = async (data: {
    accountNumber: string;
    bankCode: string;
    bankName: string;
  }): Promise<BankCredentials> => {
    const response = await this.check_account_details(data.accountNumber, data.bankCode);
    if (response.status === 'error') throw new Error(response.message);
    return {
      accountNumber: response.data.account_number,
      accountName: response.data.account_name,
    };
  };

  verify_credentials_safe = async (data: {
    accountNumber: string;
    bankCode: string;
    bankName: string;
  }): Promise<VERIFY_ACCOUNT> => {
    const response = await this.check_account_details(data.accountNumber, data.bankCode);
    return response;
  };
}
