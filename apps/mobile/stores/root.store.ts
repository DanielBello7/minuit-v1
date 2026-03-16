import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RootData = {
	is_onboarded: boolean;
};

type State = {
	data: RootData;
	set_data: (params: Partial<RootData>) => void;
	reset: () => void;
};

const initial: RootData = {
	is_onboarded: false,
};

export const useRootStore = create<State>()(
	persist(
		(set, get) => ({
			data: initial,
			reset() {
				set({
					data: initial,
				});
			},
			set_data(param) {
				const now = get().data;
				set({ data: { ...now, ...param } });
			},
		}),
		{
			name: "minuit-root-storage",
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
);
