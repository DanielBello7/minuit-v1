import { ICommon } from "./common";
import { TRANSACTION_TYPE_ENUM } from "./financial";

export type IFeedback = ICommon & {
	user_id?: string;
	name: string;
	message: string;
	rating: number; // app rating
};

export type CurrencyCode = string & { readonly __brand: "CurrencyCode" };

export const USD = "USD" as CurrencyCode;
export const NGN = "NGN" as CurrencyCode;

export type ICurrency = {
	name: string; // "US Dollar"
	code: CurrencyCode; // "USD" (ISO 4217 alpha code)
	symbol: string; // "$"
	numeric_code?: string; // "840"
};

export type ICharge = {
	currency_code: CurrencyCode;
	amount: string;
};

export type ISettings = ICommon & {
	transaction_expiry_hours: number;
	version: string;
	max_free_alarms: number;
	max_free_clocks: number;
	currencies: ICurrency[];
	charges: {
		[TRANSACTION_TYPE_ENUM.PAYMENT]: ICharge[];
		[TRANSACTION_TYPE_ENUM.REFUNDS]: ICharge[];
	};
};
