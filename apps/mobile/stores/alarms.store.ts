import { combine, deduct, modify_members } from "@repo/libs";
import { IAlarm } from "@repo/types";
import { create } from "zustand";

type AlarmData = {
	alarms: IAlarm[];
};

type State = {
	data: AlarmData;
	set_data: (params: Partial<IAlarm>) => void;
	reset: () => void;
	insert_alarms: (params: IAlarm[]) => void;
	remove_alarms: (ids: string[]) => void;
	update_alarms: (ids: string[], body: Partial<IAlarm>) => void;
};

const initial: AlarmData = {
	alarms: [],
};

export const useAlarmStore = create<State>()((set, get) => ({
	data: initial,
	reset() {
		set({
			data: initial,
		});
	},
	set_data(params) {
		const now = get().data;
		set({
			data: {
				...now,
				...params,
			},
		});
	},
	insert_alarms(params) {
		const now = get().data;
		const updates = combine<IAlarm>("id", now.alarms, params);
		set({
			data: {
				...now,
				alarms: updates,
			},
		});
	},
	remove_alarms(ids) {
		const now = get().data;
		const updates = deduct<IAlarm, "id">("id", now.alarms, ids);
		set({
			data: {
				...now,
				alarms: updates,
			},
		});
	},
	update_alarms(ids, updates) {
		const now = get().data;
		const updated = modify_members<IAlarm, "id">(
			"id",
			now.alarms,
			ids,
			updates
		);
		set({
			data: {
				...now,
				alarms: updated,
			},
		});
	},
}));
