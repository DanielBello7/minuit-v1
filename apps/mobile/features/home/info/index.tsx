import Feather from "@expo/vector-icons/Feather";

import { COLORS } from "@/constants/themes/colors";
import { StyleSheet, View } from "react-native";
import { AppTouchable, InterText } from "@/components/themed";

export const Info = () => {
  return (
    <View style={styles.box}>
      <View style={styles.title}>
        <Feather
          size={16}
          name="globe"
          color={COLORS.PINK}
        />
        <InterText style={styles.title_text}>Locations</InterText>
      </View>

      <AppTouchable style={styles.add}>
        <Feather
          name="plus"
          color={COLORS.PINK}
          size={16}
        />
        <InterText style={styles.add_text}>Add</InterText>
      </AppTouchable>
    </View>
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
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  box: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  title_text: {
    fontWeight: "600",
  },
});
