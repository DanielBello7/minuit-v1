import { InterText } from "@/components/themed";
import { StyleSheet, View } from "react-native";

export const Head = () => {
  return (
    <View style={styles.head}>
      <InterText style={styles.text}>Account</InterText>
    </View>
  );
};

const styles = StyleSheet.create({
  head: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  text: {
    fontSize: 25,
    fontWeight: "600",
  },
});
