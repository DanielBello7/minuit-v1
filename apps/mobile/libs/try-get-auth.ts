import { useAuthStore } from "@/stores";
import { SigninResponse } from "@repo/services";

export const try_get_auth = (): SigninResponse => {
	const store = useAuthStore.getState().data;
	if (store.docs === undefined) throw new Error("not currently signed in");
	return store.docs;
};
