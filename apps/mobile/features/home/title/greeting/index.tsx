import { InterText } from "@/components/themed";
import { StyleSheet, View } from "react-native";
import { DP } from "./dp";

export const Greeting = () => {
  return (
    <View style={styles.box}>
      <DP />
      <View style={styles.textbox}>
        <InterText
          style={styles.title}
          type="title"
        >
          Hi, User
        </InterText>
        <InterText
          style={styles.sub}
          type="subtitle"
        >
          Good Evening
        </InterText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 20,
  },
  sub: {
    fontSize: 13,
    lineHeight: 16,
  },
  textbox: {
    gap: 0,
  },
});
