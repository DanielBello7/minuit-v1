import {
  Animated,
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { InterText } from "../themed";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ReactNode, useRef } from "react";
import { COLORS } from "@/constants/themes/colors";

type Props = TextInputProps & {
  label?: string;
  icon?: ReactNode;
  isLoading?: boolean;
};

export const AppInput = (props: Props) => {
  const border = useThemeColor("BORDER");
  const text = useThemeColor("TEXT");
  const focusOpacity = useRef(new Animated.Value(0)).current;
  const fadeTo = (toValue: 0 | 1) => {
    Animated.timing(focusOpacity, {
      toValue,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.group}>
      {props.label && (
        <InterText style={styles.label}>{props.label}</InterText>
      )}
      <View style={[styles.box, { borderColor: border }]}>
        {props.icon && <View>{props.icon}</View>}

        <TextInput
          style={[
            styles.input,
            { color: text },
            props.isLoading && styles.loading,
          ]}
          clearButtonMode="while-editing"
          editable={props.isLoading ? false : true}
          onFocus={(event) => {
            fadeTo(1);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            fadeTo(0);
            props.onBlur?.(event);
          }}
          {...props}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.focusBorder,
            { borderColor: COLORS.PINK, opacity: focusOpacity },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    width: "100%",
    gap: 8,
  },
  label: {
    marginLeft: 3,
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    fontSize: 15,
    flex: 1,
    flexShrink: 1,
    paddingVertical: 14,
  },
  box: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
  },
  focusBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 12,
  },
  loading: {
    opacity: 0.4,
  },
});
