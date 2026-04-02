import Fontisto from "@expo/vector-icons/Fontisto";

import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";
import { AppTouchable } from "@/components/themed";

export const Theme = () => {
  const color = useThemeColor("ACCENT_FOREGROUND");
  return (
    <AppTouchable>
      <View style={[styles.box, { borderColor: "rgba(0,0,0,0.4)" }]}>
        <Fontisto
          name="day-sunny"
          color={color}
          size={18}
        />
      </View>
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  box: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 999,
  },
});
