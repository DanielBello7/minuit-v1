import { ICommon } from "./common";
import { CurrencyCode } from "./puddle";

export enum DURATION_PERIOD_ENUM {
	MONTHS = "MONTHS",
	YEARS = "YEARS",
	DAYS = "DAYS",
	WEEKS = "WEEKS",
}

export type PricingType = {
	currency_code: CurrencyCode;
	amount: string;
};

export type IPackage = ICommon & {
	pricings: PricingType[];
	title: string;
	description: string;
	features: string[];
	duration: number; // this specifies how long this subscription would last when bought
	duration_period: DURATION_PERIOD_ENUM;
	admin_id: string;
};

export enum TRANSACTION_TYPE_ENUM {
	REFUNDS = "REFUNDS",
	PAYMENT = "PAYMENT",
}

export enum TRANSACTION_STATUS_ENUM {
	PENDING = "PENDING",
	COMPLETED = "COMPLETED",
	FAILED = "FAILED",
	EXPIRED = "EXPIRED",
	PROCESSING = "PROCESSING",
}

export type IPaymentTxMetadata = {
	reason: string;
	ref_id: string | undefined;
};

export type IRefundsTxMetadata = {
	reason: string;
	og_trx_id: string;
};

export type ITransactionsBase = ICommon & {
	charge: string;
	amount: string;
	method: string | undefined;
	currency_code: CurrencyCode;
	narration: string | undefined;
	user_id: string;
	gateway: string | undefined;
	expires_at: Date;
	type: TRANSACTION_TYPE_ENUM;
	status: TRANSACTION_STATUS_ENUM;
	metadata: Record<string, any>;
};

export type IPaymentTx = ITransactionsBase & {
	type: TRANSACTION_TYPE_ENUM.PAYMENT;
	metadata: IPaymentTxMetadata;
};

export type IRefundsTx = ITransactionsBase & {
	type: TRANSACTION_TYPE_ENUM.REFUNDS;
	metadata: IRefundsTxMetadata;
};

export type ITransactions = IPaymentTx | IRefundsTx;

export type IActiveSubs = ICommon & {
	user_id: string;
	subscription_id: string;
	active_at: Date;
};

export type ISubscription = ICommon & {
	transaction_id: string;
	user_id: string;
	package_id: string;
	currency_code: CurrencyCode;
	amount: string;
	charge: string;
	duration: number;
	duration_period: DURATION_PERIOD_ENUM;
	ref_id: string; // for the third party payment service
	expires_at: Date;
	last_used_at: Date | undefined;
	used_at: Date | undefined;
};
