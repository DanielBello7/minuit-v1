import { useUserStore } from "@/stores";
import { IUserSerialized } from "@repo/types";

export const try_get_user = (): IUserSerialized => {
	const store = useUserStore.getState().data;
	if (store.user === null) throw new Error("User not available");
	return store.user;
};
