import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PermissionsData = {
	hasLocationPermission: boolean;
};

type State = {
	data: PermissionsData;
	set_data: (params: Partial<PermissionsData>) => void;
	reset: () => void;
};

const initial: PermissionsData = {
	hasLocationPermission: false,
};

export const usePermissionsStore = create<State>()(
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
			name: "minuit-permissions-storage",
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
);
