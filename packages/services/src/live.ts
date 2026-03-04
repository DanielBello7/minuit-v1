import { AxiosInstance } from "axios";
import { ApiService } from "./utils/api";
import { AuthService } from "./auth/auth.service";

const BASE_SERVER_URL = "http://localhost:3000";

export class LiveService extends ApiService {
	public readonly url: string = BASE_SERVER_URL;
	public readonly auth: AuthService;

	constructor(BASE_URL?: string | AxiosInstance) {
		const url = typeof BASE_URL === "string" ? BASE_URL : BASE_SERVER_URL;
		super(url);
		this.url = url;
		this.auth = new AuthService(this.axios_instance);
	}
}
