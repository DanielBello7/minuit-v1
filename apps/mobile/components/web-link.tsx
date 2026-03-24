import { InterText, ThemedTextProps } from "./themed";
import { useState } from "react";
import { StyleSheet } from "react-native";
import {
  WebBrowserPresentationStyle,
  openBrowserAsync,
} from "expo-web-browser";
import { useThemeColor } from "@/hooks/use-theme-color";

type Props = ThemedTextProps & {
  href?: string;
  children?: string;
};

export const WebLink = (props: Props) => {
  const [pressed, setPressed] = useState(false);
  const color = useThemeColor("PRIMARY");

  const press = async () => {
    if (!props.href) return;
    await openBrowserAsync(props.href, {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    });
  };
  return (
    <InterText
      style={[
        { opacity: pressed ? 0.5 : 1, color },
        styles.link_in_line,
        props.style,
      ]}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={press}
    >
      {props.children}
    </InterText>
  );
};

const styles = StyleSheet.create({
  link_in_line: {
    textDecorationLine: "underline",
    fontWeight: "500",
    fontSize: 12,
  },
});
