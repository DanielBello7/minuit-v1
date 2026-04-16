import { StyleSheet, useColorScheme, View } from "react-native";
import { COLORS } from "@/constants/themes/colors";
import { with_alpha } from "@/libs/with-alpha";
import Feather from "@expo/vector-icons/Feather";

export const Icon = () => {
  const scheme = useColorScheme();
  return (
    <View
      style={[
        styles.icon,
        {
          backgroundColor: with_alpha(
            COLORS.PINK,
            scheme === "light" ? 0.1 : 0.3,
          ),
        },
      ]}
    >
      <Feather
        name="lock"
        color={COLORS.PINK}
        size={24}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 48,
    height: 48,
    borderRadius: 999,
    borderColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
});
