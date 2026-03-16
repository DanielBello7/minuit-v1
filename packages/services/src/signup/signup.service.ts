import { ApiService } from "@/utils";
import { AxiosInstance } from "axios";
import type { IUserSerialized } from "@repo/types";

export type VerifyUserEmailParams = {
	email: string;
	otp: string;
};

export type SendVerifyOtpParams = {
	email: string;
};

export type SetAvatarParams = {
	value: string;
	user_id: string;
};

/** Signup user body (shape aligned with CreateUserDto). */
export type SignupUserParams = {
	firstname: string;
	surname: string;
	email: string;
	password?: string;
	avatar?: string;
	timezone: string;
	username: string;
	display_name: string;
	is_email_verified?: boolean;
	has_password?: boolean;
	dark_mode?: boolean;
	is_onboarded?: boolean;
};

/** Signup admin body (same shape as user + type). */
export type SignupAdminParams = SignupUserParams & {
	type: "Admins";
};

export class SignupService extends ApiService {
	constructor(baseURL?: string | AxiosInstance) {
		super(baseURL ?? "");
	}

	/**
	 * Registers a new user.
	 */
	signup_user = async (body: SignupUserParams): Promise<IUserSerialized> => {
		return (await this.post("signup/signup/users", body)).data;
	};

	/**
	 * Registers a new admin (requires JWT).
	 */
	signup_admin = async (body: SignupAdminParams): Promise<IUserSerialized> => {
		return (await this.post("signup/signup/admin", body)).data;
	};

	/**
	 * Verifies user email with OTP (and signs in).
	 */
	verify_user_email = async (
		body: VerifyUserEmailParams
	): Promise<IUserSerialized> => {
		return (await this.post("signup/verify", body)).data;
	};

	/**
	 * Verifies user email with OTP without signing in.
	 */
	verify_user_email_safe = async (
		body: VerifyUserEmailParams
	): Promise<IUserSerialized> => {
		return (await this.post("signup/verify/safe", body)).data;
	};

	/**
	 * Sends OTP to email for verification.
	 */
	send_verify_otp = async (body: SendVerifyOtpParams): Promise<void> => {
		await this.post("signup/verify/otp", body);
	};

	/**
	 * Sets user avatar.
	 */
	set_user_avatar = async (body: SetAvatarParams): Promise<IUserSerialized> => {
		return (await this.post("signup/set-avatar", body)).data;
	};
}
