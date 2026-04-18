import { InterText } from "@/components/themed";
import { COLORS } from "@/constants/themes/colors";
import { useThemeColor } from "@/hooks/use-theme-color";
import { with_alpha } from "@/libs/with-alpha";
import { FontAwesome5 } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

export const Footer = () => {
  const color = useThemeColor("MUTED_FOREGROUND");
  return (
    <View style={styles.footer}>
      <View style={styles.tz}>
        <FontAwesome5
          name="globe-africa"
          color={COLORS.PINK}
          size={14}
        />
        <InterText style={styles.info}>America</InterText>
      </View>
      <InterText style={[styles.city, { color }]}>New York</InterText>
    </View>
  );
};

const styles = StyleSheet.create({
  city: {
    fontSize: 12,
    fontWeight: "600",
  },
  info: {
    fontSize: 12,
    color: COLORS.PINK,
  },
  tz: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
    backgroundColor: with_alpha(COLORS.PINK, 0.1),
  },
  footer: {
    width: "100%",
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
});
