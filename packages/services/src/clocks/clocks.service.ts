import { ApiService } from "@/utils";
import { AxiosInstance } from "axios";
import type {
	CLOCK_FORMAT,
	IClock,
	IPagePaginated,
	SORT_TYPE_ENUM,
} from "@repo/types";

export type InsertClockParams = {
	user_id: string;
	city: string;
	region: string;
	country: string;
	timezone: string;
	format: CLOCK_FORMAT;
	title?: string;
	description?: string;
	theme?: string;
};

export type UpdateClockParams = Partial<
	InsertClockParams & { is_active: boolean }
>;

export type QueryClocksByPageParams = {
	pagination?: { page?: number; pick?: number; sort?: SORT_TYPE_ENUM };
	user_id?: string;
	city?: string;
	region?: string;
	country?: string;
	timezone?: string;
	format?: CLOCK_FORMAT;
	is_active?: boolean;
	title?: string;
	theme?: string;
};

export class ClocksService extends ApiService {
	constructor(baseURL?: string | AxiosInstance) {
		super(baseURL ?? "");
	}

	/**
	 * Creates a clock.
	 */
	create = async (body: InsertClockParams): Promise<IClock> => {
		return (await this.post("clocks", body)).data;
	};

	/**
	 * Returns clocks with page pagination.
	 */
	get_by_page = async (
		params: QueryClocksByPageParams = {}
	): Promise<IPagePaginated<IClock>> => {
		return (await this.get("clocks/by-page", { params })).data;
	};

	/**
	 * Updates a clock by id.
	 */
	update = async (id: string, body: UpdateClockParams): Promise<IClock> => {
		return (await this.patch(`clocks/${id}`, body)).data;
	};

	/**
	 * Deletes a clock by id.
	 */
	remove = async (id: string): Promise<void> => {
		await this.delete(`clocks/${id}`);
	};
}
