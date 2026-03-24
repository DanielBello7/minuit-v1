import { View, type ViewProps } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const color = useThemeColor("BACKGROUND", {
    light: lightColor,
    dark: darkColor,
  });

  return (
    <View
      style={[{ backgroundColor: color }, style]}
      {...otherProps}
    />
  );
}
