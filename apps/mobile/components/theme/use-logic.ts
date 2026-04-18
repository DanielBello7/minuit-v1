import * as Animatable from "react-native-animatable";
import { useRef, useState } from "react";
import { sleep } from "@repo/libs";

import { useThemeColor } from "@/hooks/use-theme-color";
import { useRootStore } from "@/stores";

type MODE = "light" | "dark" | "system";

export const useLogic = () => {
  const [busy, setBusy] = useState(false);
  const color = useThemeColor("ACCENT_FOREGROUND");
  const border = useThemeColor("SIDEBAR_BORDER");
  const control = useRef<Animatable.View>(null);
  const store = useRootStore((state) => state);
  const mode: MODE =
    store.data.theme === "system" ? "system" : store.data.mode;

  const animation = {
    from: {
      top: -3,
      opacity: 0.3,
    },
    to: { top: 0, opacity: 1 },
  };

  const action = async () => {
    if (busy) return;
    setBusy(true);

    try {
      control.current?.animate?.({
        from: {
          top: 0,
          opacity: 1,
        },
        to: {
          top: 3,
          opacity: 0.3,
        },
      });

      await sleep(0.3);

      if (mode === "light") {
        store.set_data({ mode: "dark", theme: "app" });
        return;
      }
      if (mode === "dark") {
        store.set_data({ theme: "system" });
        return;
      }

      store.set_data({
        theme: "app",
        mode: "light",
      });
    } finally {
      setBusy(false);
    }
  };

  return {
    mode,
    busy,
    color,
    border,
    control,
    animation,
    action,
  };
};
