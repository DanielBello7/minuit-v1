import { TextStyle, StyleSheet } from "react-native";
import { ThemedTextProps, ThemedText } from "./themed-text";

const weight = (
  font: "DMSans" | "Inter" | "PlusJakartaSans",
  wgt?: TextStyle["fontWeight"],
) => {
  if (typeof wgt !== "string") return `${font}Regular`;
  switch (wgt) {
    case "thin":
    case "100":
      return `${font}Thin`;
    case "200":
    case "ultralight":
      return `${font}ExtraLight`;
    case "300":
    case "light":
      return `${font}Light`;
    case "400":
    case "normal":
    case "regular":
    case undefined:
      return `${font}Regular`;
    case "500":
    case "medium":
      return `${font}Medium`;
    case "600":
    case "semibold":
      return `${font}SemiBold`;
    case "700":
    case "bold":
      return `${font}Bold`;
    case "800":
    case "condensedBold":
      return `${font}ExtraBold`;
    case "900":
    case "black":
      return `${font}Black`;
    default:
      return `${font}Regular`;
  }
};

export const DMSansText = (props: ThemedTextProps) => {
  const flattened = StyleSheet.flatten(props.style) ?? {};
  const { fontWeight, ...rest } = flattened;
  return (
    <ThemedText
      {...props}
      style={[{ fontFamily: weight("DMSans", fontWeight) }, rest]}
    />
  );
};

export const InterText = (props: ThemedTextProps) => {
  const flattened = StyleSheet.flatten(props.style) ?? {};
  const { fontWeight, ...rest } = flattened;
  return (
    <ThemedText
      {...props}
      style={[{ fontFamily: weight("Inter", fontWeight) }, rest]}
    />
  );
};

export const PlusJakartaSansText = (props: ThemedTextProps) => {
  const flattened = StyleSheet.flatten(props.style) ?? {};
  const { fontWeight, ...rest } = flattened;
  return (
    <ThemedText
      {...props}
      style={[{ fontFamily: weight("PlusJakartaSans", fontWeight) }, rest]}
    />
  );
};
