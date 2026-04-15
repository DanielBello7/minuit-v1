import { ThemedView } from "@/components/themed";
import { StyleSheet } from "react-native";

export const Alarm = () => {
  return <ThemedView style={styles.box}></ThemedView>;
};

const styles = StyleSheet.create({
  box: {
    width: "100%",
  },
});
