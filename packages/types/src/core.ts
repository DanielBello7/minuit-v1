import { ICommon } from "./common";
import type { IUserSerialized } from "./users";

export enum WEEKDAYS_ENUM {
	MONDAY = "MONDAY",
	TUESDAY = "TUESDAY",
	WEDNESDAY = "WEDNESDAY",
	THURSDAY = "THURSDAY",
	FRIDAY = "FRIDAY",
	SATURDAY = "SATURDAY",
	SUNDAY = "SUNDAY",
}

export enum SCHEDULE_TYPE {
	WEEKLY = "WEEKLY",
	ONE_TIME = "ONE_TIME",
}

export type WeeklyRingAt = {
	type: SCHEDULE_TYPE.WEEKLY;
	weekday: WEEKDAYS_ENUM;
	hour: number;
	minute: number;
	is_active: boolean;
};

export type OneTimeRingAt = {
	type: SCHEDULE_TYPE.ONE_TIME;
	date: string; // e.g. "2026-03-13"
	hour: number;
	minute: number;
	is_active: boolean;
};

export type RingAtType = WeeklyRingAt | OneTimeRingAt;

export type IAlarm = ICommon & {
	user_id: string;
	ring_at: RingAtType[];
	is_active: boolean;
	city: string;
	country: string;
	region: string;
	timezone: string;
};

/** Alarm document with populated User relation (API find_by_id, create, update). */
export type IAlarmWithUser = IAlarm & {
	User: IUserSerialized;
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
