import { useAuthStore } from "@/stores";
import { AxiosInstance } from "axios";

export const axios_interceptor = (instance: AxiosInstance) => {
	instance.interceptors.request.use(
		async (config) => {
			const { data } = useAuthStore.getState();
			config.headers.Authorization = `Bearer ${data.docs?.token}`;
			return config;
		},
		(error) => Promise.reject(error)
	);
};
