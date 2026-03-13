export type FLUTTERWAVE_CURRENCY_TYPE =
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

export type FLUTTERWAVE_ACC_BALANCE = {
  currency: string;
  available_balance: number;
  ledger_balance: number;
};

export type FLUTTERWAVE_PAYMENT_RESULT = {
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

export type PAYMENT_DATA = {
  account_number: string;
  account_bank: string; // get bank from GetBanks()
  amount: number;
  currency: string;
  reference: string;
  debit_currency: string;
  beneficiary_name: string;
  narration?: string;
};

type FLUTTERWAVE_ACC_VERIFY_FAILED = {
  status: 'error';
  message: string;
  data: null;
};

type FLUTTERWAVE_ACC_VERIFY_PASSED = {
  status: 'success';
  message: string;
  data: {
    account_number: string;
    account_name: string;
  };
};

export type FLUTTERWAVE_ACC_VERIFY_ACCOUNT =
  | FLUTTERWAVE_ACC_VERIFY_FAILED
  | FLUTTERWAVE_ACC_VERIFY_PASSED;

type FLUTTERWAVE_VERIFY_SUCCESS_RESPONSE = {
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
};

type FLUTTERWAVE_VERIFY_FAILED_RESPONSE = {
  status: 'error';
  message: string;
  data: null;
};

export type FLUTTERWAVE_VERIFY_RESPONSE =
  | FLUTTERWAVE_VERIFY_FAILED_RESPONSE
  | FLUTTERWAVE_VERIFY_SUCCESS_RESPONSE;
