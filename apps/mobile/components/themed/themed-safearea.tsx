import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet } from "react-native";
import {
  SafeAreaView,
  SafeAreaViewProps,
  SafeAreaProvider,
} from "react-native-safe-area-context";

export const ThemedSafeArea = (props: SafeAreaViewProps) => {
  const color = useThemeColor("BACKGROUND");
  return (
    <SafeAreaProvider>
      <SafeAreaView
        {...props}
        style={[style.container, { backgroundColor: color }, props.style]}
      />
    </SafeAreaProvider>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
});
