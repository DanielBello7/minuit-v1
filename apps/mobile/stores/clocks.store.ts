import { combine, deduct, modify_members } from "@repo/libs";
import { IClock } from "@repo/types";
import { create } from "zustand";

type ClockData = {
	clocks: IClock[];
};

type State = {
	data: ClockData;
	set_data: (params: Partial<IClock>) => void;
	reset: () => void;
	insert_clocks: (params: IClock[]) => void;
	remove_clocks: (ids: string[]) => void;
	update_clocks: (ids: string[], body: Partial<IClock>) => void;
};

const initial: ClockData = {
	clocks: [],
};

export const useClockStore = create<State>()((set, get) => ({
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
	insert_clocks(params) {
		const now = get().data;
		const updates = combine<IClock>("id", now.clocks, params);
		set({
			data: {
				...now,
				clocks: updates,
			},
		});
	},
	remove_clocks(ids) {
		const now = get().data;
		const updates = deduct<IClock, "id">("id", now.clocks, ids);
		set({
			data: {
				...now,
				clocks: updates,
			},
		});
	},
	update_clocks(ids, updates) {
		const now = get().data;
		const updated = modify_members<IClock, "id">(
			"id",
			now.clocks,
			ids,
			updates
		);
		set({
			data: {
				...now,
				clocks: updated,
			},
		});
	},
}));
