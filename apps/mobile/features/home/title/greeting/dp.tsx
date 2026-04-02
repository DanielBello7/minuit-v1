import { AVATARS } from "@/constants/assets";
import { COLORS } from "@/constants/themes/colors";
import { Image } from "expo-image";
import { Platform, StyleSheet, View } from "react-native";

const SIZE = 40;
const RADIUS = SIZE / 2;

export const DP = () => {
  return (
    <View style={styles.shadow}>
      <View style={styles.circle}>
        <Image
          source={AVATARS.avatar_01}
          style={styles.img}
          contentFit="cover"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    width: SIZE,
    height: SIZE,
    borderRadius: RADIUS,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 5,
      },
    }),
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: RADIUS,
    overflow: "hidden",
    borderWidth: 1,
    padding: 4,
    borderColor: "rgba(0, 0, 0, 0.5)",
  },
  img: {
    width: "100%",
    height: "100%",
  },
});
