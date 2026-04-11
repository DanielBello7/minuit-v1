import { StyleSheet, View } from "react-native";
import { Greeting } from "./greeting";
import { Theme } from "./theme";

export const Title = () => {
  return (
    <View style={styles.box}>
      <Greeting />
      <Theme />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
});
