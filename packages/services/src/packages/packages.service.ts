import { ApiService } from "@/utils";
import { AxiosInstance } from "axios";
import type {
	DURATION_PERIOD_ENUM,
	IPackage,
	IPagePaginated,
	PricingType,
	PRICING_TYPE_ENUM,
	SORT_TYPE_ENUM,
} from "@repo/types";

export type CreatePackageParams = {
	type: PRICING_TYPE_ENUM;
	pricings: PricingType[];
	title: string;
	description: string;
	features: string[];
	duration: number;
	duration_period: DURATION_PERIOD_ENUM;
	admin_id: string;
};

export type UpdatePackageParams = Partial<CreatePackageParams>;

export type QueryPackagesByPageParams = {
	pagination?: { page?: number; pick?: number; sort?: SORT_TYPE_ENUM };
	title?: string;
	description?: string;
	duration?: number;
	duration_period?: DURATION_PERIOD_ENUM;
	admin_id?: string;
	all?: boolean;
};

export class PackagesService extends ApiService {
	constructor(baseURL?: string | AxiosInstance) {
		super(baseURL ?? "");
	}

	/**
	 * Creates a package (admin only).
	 */
	add_package = async (body: CreatePackageParams): Promise<IPackage> => {
		return (await this.post("packages", body)).data;
	};

	/**
	 * Returns packages with page pagination (public).
	 */
	get_by_page = async (
		params: QueryPackagesByPageParams = {}
	): Promise<IPagePaginated<IPackage>> => {
		return (await this.get("packages", { params })).data;
	};

	/**
	 * Updates a package by id (admin only).
	 */
	update = async (id: string, body: UpdatePackageParams): Promise<IPackage> => {
		return (await this.patch(`packages/${id}`, body)).data;
	};

	/**
	 * Deletes a package by id (admin only).
	 */
	remove = async (id: string): Promise<void> => {
		await this.delete(`packages/${id}`);
	};
}
