import { useSonnerStore } from "./use-sonner.store";

export const sonner = {
  alert: (msg: string, title?: string) => {
    const toast = useSonnerStore.getState();
    toast.set_data({
      state: "alert",
      title,
      msg,
    });
    toast.show();
  },
  error: (msg: string, title?: string) => {
    const toast = useSonnerStore.getState();
    toast.set_data({
      state: "error",
      title,
      msg,
    });
    toast.show();
  },
  success: (msg: string, title?: string) => {
    const toast = useSonnerStore.getState();
    toast.set_data({
      state: "success",
      title,
      msg,
    });
    toast.show();
  },
};
