import { ICommon } from "./common";
import { DURATION_PERIOD_ENUM } from "./financial";
import { CurrencyCode } from "./puddle";

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

export enum TRANSACTION_TYPE_ENUM {
	DEPOSIT = "DEPOSIT",
	WITHDRAWAL = "WITHDRAWAL",
	TRANSFER = "TRANSFER",
}

export enum DEPOSIT_TRANSACTION_TYPE_ENUM {
	ACCOUNT_FUNDING = "ACCOUNT_FUNDING",
	PAYMENT = "PAYMENT",
}

export enum WITHDRAWAL_TRANSACTION_TYPE_ENUM {
	REFUNDS = "REFUNDS",
	FUNDS_WITHDRAWAL = "FUNDS_WITHDRAWAL",
}

export enum TRANSFER_TRANSACTION_TYPE_ENUM {
	PAYMENT = "PAYMENT",
	INTERNAL_SERVICE = "INTERNAL_SERVICE",
}

export enum TRANSACTION_STATUS_ENUM {
	PENDING = "PENDING",
	COMPLETED = "COMPLETED",
	FAILED = "FAILED",
	EXPIRED = "EXPIRED",
	PROCESSING = "PROCESSING",
}

export type DEPOSIT_ACCOUNT_FUNDING = {
	into_id: string;
};

export type PAYMENT_TYPE = {
	items: { item_id: string; quantity: number }[];
};

export type IDepositTxMetadata = {
	type: DEPOSIT_TRANSACTION_TYPE_ENUM;
	gateway: string | undefined;
	metadata: DEPOSIT_ACCOUNT_FUNDING | PAYMENT_TYPE;
};

export type WITHDRAWAL_FUNDS_REMOVAL = {
	is_approved: boolean | undefined;
	bank_name: string;
	bank_code: string;
	bank_numb: string;
};

export type WITHDRAWAL_REFUNDS_TYPE = {
	method: string;
	is_approved: boolean | undefined;
	transaction_id: string;
};

export type IWithdrawalTxMetadata = {
	type: WITHDRAWAL_TRANSACTION_TYPE_ENUM;
	gateway: string | undefined;
	metadata: WITHDRAWAL_FUNDS_REMOVAL | WITHDRAWAL_REFUNDS_TYPE;
};

export type TRANSFER_INTERNAL_SERVICE = {
	notes: string;
	from_user_id: string;
	into_user_id: string;
};

export type ITransferTxMetadata = {
	type: TRANSFER_TRANSACTION_TYPE_ENUM;
	from_id: string; // from ledger id
	into_id: string; // into ledger id
	metadata: TRANSFER_INTERNAL_SERVICE | PAYMENT_TYPE;
};

export type ITransactionsBase = ICommon & {
	charge: string;
	amount: string;
	method: string | undefined;
	currency_code: CurrencyCode;
	narration: string | undefined;
	user_id: string;
	expires_at: Date;
	type: TRANSACTION_TYPE_ENUM;
	status: TRANSACTION_STATUS_ENUM;
	metadata: Record<string, any>;
};

export type IDepositTx = ITransactionsBase & {
	type: TRANSACTION_TYPE_ENUM.DEPOSIT;
	metadata: IDepositTxMetadata;
};

export type IWithdrawalTx = ITransactionsBase & {
	type: TRANSACTION_TYPE_ENUM.WITHDRAWAL;
	metadata: IWithdrawalTxMetadata;
};

export type ITransferTx = ITransactionsBase & {
	type: TRANSACTION_TYPE_ENUM.TRANSFER;
	metadata: ITransferTxMetadata;
};

export type ITransactions = IDepositTx | IWithdrawalTx | ITransferTx;
