import Feather from "@expo/vector-icons/Feather";

import { AppTouchable, ThemedView } from "@/components/themed";
import { AVATARS } from "@/constants/assets";
import { useThemeColor } from "@/hooks/use-theme-color";
import { User } from "@/libs/user";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
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
          {
            backgroundColor: bg,
            borderColor: border,
          },
        ]}
      >
        <Image
          placeholder={AVATARS.avatar_00}
          source={user.values?.avatar}
          style={styles.img}
          contentFit="contain"
          contentPosition={"center"}
        />

        <View style={styles.icon}>
          <Feather
            name="camera"
            color={"white"}
            size={20}
          />
        </View>
      </ThemedView>
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  box: {
    borderRadius: 99,
    padding: 50,
    position: "relative",
    borderWidth: 1,
  },
  img: {
    width: 50,
    height: 50,
  },
  icon: {
    width: 20,
    height: 20,
    backgroundColor: COLORS.PINK,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 99,
    position: "absolute",
    bottom: 0,
    right: 0,
  },
});
