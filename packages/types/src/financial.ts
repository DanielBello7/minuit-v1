import { ICommon } from "./common";

export enum CURRENCY_ENUM {
	USD = "usd",
	NGN = "ngn",
}

export enum DURATION_PERIOD_ENUM {
	MONTHS = "MONTHS",
	YEARS = "YEARS",
	DAYS = "DAYS",
	WEEKS = "WEEKS",
}

export type PricingType = {
	currency: CURRENCY_ENUM;
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
	REFUND = "REFUND",
	PAYMENT = "PAYMENT",
}

export enum TRANSACTION_STATUS_ENUM {
	PENDING = "PENDING",
	COMPLETED = "COMPLETED",
	FAILED = "FAILED",
}

export type ITransactions = ICommon & {
	narration: string;
	user_id: string;
	charge: string;
	amount: string;
	currency: CURRENCY_ENUM;
	gateway: string;
	method: string;
	type: TRANSACTION_TYPE_ENUM;
	status: TRANSACTION_STATUS_ENUM;
};

export type IActiveSubs = ICommon & {
	user_id: string;
	subscription_id: string;
	active_at: Date;
};

export type ISubscription = ICommon & {
	transaction_id: string;
	user_id: string;
	package_id: string;
	currency: CURRENCY_ENUM;
	amount: string;
	charge: string;
	duration: number;
	duration_period: DURATION_PERIOD_ENUM;
	ref_id: string; // for the third party payment service
	expires_at: Date;
	last_used_at: Date | undefined;
	used_at: Date | undefined;
};
