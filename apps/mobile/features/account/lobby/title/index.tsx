import { StyleSheet, View } from "react-native";
import { Avatar } from "./avatar";
import { Name } from "./name";

export const Title = () => {
  return (
    <View style={styles.main}>
      <Avatar />
      <Name />
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    width: "100%",
    marginTop: 30,
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
