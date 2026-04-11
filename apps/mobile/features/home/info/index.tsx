import Feather from "@expo/vector-icons/Feather";

import { COLORS } from "@/constants/themes/colors";
import { StyleSheet, View } from "react-native";
import { InterText } from "@/components/themed";
import { AddBtn } from "./add-btn";

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

      <AddBtn />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  box: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title_text: {
    fontWeight: "600",
  },
});
