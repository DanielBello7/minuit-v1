export type ICommon = {
	id: string;
	index: number;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | undefined;
};

/** API response shape: ICommon with @Exclude() fields (id, deleted_at) omitted */
export type ICommonSerialized = Omit<ICommon, "deleted_at">;

export type IPagePaginated<T> = {
	docs: T[];
	total_docs: number;
	pick: number;
	page: number;
	total_pages: number;
	has_next_page: boolean;
	next_page: number | null;
	has_prev_page: boolean;
	prev_page: number | null;
	paging_counter: number;
};

export type IDatePaginated<T> = {
	docs: T[];
	pick: number;
	has_next_page: boolean;
	has_prev_page: boolean;
	next_page: Date | null;
	prev_page: Date | null;
};

export type IIndexPaginated<T> = {
	docs: T[];
	has_next_page: boolean;
	has_prev_page: boolean;
	pick: number;
	next_page: number | null;
};

export type BaseOmit<T> = Omit<
	T,
	"id" | "created_at" | "updated_at" | "deleted_at" | "index"
>;

export type SORT_TYPE = "ASC" | "DESC";

export enum SORT_TYPE_ENUM {
	ASC = "ASC",
	DESC = "DESC",
}
