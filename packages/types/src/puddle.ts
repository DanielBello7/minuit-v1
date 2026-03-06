import { ICommon } from "./common";

export type IFeedback = ICommon & {
	user_id?: string;
	name: string;
	message: string;
	rating: number; // app rating
};

export type ISettings = ICommon & {
	version: string;
	max_free_alarms: number;
	max_free_clocks: number;
};
