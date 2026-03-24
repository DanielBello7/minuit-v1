import { ThemedSafeArea } from "@/components/themed";
import { StyleSheet, View } from "react-native";

export const Alarms = () => {
  return (
    <ThemedSafeArea>
      <View style={styles.box}></View>
    </ThemedSafeArea>
  );
};

const styles = StyleSheet.create({
  box: {
    flex: 1,
  },
});
