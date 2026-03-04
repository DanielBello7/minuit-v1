import { ApiService } from "@/utils";
import { AxiosInstance } from "axios";
import type { IUserSerialized } from "@repo/types";

export type SigninResponse = {
	token: string;
	refresh: string;
	user: IUserSerialized;
	expires: Date;
};

export type SigninPasswordParams = {
	username: string;
	password: string;
};

export type SigninEmailDto = {
	email: string;
};

export type SigninOtpDto = {
	email: string;
	otp: string;
};

export type RefreshDto = {
	email: string;
	refresh: string;
};

export type EmailDto = {
	email: string;
};

export type ValidateVerifyOtpDto = {
	email: string;
	otp: string;
};

export type RecoverDto = {
	email: string;
	otp: string;
	password: string;
};

export type SigninVerifyResponse = {
	type: "PASSWORD" | "OTP";
	display_name: string;
};

export class AuthService extends ApiService {
	constructor(baseURL?: string | AxiosInstance) {
		super(baseURL ? baseURL : "");
	}

	/**
	 * Signs in with password (requires PassportLocalGuard)
	 * @returns Signin response with token, refresh, and user data
	 */
	sign_in_password = async (
		params: SigninPasswordParams
	): Promise<SigninResponse> => {
		return (await this.post("auth/signin/password", params)).data;
	};

	/**
	 * Signs out the current user (requires JwtGuard)
	 * @returns User data
	 */
	sign_out = async (): Promise<IUserSerialized> => {
		return (await this.post("auth/signout", {})).data;
	};

	/**
	 * Gets current user information (requires JwtGuard)
	 * @returns User data
	 */
	whoami = async (): Promise<IUserSerialized> => {
		return (await this.get("auth/whoami")).data;
	};

	/**
	 * Refreshes authentication tokens
	 * @param data - Refresh token and email
	 * @returns New signin response with updated tokens
	 */
	refresh = async (data: RefreshDto): Promise<SigninResponse> => {
		return (await this.post("auth/refresh", data)).data;
	};

	/**
	 * Verifies email for signin and returns authentication type
	 * @param data - Email address
	 * @returns Authentication type (PASSWORD or OTP) and display name
	 */
	signin_verify = async (
		data: SigninEmailDto
	): Promise<SigninVerifyResponse> => {
		return (await this.post("auth/signin/verify", data)).data;
	};

	/**
	 * Signs in with OTP
	 * @param data - Email and OTP code
	 * @returns Signin response with token, refresh, and user data
	 */
	signin_otp = async (data: SigninOtpDto): Promise<SigninResponse> => {
		return (await this.post("auth/signin/otp", data)).data;
	};

	/**
	 * Verifies email for password recovery
	 * @param data - Email address
	 * @returns Success boolean
	 */
	recovery_verify = async (data: EmailDto): Promise<boolean> => {
		return (await this.post("auth/recover/verify", data)).data;
	};

	/**
	 * Validates recovery OTP (email + OTP code)
	 * @param data - Email and OTP code
	 * @returns true if OTP is valid for recovery
	 */
	recovery_validate_otp = async (
		data: ValidateVerifyOtpDto
	): Promise<boolean> => {
		return (await this.post("auth/recover/validate", data)).data;
	};

	/**
	 * Recovers account password
	 * @param data - Email, OTP, and new password
	 * @returns Updated user data
	 */
	recover = async (data: RecoverDto): Promise<IUserSerialized> => {
		return (await this.post("auth/recover/password", data)).data;
	};
}
