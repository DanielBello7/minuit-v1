import { ApiService } from "@/utils";
import { AxiosInstance } from "axios";
import type {
	IDatePaginated,
	IIndexPaginated,
	IFeedback,
	SORT_TYPE_ENUM,
} from "@repo/types";

export type CreateFeedbackParams = {
	user_id?: string;
	name: string;
	message: string;
	rating: number;
};

export type QueryFeedbacksByDatesParams = {
	pagination?: { date?: Date | string; pick?: number; sort?: SORT_TYPE_ENUM };
	user_id?: string;
	name?: string;
	message?: string;
	rating?: number;
};

export type QueryFeedbacksByIndexParams = {
	pagination?: { index?: number; pick?: number; sort?: SORT_TYPE_ENUM };
	user_id?: string;
	name?: string;
	message?: string;
	rating?: number;
};

export class FeedbacksService extends ApiService {
	constructor(baseURL?: string | AxiosInstance) {
		super(baseURL ?? "");
	}

	/**
	 * Submits feedback (public).
	 */
	give_feedback = async (body: CreateFeedbackParams): Promise<IFeedback> => {
		return (await this.post("feedbacks", body)).data;
	};

	/**
	 * Returns feedbacks paginated by date (admin only).
	 */
	get_by_dates = async (
		params: QueryFeedbacksByDatesParams = {}
	): Promise<IDatePaginated<IFeedback>> => {
		return (await this.get("feedbacks/by-dates", { params })).data;
	};

	/**
	 * Returns feedbacks paginated by index (admin only).
	 */
	get_by_index = async (
		params: QueryFeedbacksByIndexParams = {}
	): Promise<IIndexPaginated<IFeedback>> => {
		return (await this.get("feedbacks/by-index", { params })).data;
	};
}
