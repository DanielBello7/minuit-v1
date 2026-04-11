import { SafeAreaViewProps } from "react-native-safe-area-context";
import { ThemedSafeArea } from "./themed-safearea";
import { StyleSheet } from "react-native";

export const AppSafeArea = (props: SafeAreaViewProps) => {
  const { style, ...rest } = props;
  return (
    <ThemedSafeArea
      edges={["left", "right", "top", "bottom"]}
      style={[styles.container, style]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
});
