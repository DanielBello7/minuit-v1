import { AppTouchable } from "@/components/themed";
import { AVATARS } from "@/constants/assets";
import { COLORS } from "@/constants/themes/colors";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

const SIZE = 40;
const RADIUS = SIZE / 2;

type Props = {
  img?: string | null;
};
export const DP = (props: Props) => {
  const router = useRouter();

  const press = () => {
    return router.navigate("/(main)/(tabs)/account");
  };

  return (
    <View style={styles.shadow}>
      <AppTouchable
        style={styles.circle}
        onPress={press}
      >
        <Image
          source={props.img}
          style={styles.img}
          placeholder={AVATARS.avatar_01}
          contentFit="cover"
          contentPosition={"center"}
          placeholderContentFit="contain"
        />
      </AppTouchable>
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
    borderRadius: 999,
  },
});
