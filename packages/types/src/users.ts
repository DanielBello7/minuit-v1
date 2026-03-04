import { ICommon } from "./common";

export enum AccountType {
	Client = "Client",
	Admins = "Admins",
}

export enum ADMIN_LEVEL_ENUM {
	MASTER = "MASTER",
	RESIDENT = "RESIDENT",
}

export type IAdmin = ICommon & {
	user_id: string;
	level: ADMIN_LEVEL_ENUM;
};

export type IUser = ICommon & {
	firstname: string;
	surname: string;
	email: string;
	password: string | undefined;
	avatar: string | undefined;
	timezone: string;
	username: string;
	display_name: string;
	type: AccountType;
	is_email_verified: boolean;
	has_password: boolean;
	refresh_token: string | undefined;
	last_login_date: Date | undefined;
	dark_mode: boolean;
	is_onboarded: boolean;
};

/** API response shape: IUser with @Exclude() fields (id, deleted_at, password) omitted */
export type IUserSerialized = Omit<IUser, "deleted_at" | "password">;
