export type CurrencyType =
  | 'NGN'
  | 'USD'
  | 'KES'
  | 'GHS'
  | 'EUR'
  | 'ZMW'
  | 'SLL'
  | 'NOK'
  | 'AUD'
  | 'JPY'
  | 'CAD';

export interface PAYMENT_PARAMETERS {
  account_number: string;
  account_bank: string;
  amount: number;
  currency: string;
  beneficiary_name: string;
  narration?: string;
}

export type ACC_BALANCE = {
  currency: string;
  available_balance: number;
  ledger_balance: number;
};

export type VERIFY_ACCOUNT =
  | {
      status: 'error';
      message: string;
      data: null;
    }
  | {
      status: 'success';
      message: string;
      data: {
        account_number: string;
        account_name: string;
      };
    };

export type PAYMENT_RESULT = {
  status: 'error' | 'success';
  message: string;
  data: {
    id: number;
    account_number: string;
    bank_code: string;
    full_name: string;
    created_at: Date | string;
    currency: string;
    amount: number;
    fee: number;
    status: 'FAILED' | 'NEW';
    reference: string;
    meta: null;
    narration: string;
    complete_message: string;
    requires_approval: boolean;
    is_approved: boolean;
    bank_name: string;
  };
};

export interface PAYMENT_DATA {
  account_number: string;
  account_bank: string; // get bank from GetBanks()
  amount: number;
  currency: string;
  reference: string;
  debit_currency: string;
  beneficiary_name: string;
  narration?: string;
}

export interface VerifySuccessResponse {
  status: 'success';
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: 'successful' | 'failed';
    payment_type: string;
    created_at: string;
    account_id: number;
    amount_settled: number;
    card: {
      first_6digits: string;
      last_4digits: string;
      issuer: string;
      country: string;
      type: string;
      token: string;
      expiry: string;
    };
    customer: {
      id: number;
      name: string;
      phone_number: string;
      email: string;
      created_at: string;
    };
  };
}

export interface VerifyFailedResponse {
  status: 'error';
  message: string;
  data: null;
}

export type VerifyResponse = VerifyFailedResponse | VerifySuccessResponse;
