import { ApiService } from "@/utils";
import { AxiosInstance } from "axios";
import type {
	CurrencyCode,
	IDatePaginated,
	IIndexPaginated,
	ITransactionsWithUser,
	SORT_TYPE_ENUM,
	TRANSACTION_STATUS_ENUM,
	TRANSACTION_TYPE_ENUM,
} from "@repo/types";

export type DatePagination = {
	date?: Date | string;
	pick?: number;
	sort?: SORT_TYPE_ENUM;
};

export type IndexPagination = {
	index?: number;
	pick?: number;
	sort?: SORT_TYPE_ENUM;
};

export type QueryTransactionsByDatesParams = {
	pagination?: DatePagination;
	user_id?: string;
	charge?: string;
	amount?: string;
	currency_code?: CurrencyCode;
	gateway?: string;
	method?: string;
	type?: TRANSACTION_TYPE_ENUM;
	status?: TRANSACTION_STATUS_ENUM;
};

export type QueryTransactionsByIndexParams = {
	pagination?: IndexPagination;
	user_id?: string;
	charge?: string;
	amount?: string;
	currency_code?: CurrencyCode;
	gateway?: string;
	method?: string;
	type?: TRANSACTION_TYPE_ENUM;
	status?: TRANSACTION_STATUS_ENUM;
};

export class TransactionsService extends ApiService {
	constructor(baseURL?: string | AxiosInstance) {
		super(baseURL ?? "");
	}

	/**
	 * Paginates transactions by date cursor (docs include populated User).
	 * @param params - Query and pagination params
	 * @returns Date-paginated transactions with User relation
	 */
	get_by_dates = async (
		params: QueryTransactionsByDatesParams = {}
	): Promise<IDatePaginated<ITransactionsWithUser>> => {
		return (await this.get("transactions/by-dates", { params })).data;
	};

	/**
	 * Paginates transactions by index cursor (docs include populated User).
	 * @param params - Query and pagination params
	 * @returns Index-paginated transactions with User relation
	 */
	get_by_index = async (
		params: QueryTransactionsByIndexParams = {}
	): Promise<IIndexPaginated<ITransactionsWithUser>> => {
		return (await this.get("transactions/by-index", { params })).data;
	};

	/**
	 * Returns one transaction by id with User relation populated.
	 * @param id - Transaction UUID
	 */
	find_by_id = async (id: string): Promise<ITransactionsWithUser> => {
		return (await this.get(`transactions/${id}`)).data;
	};
}
