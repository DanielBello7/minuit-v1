import { ApiService } from "@/utils";
import { AxiosInstance } from "axios";
import type { IAdminWithUser } from "@repo/types";

export class AdminsService extends ApiService {
	constructor(baseURL?: string | AxiosInstance) {
		super(baseURL ?? "");
	}

	/**
	 * Returns one admin by id with User relation populated.
	 * @param id - Admin UUID
	 */
	find_by_id = async (id: string): Promise<IAdminWithUser> => {
		return (await this.get(`admins/${id}`)).data;
	};
}
