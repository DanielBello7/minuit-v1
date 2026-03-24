import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet } from "react-native";
import {
  SafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";

export const ThemedSafeArea = (props: SafeAreaViewProps) => {
  const color = useThemeColor("BACKGROUND");
  return (
    <SafeAreaView
      {...props}
      style={[style.container, props.style, { backgroundColor: color }]}
    />
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
});
