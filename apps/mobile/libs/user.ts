import { useUserStore } from "@/stores";
import { IUserSerialized } from "@repo/types";

export class User {
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
