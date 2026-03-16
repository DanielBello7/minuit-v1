import { ApiService } from "@/utils";
import { AxiosInstance } from "axios";
import type {
	IAlarm,
	IAlarmWithUser,
	IPagePaginated,
	OneTimeRingAt,
	SORT_TYPE_ENUM,
	WeeklyRingAt,
} from "@repo/types";

export type InsertAlarmParams = {
	user_id: string;
	ring_at: (WeeklyRingAt | OneTimeRingAt)[];
	city: string;
	country: string;
	region: string;
	timezone: string;
};

export type UpdateAlarmParams = Partial<
	InsertAlarmParams & { is_active: boolean }
>;

export type QueryAlarmsByPageParams = {
	pagination?: { page?: number; pick?: number; sort?: SORT_TYPE_ENUM };
	user_id?: string;
	is_active?: boolean;
	city?: string;
	country?: string;
	region?: string;
	timezone?: string;
};

export class AlarmsService extends ApiService {
	constructor(baseURL?: string | AxiosInstance) {
		super(baseURL ?? "");
	}

	/**
	 * Returns one alarm by id with User relation populated.
	 */
	find_by_id = async (id: string): Promise<IAlarmWithUser> => {
		return (await this.get(`alarms/${id}`)).data;
	};

	/**
	 * Creates an alarm (returns alarm with User relation populated).
	 */
	create = async (body: InsertAlarmParams): Promise<IAlarmWithUser> => {
		return (await this.post("alarms", body)).data;
	};

	/**
	 * Returns alarms with page pagination (docs do not include User relation).
	 */
	get_by_page = async (
		params: QueryAlarmsByPageParams = {}
	): Promise<IPagePaginated<IAlarm>> => {
		return (await this.get("alarms/by-page", { params })).data;
	};

	/**
	 * Updates an alarm by id (returns alarm with User relation populated).
	 */
	update = async (
		id: string,
		body: UpdateAlarmParams
	): Promise<IAlarmWithUser> => {
		return (await this.patch(`alarms/${id}`, body)).data;
	};

	/**
	 * Deletes an alarm by id.
	 */
	remove = async (id: string): Promise<void> => {
		await this.delete(`alarms/${id}`);
	};
}
