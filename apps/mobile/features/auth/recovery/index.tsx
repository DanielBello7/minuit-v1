import { ThemedSafeArea } from "@/components/themed";
import { StyleSheet, View } from "react-native";
import { useLogic } from "./use-logic";

export const Recovery = () => {
  const logic = useLogic();
  return (
    <ThemedSafeArea>
      <View style={styles.box}>{logic.screens.screen.component}</View>;
    </ThemedSafeArea>
  );
};

const styles = StyleSheet.create({
  box: {
    flex: 1,
  },
});
