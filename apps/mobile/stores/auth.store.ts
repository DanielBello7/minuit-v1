import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";
import { SigninResponse } from "@repo/services";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthData = {
	docs: SigninResponse | undefined;
};

type State = {
	data: AuthData;
	reset: () => void;
	sign_in: (params: SigninResponse) => void;
	signout: () => void;
	setdata: (params: Partial<AuthData> | null) => void;
};

const initial: AuthData = {
	docs: undefined,
};

export const useAuthStore = create<State>()(
	persist(
		(set, get) => ({
			data: initial,
			reset() {
				set({
					data: initial,
				});
			},
			setdata(params) {
				const now = get().data;
				set({
					data: {
						...now,
						...params,
					},
				});
			},
			sign_in(params) {
				const now = get().data;
				set({
					data: {
						...now,
						docs: params,
					},
				});
			},
			signout() {
				set({
					data: initial,
				});
			},
		}),
		{
			name: "minuit-auth-storage",
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
);
