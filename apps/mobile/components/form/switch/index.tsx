import { useThemeColor } from "@/hooks/use-theme-color";
import {
  Animated,
  Pressable,
  PressableStateCallbackType,
  PressableProps,
  StyleSheet,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { useEffect, useRef, useState } from "react";

type Props = Omit<PressableProps, "onPress"> & {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (val: boolean) => void;
  size?: "small" | "medium" | "large";
};

const SIZES = {
  small: {
    trackW: 36,
    trackH: 20,
    thumb: 16,
    offset: 2,
  },
  medium: {
    trackW: 44,
    trackH: 24,
    thumb: 20,
    offset: 2,
  },
  large: {
    trackW: 52,
    trackH: 30,
    thumb: 26,
    offset: 2,
  },
} as const;

/**
 * A small theme-aware switch component modeled after shadcn-style toggles.
 *
 * Supports both controlled (`checked`) and uncontrolled (`defaultChecked`)
 * usage. When pressed, it toggles the value and calls `onCheckedChange`.
 */
export const Switch = ({
  checked,
  defaultChecked = false,
  disabled = false,
  onCheckedChange,
  size = "medium",
  style,
  ...rest
}: Props) => {
  const controlled = checked !== undefined;
  const [internal, setInternal] = useState(defaultChecked);
  const value = controlled ? checked : internal;
  const dimensions = SIZES[size];
  const range =
    dimensions.trackW - dimensions.thumb - dimensions.offset * 2;

  const background = useThemeColor("SWITCH_BACKGROUND");
  const active = useThemeColor("PRIMARY");
  const border = useThemeColor("SIDEBAR_BORDER");
  const thumb = useThemeColor("BASE");

  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      bounciness: 0,
      speed: 20,
    }).start();
  }, [progress, value]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, range],
  });

  const press = () => {
    if (disabled) return;

    const next = !value;

    if (!controlled) {
      setInternal(next);
    }

    onCheckedChange?.(next);
  };

  const resolveRootStyle = (
    state: PressableStateCallbackType,
  ): StyleProp<ViewStyle> => {
    const providedStyle =
      typeof style === "function" ? style(state) : style;

    return [styles.root, providedStyle, disabled && styles.disabled];
  };

  return (
    <Pressable
      {...rest}
      onPress={press}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      style={resolveRootStyle}
    >
      {({ pressed }) => {
        return (
          <View
            style={[
              styles.track,
              {
                width: dimensions.trackW,
                height: dimensions.trackH,
                padding: dimensions.offset,
              },
              {
                backgroundColor: value ? active : background,
                borderColor: value ? active : border,
              },
              pressed && !disabled && styles.pressed,
            ]}
          >
            <Animated.View
              style={[
                styles.thumb,
                {
                  width: dimensions.thumb,
                  height: dimensions.thumb,
                  backgroundColor: thumb,
                  transform: [{ translateX }],
                },
              ]}
            />
          </View>
        );
      }}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    borderRadius: 999,
  },
  track: {
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
  },
  thumb: {
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 1.5,
    elevation: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
