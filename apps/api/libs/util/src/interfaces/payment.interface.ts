export type IPaymentVerifyCredentialsParams = {
  account_number: string;
  bank_code: string;
  bank_name: string;
};

/**
 * Parameters required to make a payment.
 * parameters that all payment processors would collect
 */
export type IPaymentPaymentParams = {
  account_number: string;
  account_bank: string;
  amount: number;
  currency: string;
  beneficiary_name: string;
  narration?: string;
  ref: string;
};

/**
 * data structure type for all banks in this app
 */
export type IPaymentBankType = {
  name: string;
  code: string | null;
  slug: string;
};

/**
 * banking credentials required to make operations on this app
 */
export type IPaymentBankCredentials = {
  account_number: string;
  account_name: string;
};

/**
 * result from a payment process.
 * result format that all payment processors must return whenever a payment is made
 */
export type IPaymentPaymentResult = {
  status: 'successful' | 'failed' | 'pending';
  ref: string;
  amount: number;
  currency: string;
  narration: string;
  created_at: Date | string;
  account_number: string;
  bank_name: string;
  bank_slug: string;
  bank_code: string | null;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
};

/**
 * response from account verification
 */
type SuccessResponse = {
  status: 'success';
  message: string;
  data: {
    account_number: string;
    account_name: string;
  };
};

type FailureResponse = {
  status: 'error';
  message: string;
  data: null;
};

export type IPaymentAccountVerifyRes = FailureResponse | SuccessResponse;

export type IPaymentRefundParams = {
  chargeId: string;
  amount: number;
  reason: string;
  callbackUrl?: string;
  meta?: Record<string, unknown>;
  idempotencyKey?: string;
};

export type IPaymentRefundResult = {
  id: string;
  charge_id: string;
  amount_refunded: number;
  reason?: string;
  status: string;
  created_at?: string;
  meta?: Record<string, unknown>;
};

// prettier-ignore
/**
 * Payment processor interface.
 * main type that every payment processor used in this app would have to follow
 */
export interface IPaymentType {
  gateway: string;
  get_available_banks(): Promise<IPaymentBankType[]>;
  make_payment(params: IPaymentPaymentParams): Promise<IPaymentPaymentResult>;
  find_payment(ref_id: string): Promise<IPaymentPaymentResult>;
  verify_credentials(params: IPaymentVerifyCredentialsParams ): Promise<IPaymentBankCredentials>;
  refund_payment(params: IPaymentRefundParams): Promise<IPaymentRefundResult>;
}

// prettier-ignore
export abstract class IPayment  implements IPaymentType{
  gateway: string;
  abstract get_payment_url(params: any): Promise<string>;
  abstract make_payment(params: IPaymentPaymentParams): Promise<IPaymentPaymentResult>;
  abstract find_payment(ref_id: string): Promise<IPaymentPaymentResult>;
  abstract get_available_banks(): Promise<IPaymentBankType[]>;
  abstract verify_credentials(params: IPaymentVerifyCredentialsParams): Promise<IPaymentBankCredentials>;
  abstract verify_credentials_safe(params: IPaymentVerifyCredentialsParams): Promise<IPaymentAccountVerifyRes>;
  abstract refund_payment(params: IPaymentRefundParams): Promise<IPaymentRefundResult>;
}
