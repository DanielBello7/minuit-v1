import { ApiService } from "@/utils";
import { AxiosInstance } from "axios";
import type {
	CurrencyCode,
	IActiveSubs,
	IIndexPaginated,
	ISubscription,
} from "@repo/types";

/** Params to initiate a paid subscription or get free package. */
export type InsertSubParams = {
	user_id: string;
	package_id: string;
	currency_code: CurrencyCode;
};

/** Hub (active sub) with User and Subscription relations populated. */
export type HubWithRelations = IActiveSubs & {
	User: import("@repo/types").IUserSerialized;
	Subscription: ISubscription;
};

/** Response from complete_subscription: transaction + hub with relations. */
export type CompleteSubscriptionResponse = {
	transaction: import("@repo/types").ITransactionsWithUser;
	subscription: HubWithRelations;
};

/** Body for completing a payment (transaction id + gateway ref). */
export type CompletePaymentParams = {
	id: string;
	gateway: string;
	method: string;
	ref_id: string;
};

export type QuerySubsByIndexParams = {
	pagination?: {
		index?: number;
		pick?: number;
		sort?: import("@repo/types").SORT_TYPE_ENUM;
	};
	transaction_id?: string;
	user_id?: string;
	package_id?: string;
	currency_code?: CurrencyCode;
	amount?: string;
	charge?: string;
	duration?: number;
	duration_period?: import("@repo/types").DURATION_PERIOD_ENUM;
	expires_at?: Date | string;
	last_used_at?: Date | string;
	used_at?: Date | string;
};

export class SubsService extends ApiService {
	constructor(baseURL?: string | AxiosInstance) {
		super(baseURL ?? "");
	}

	/**
	 * Initiates a paid subscription purchase (returns pending transaction).
	 */
	initiate_subscription = async (
		body: InsertSubParams
	): Promise<import("@repo/types").ITransactionsWithUser> => {
		return (await this.post("subs/initiate-subscription", body)).data;
	};

	/**
	 * Gets the free package (creates subscription without payment).
	 */
	get_free_package = async (
		body: InsertSubParams
	): Promise<CompleteSubscriptionResponse> => {
		return (await this.post("subs/get-free-package", body)).data;
	};

	/**
	 * Completes subscription after payment (creates subscription + hub).
	 */
	complete_subscription = async (
		body: CompletePaymentParams
	): Promise<CompleteSubscriptionResponse> => {
		return (await this.post("subs/complete-subscription", body)).data;
	};

	/**
	 * Returns subscriptions with index pagination.
	 */
	get_by_index = async (
		params: QuerySubsByIndexParams = {}
	): Promise<IIndexPaginated<ISubscription>> => {
		return (await this.get("subs/by-index", { params })).data;
	};

	/**
	 * Returns hub (active sub) for user with User and Subscription populated.
	 * @param userId - User UUID
	 */
	get_user_sub = async (userId: string): Promise<HubWithRelations> => {
		return (await this.get(`subs/users/${userId}`)).data;
	};

	/**
	 * Returns one subscription by id.
	 */
	get_subscription_by_id = async (id: string): Promise<ISubscription> => {
		return (await this.get(`subs/${id}`)).data;
	};
}
