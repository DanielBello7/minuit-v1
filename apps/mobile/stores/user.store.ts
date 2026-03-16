import { createJSONStorage, persist } from "zustand/middleware";
import { IUserSerialized } from "@repo/types";
import { create } from "zustand";
import { modify } from "@repo/libs";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserData = {
	user: IUserSerialized | null;
};

type State = {
	data: UserData;
	reset: () => void;
	update_user: (params: Partial<IUserSerialized>) => void;
	set_data: (params: Partial<UserData>) => void;
};

const initial: UserData = {
	user: null,
};

export const useUserStore = create<State>()(
	persist(
		(set, get) => ({
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
			update_user(params) {
				const now = get().data;
				const updates = now.user ? modify(now.user, params) : null;
				set({
					data: {
						...now,
						user: updates,
					},
				});
			},
		}),
		{
			name: "minuit-account-storage",
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
);
