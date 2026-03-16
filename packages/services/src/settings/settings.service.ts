import { ApiService } from "@/utils";
import { AxiosInstance } from "axios";
import type { ISettings } from "@repo/types";

export type UpdateSettingsParams = Partial<{
	version: string;
	max_free_alarms: number;
	max_free_clocks: number;
	currencies: Array<{
		name: string;
		code: string;
		symbol: string;
		numeric_code?: string;
	}>;
	charges: {
		PAYMENT: Array<{ currency_code: string; amount: string }>;
		REFUNDS: Array<{ currency_code: string; amount: string }>;
	};
	transaction_expiry_hours: number;
}>;

export class SettingsService extends ApiService {
	constructor(baseURL?: string | AxiosInstance) {
		super(baseURL ?? "");
	}

	/**
	 * Returns current settings.
	 */
	get_settings = async (): Promise<ISettings> => {
		return (await this.get("settings")).data;
	};

	/**
	 * Updates settings (admin only).
	 * @param body - Partial settings to update
	 */
	update_settings = async (body: UpdateSettingsParams): Promise<ISettings> => {
		return (await this.patch("settings", body)).data;
	};
}
