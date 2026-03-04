import { ICommon } from "./common";

export type IFeedback = ICommon & {
	user_id?: string;
	name: string;
	message: string;
	rating: number; // app rating
};
