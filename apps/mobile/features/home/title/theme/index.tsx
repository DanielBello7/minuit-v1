import Fontisto from "@expo/vector-icons/Fontisto";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";

import * as Animatable from "react-native-animatable";

import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet } from "react-native";
import { AppTouchable } from "@/components/themed";
import { useRef, useState } from "react";
import { sleep } from "@repo/libs";
import { useRootStore } from "@/stores";

type MODE = "light" | "dark" | "system";

export const Theme = () => {
  const [mode, setMode] = useState<MODE>("light");
  const [busy, setBusy] = useState(false);
  const color = useThemeColor("ACCENT_FOREGROUND");
  const border = useThemeColor("BUTTON_SECONDARY_BORDER_DARK");
  const control = useRef<Animatable.View>(null);
  const store = useRootStore((state) => state);

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
        setMode("dark");
        store.set_data({ mode: "dark", theme: "app" });
        return;
      }
      if (mode === "dark") {
        setMode("system");
        store.set_data({ theme: "system" });
        return;
      }

      setMode("light");
      store.set_data({
        theme: "app",
        mode: "light",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppTouchable
      style={[
        styles.box,
        { borderColor: border, opacity: busy ? 0.7 : 1 },
      ]}
      onPress={action}
      disabled={busy}
    >
      {mode === "light" && (
        <Animatable.View
          animation={animation}
          ref={control}
          duration={400}
        >
          <Fontisto
            name="day-sunny"
            color={color}
            size={18}
          />
        </Animatable.View>
      )}
      {mode === "dark" && (
        <Animatable.View
          animation={animation}
          ref={control}
          duration={400}
        >
          <MaterialIcons
            name="dark-mode"
            color={color}
            size={18}
          />
        </Animatable.View>
      )}
      {mode === "system" && (
        <Animatable.View
          animation={animation}
          ref={control}
          duration={400}
        >
          <Octicons
            name="device-mobile"
            color={color}
            size={18}
          />
        </Animatable.View>
      )}
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  box: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 999,
    overflow: "hidden",
  },
});
