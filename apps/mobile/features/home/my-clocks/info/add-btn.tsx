import { StyleSheet } from "react-native";
import { AppTouchable, InterText } from "@/components/themed";
import { COLORS } from "@/constants/themes/colors";
import { useRouter } from "expo-router";

import Feather from "@expo/vector-icons/Feather";

export const AddBtn = () => {
  const router = useRouter();
  const press = () => {
    return router.navigate("/(main)/(tabs)/home/add-clock");
  };
  return (
    <AppTouchable
      style={styles.add}
      onPress={press}
    >
      <Feather
        name="plus"
        color={COLORS.PINK}
        size={16}
      />
      <InterText style={styles.add_text}>Add</InterText>
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  add_text: {
    color: COLORS.PINK,
    fontWeight: "600",
    fontSize: 15,
  },
  add: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
