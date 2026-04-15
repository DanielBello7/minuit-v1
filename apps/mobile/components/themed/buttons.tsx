import {
  StyleSheet,
  TouchableOpacityProps,
  useColorScheme,
} from "react-native";
import { AppTouchable } from "./app-touchable";
import { InterText } from "./styled-text";
import { ThemedTextProps } from "./themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Animatable from "react-native-animatable";

type AppButtonProps = TouchableOpacityProps & {
  isLoading?: boolean;
};

/**
 * Primary app button with built-in loading state visuals.
 */
export const ButtonA = ({ style, isLoading, ...rest }: AppButtonProps) => {
  const background = useThemeColor("BUTTON_PRIMARY_BACKGROUND");

  const disabled = useThemeColor("DISABLED");

  const scheme = useColorScheme();

  if (isLoading) {
    return (
      <AppTouchable
        {...rest}
        disabled={true}
        style={[styles.button, { backgroundColor: disabled }, style]}
      >
        <Animatable.View
          animation={"rotate"}
          iterationCount={"infinite"}
          useNativeDriver={true}
        >
          <MaterialCommunityIcons
            name="loading"
            size={18}
            color={scheme === "light" ? "black" : "white"}
          />
        </Animatable.View>
      </AppTouchable>
    );
  }
  return (
    <AppTouchable
      {...rest}
      style={[
        styles.button,
        { backgroundColor: background },
        rest.disabled && { backgroundColor: disabled },
        style,
      ]}
    />
  );
};

/**
 * Secondary app button with built-in loading state visuals.
 */
export const ButtonB = ({ style, isLoading, ...rest }: AppButtonProps) => {
  const background = useThemeColor("BUTTON_SECONDARY_BACKGROUND");
  const border = useThemeColor("BUTTON_SECONDARY_BORDER");
  const disabled = useThemeColor("DISABLED");
  const scheme = useColorScheme();
  if (isLoading) {
    return (
      <AppTouchable
        {...rest}
        disabled={true}
        style={[
          styles.button,
          styles.secondary,
          { backgroundColor: disabled, borderColor: disabled },
          style,
        ]}
      >
        <Animatable.View
          animation={"rotate"}
          iterationCount={"infinite"}
          useNativeDriver={true}
        >
          <MaterialCommunityIcons
            name="loading"
            size={18}
            color={scheme === "light" ? "black" : "white"}
          />
        </Animatable.View>
      </AppTouchable>
    );
  }
  return (
    <AppTouchable
      {...rest}
      style={[
        styles.button,
        styles.secondary,
        { backgroundColor: background, borderColor: border },
        style,
      ]}
    />
  );
};

/**
 * Link-style button: transparent surface, pairs with {@link ButtonTextC}.
 */
export const ButtonC = ({ style, isLoading, ...rest }: AppButtonProps) => {
  const pink = useThemeColor("PRIMARY");

  if (isLoading) {
    return (
      <AppTouchable
        {...rest}
        disabled={true}
        style={[styles.link_button, style]}
      >
        <Animatable.View
          animation={"rotate"}
          iterationCount={"infinite"}
          useNativeDriver={true}
        >
          <MaterialCommunityIcons
            name="loading"
            size={18}
            color={pink}
          />
        </Animatable.View>
      </AppTouchable>
    );
  }
  return (
    <AppTouchable
      {...rest}
      style={[
        styles.link_button,
        rest.disabled && styles.link_button_disabled,
        style,
      ]}
    />
  );
};

/**
 * Text style helper for primary buttons.
 */
export const ButtonTextA = (props: ThemedTextProps) => {
  const color = useThemeColor("BUTTON_PRIMARY_FOREGROUND");
  return (
    <InterText
      {...props}
      style={[styles.primary_text, { color }, props.style]}
    />
  );
};

/**
 * Text style helper for secondary buttons.
 */
export const ButtonTextB = (props: ThemedTextProps) => {
  const color = useThemeColor("BUTTON_SECONDARY_FOREGROUND");
  return (
    <InterText
      {...props}
      style={[styles.secondary_text, { color }, props.style]}
    />
  );
};

/**
 * Text style helper for link (ButtonC) — pink, underlined.
 */
export const ButtonTextC = (props: ThemedTextProps) => {
  const color = useThemeColor("PRIMARY");
  return (
    <InterText
      {...props}
      style={[styles.link_text, { color }, props.style]}
    />
  );
};

const styles = StyleSheet.create({
  primary_text: {
    fontSize: 15,
    fontWeight: "600",
  },
  secondary_text: {
    fontSize: 15,
    fontWeight: "500",
  },
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  secondary: {
    borderWidth: 1,
  },
  link_button: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  link_button_disabled: {
    opacity: 0.45,
  },
  link_text: {
    fontSize: 15,
    fontWeight: "500",
  },
});
