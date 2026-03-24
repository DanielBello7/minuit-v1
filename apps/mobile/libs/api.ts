import { ENVS } from "@/constants/env";
import { LiveService } from "@repo/services";
import { axios_interceptor } from "./interceptor";

const api = new LiveService(ENVS.API_ADDRESS);
axios_interceptor(api.axios_instance);

export { api };
