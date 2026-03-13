export type FlwCurrencyType =
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

export type FlwAccBalance = {
  currency: string;
  available_balance: number;
  ledger_balance: number;
};

export type FlwAccessTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: 'Bearer';
  scope: string;
};

export type FlwCreateTransferRecepientParams = {
  account_number: string;
  account_bank: string;
  currency: string;
};

export type FlwMakePaymentParams = {
  account_number: string;
  account_bank: string;
  amount: number;
  currency: string;
  beneficiary_name: string;
  narration?: string;
  reference?: string;
};

export type FlwRecipientResponse = {
  message: string;
  data: {
    id: string;
    type: string;
    bank?: {
      account_number?: string;
      code?: string;
      name?: string;
    };
    created_datetime?: string;
    created_at?: string;
  };
};

export type FlwTransferData = {
  id: string;
  amount: number;
  status: 'NEW' | 'PENDING' | 'SUCCESSFUL' | 'FAILED' | string;
  reference?: string;
  source_currency?: string;
  destination_currency?: string;
  narration?: string;
  bank?: {
    account_number?: string;
    code?: string;
    name?: string;
  };
  recipient?: {
    id?: string;
    type?: string;
  };
  sender?: {
    id?: string;
    type?: string;
  };
  fee?: number;
  created_datetime?: string;
  created_at?: string;
  updated_datetime?: string;
  updated_at?: string;
  meta?: Record<string, unknown>;
};

export type FlwTransferResponse = {
  message: string;
  data: FlwTransferData;
};

export type FlwPaymentVerifyResponse = {
  message: string;
  data: FlwTransferData;
};

export type FlwRefundData = {
  id: string;
  charge_id: string;
  amount_refunded: number;
  reason?: string;
  status: 'new' | 'pending' | 'succeeded' | 'completed' | 'failed' | string;
  created_datetime?: string;
  created_at?: string;
  updated_datetime?: string;
  updated_at?: string;
  meta?: Record<string, unknown>;
};

export type FlwRefundResponse = {
  message: string;
  data: FlwRefundData;
};

export type FlwBankAccountLookupResponse = {
  message: string;
  data: {
    bank_code: string;
    account_number: string;
    account_name: string;
  };
};

export type FlwAccVerifyFailed = {
  status: 'error';
  message: string;
  data: null;
};

export type FlwAccVerifyPassed = {
  status: 'success';
  message: string;
  data: {
    account_number: string;
    account_name: string;
  };
};

export type FlwAccVerify = FlwAccVerifyFailed | FlwAccVerifyPassed;
