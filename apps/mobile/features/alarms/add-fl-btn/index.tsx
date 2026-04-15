import AntDesign from "@expo/vector-icons/AntDesign";

import { AppTouchable } from "@/components/themed";
import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/themes/colors";
import { useRouter } from "expo-router";

export const FloatingAddBtn = () => {
  const router = useRouter();

  const press = () => {
    return router.navigate("/(main)/(tabs)/alarms/add-alarms");
  };

  return (
    <AppTouchable
      style={styles.box}
      onPress={press}
    >
      <AntDesign
        color="white"
        name="plus"
        size={16}
      />
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  box: {
    position: "absolute",
    bottom: 100,
    right: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    borderRadius: 999,
    backgroundColor: COLORS.PINK,
  },
});
