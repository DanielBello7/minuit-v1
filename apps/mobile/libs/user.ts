import { useUserStore } from "@/stores";
import { IUserSerialized } from "@repo/types";

export class User {
  get timezone() {
    const home_tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return home_tz;
  }

  get city() {
    const tz = this.timezone;
    const city = tz.split("/").at(-1) ?? "";
    return city.replace(/_/g, " ");
  }

  get values(): IUserSerialized | null {
    return useUserStore.getState().data.user;
  }

  get valueUnsafe(): IUserSerialized {
    const user = this.values;
    if (user === null) {
      throw new Error("User not available");
    }
    return user;
  }
}
