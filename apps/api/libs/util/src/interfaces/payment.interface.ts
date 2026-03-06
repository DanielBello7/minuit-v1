/**
 * Payment processor interface
 */
export interface IPaymentType {
  gateway: string;
  make_payment(data: PaymentParams): Promise<PaymentResult>;
  find_payment(refId: string): Promise<PaymentResult>;
  get_available_banks(): Promise<BankType[]>;
  verify_credentials(data: {
    accountNumber: string;
    bankCode: string;
    bankName: string;
  }): Promise<BankCredentials>;
}

/**
 * Parameters required to make a payment
 */
export type PaymentParams = {
  accountNumber: string;
  accountBank: string;
  amount: number;
  currency: string;
  beneficiaryName: string;
  narration?: string;
};

/**
 * data structure type for all banks in this app
 */
export type BankType = {
  name: string;
  code: string | null;
  slug: string;
};

/**
 * banking credentials required to make operations on this app
 */
export type BankCredentials = {
  accountNumber: string;
  accountName: string;
};

/**
 * result from a payment process
 */
export type PaymentResult = {
  status: 'successful' | 'failed';
  ref: string;
  amount: number;
  currency: string;
  narration: string;
  createdAt: Date | string;
  accountNumber: string;
  bankName: string;
  bankSlug: string;
  bankCode: string | null;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
};

/**
 * response from account verification
 */
export type AccountVerifyResponse =
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

export abstract class IPayment {
  gateway: string;
  abstract get_payment_url(data: any): Promise<string>;
  abstract make_payment(data: PaymentParams): Promise<PaymentResult>;
  abstract find_payment(refId: string): Promise<PaymentResult>;
  abstract get_available_banks(): Promise<BankType[]>;
  abstract verify_credentials(data: {
    accountNumber: string;
    bankCode: string;
    bankName: string;
  }): Promise<BankCredentials>;
  abstract verify_credentials_safe(data: {
    accountNumber: string;
    bankCode: string;
    bankName: string;
  }): Promise<AccountVerifyResponse>;
}
