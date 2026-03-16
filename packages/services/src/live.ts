import { AxiosInstance } from "axios";
import { ApiService } from "./utils/api";
import { AuthService } from "./auth/auth.service";
import { SubsService } from "./subs/subs.service";
import { TransactionsService } from "./transactions/transactions.service";
import { SettingsService } from "./settings/settings.service";
import { PackagesService } from "./packages/packages.service";
import { ClocksService } from "./clocks/clocks.service";
import { AlarmsService } from "./alarms/alarms.service";
import { UsersService } from "./users/users.service";
import { AdminsService } from "./admins/admins.service";
import { FeedbacksService } from "./feedbacks/feedbacks.service";
import { SignupService } from "./signup/signup.service";

const BASE_SERVER_URL = "http://localhost:3000";

export class LiveService extends ApiService {
	public readonly url: string = BASE_SERVER_URL;
	public readonly auth: AuthService;
	public readonly subs: SubsService;
	public readonly transactions: TransactionsService;
	public readonly settings: SettingsService;
	public readonly packages: PackagesService;
	public readonly clocks: ClocksService;
	public readonly alarms: AlarmsService;
	public readonly users: UsersService;
	public readonly admins: AdminsService;
	public readonly feedbacks: FeedbacksService;
	public readonly signup: SignupService;

	constructor(BASE_URL?: string | AxiosInstance) {
		const url = typeof BASE_URL === "string" ? BASE_URL : BASE_SERVER_URL;
		super(url);
		this.url = url;
		this.auth = new AuthService(this.axios_instance);
		this.subs = new SubsService(this.axios_instance);
		this.transactions = new TransactionsService(this.axios_instance);
		this.settings = new SettingsService(this.axios_instance);
		this.packages = new PackagesService(this.axios_instance);
		this.clocks = new ClocksService(this.axios_instance);
		this.alarms = new AlarmsService(this.axios_instance);
		this.users = new UsersService(this.axios_instance);
		this.admins = new AdminsService(this.axios_instance);
		this.feedbacks = new FeedbacksService(this.axios_instance);
		this.signup = new SignupService(this.axios_instance);
	}
}
