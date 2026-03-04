import { ICommon } from "./common";

export enum WEEKDAYS_ENUM {
	MONDAY = "MONDAY",
	TUESDAY = "TUESDAY",
	WEDNESDAY = "WEDNESDAY",
	THURSDAY = "THURSDAY",
	FRIDAY = "FRIDAY",
	SATURDAY = "SATURDAY",
	SUNDAY = "SUNDAY",
}

export enum REPEAT_TYPE_ENUM {
	FOREVER = "FOREVER",
}

export type RingAtType = {
	time: Date;
	human_format: string; // 10:00AM, 02:00PM, 11:56AM
	day: WEEKDAYS_ENUM;
	repeat: REPEAT_TYPE_ENUM.FOREVER | Date;
	is_active: boolean;
};

export type IAlarm = ICommon & {
	user_id: string;
	ring_at: REPEAT_TYPE_ENUM[];
	is_active: boolean;
	city: string;
	country: string;
	region: string;
	timezone: string;
};

export enum CLOCK_FORMAT {
	DIGITAL = "DIGITAL",
	ANALOG = "ANALOG",
}

export type IClock = ICommon & {
	user_id: string;
	city: string;
	region: string;
	country: string;
	timezone: string;
	format: CLOCK_FORMAT;
	is_active: boolean;
	title?: string;
	description?: string;
	theme?: string;
};
