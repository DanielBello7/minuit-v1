import { ApiService } from "@/utils";
import { AxiosInstance } from "axios";
import type {
	IUserSerialized,
	IPagePaginated,
	SORT_TYPE_ENUM,
} from "@repo/types";

export type UpdateUserParams = Partial<{
	firstname: string;
	surname: string;
	email: string;
	avatar: string;
	timezone: string;
	username: string;
	display_name: string;
	dark_mode: boolean;
	is_onboarded: boolean;
}>;

export type SearchUsersParams = {
	value: string;
	pagination?: { page?: number; pick?: number; sort?: SORT_TYPE_ENUM };
};

export type SetPasswordParams = {
	id: string;
	new_password: string;
};

export type UpdatePasswordParams = {
	old_password: string;
	new_password: string;
};

export type UserStatusResponse = {
	has_password: boolean;
	is_email_verified: boolean;
	is_onboarded: boolean;
};

export class UsersService extends ApiService {
	constructor(baseURL?: string | AxiosInstance) {
		super(baseURL ?? "");
	}

	/**
	 * Updates a user by id.
	 */
	update_user = async (
		id: string,
		body: UpdateUserParams
	): Promise<IUserSerialized> => {
		return (await this.patch(`users/${id}`, body)).data;
	};

	/**
	 * Searches users by email (query param value).
	 */
	search_users = async (
		params: SearchUsersParams
	): Promise<IPagePaginated<IUserSerialized>> => {
		return (await this.get("users/search", { params })).data;
	};

	/**
	 * Returns a user by email.
	 */
	get_user_by_email = async (email: string): Promise<IUserSerialized> => {
		return (await this.get(`users/email/${encodeURIComponent(email)}`)).data;
	};

	/**
	 * Returns a user by id.
	 */
	get_user_by_id = async (id: string): Promise<IUserSerialized> => {
		return (await this.get(`users/${id}`)).data;
	};

	/**
	 * Returns user status by id (public).
	 */
	get_user_status = async (id: string): Promise<UserStatusResponse> => {
		return (await this.get(`users/${id}/status`)).data;
	};

	/**
	 * Sets password for a user (by id in body).
	 */
	set_password = async (body: SetPasswordParams): Promise<IUserSerialized> => {
		return (await this.post("users/password", body)).data;
	};

	/**
	 * Updates password for a user by id.
	 */
	update_password = async (
		id: string,
		body: UpdatePasswordParams
	): Promise<IUserSerialized> => {
		return (await this.patch(`users/${id}/password`, body)).data;
	};
}
