import Feather from "@expo/vector-icons/Feather";

import { AppTouchable, ThemedView } from "@/components/themed";
import { AVATARS } from "@/constants/assets";
import { useThemeColor } from "@/hooks/use-theme-color";
import { User } from "@/libs/user";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { COLORS } from "@/constants/themes/colors";

export const Avatar = () => {
  const bg = useThemeColor("CARD");
  const border = useThemeColor("SIDEBAR_BORDER");
  const user = new User();
  const router = useRouter();

  const press = () => {
    return router.push("/");
  };

  return (
    <AppTouchable onPress={press}>
      <ThemedView
        style={[
          styles.box,
          styles.shadow,
          {
            backgroundColor: bg,
            borderColor: border,
          },
        ]}
      >
        <Image
          placeholder={AVATARS.avatar_08}
          placeholderContentFit="contain"
          source={user.values?.avatar}
          style={styles.img}
          contentFit="contain"
          contentPosition={"center"}
        />

        <View style={styles.icon}>
          <Feather
            name="camera"
            color={"white"}
            size={14}
          />
        </View>
      </ThemedView>
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
    }),
  },
  box: {
    borderRadius: 99,
    padding: 10,
    position: "relative",
    borderWidth: 0.4,
    alignSelf: "flex-start",
  },
  img: {
    width: 50,
    height: 50,
    borderRadius: 99,
    borderWidth: 0.3,
  },
  icon: {
    width: 28,
    height: 28,
    backgroundColor: COLORS.PINK,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 99,
    position: "absolute",
    bottom: 0,
    right: 0,
  },
});
