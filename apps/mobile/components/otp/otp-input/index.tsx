import { COLORS } from "@/constants/themes/colors";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useRef } from "react";
import { Animated, StyleSheet, TextInput, View } from "react-native";

type Props = {
  value: string;
  setValue: (value: string) => void;
  isLoading?: boolean;
};

export const OtpInput = (props: Props) => {
  const focusOpacity = useRef(new Animated.Value(0)).current;
  const color = useThemeColor("TEXT");
  const fadeTo = (toValue: 0 | 1) => {
    Animated.timing(focusOpacity, {
      toValue,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.box}>
      <TextInput
        style={[
          styles.input,
          { color },
          props.isLoading && styles.loading,
        ]}
        keyboardType="number-pad"
        placeholder="000000"
        editable={props.isLoading ? false : true}
        maxLength={6}
        onFocus={() => fadeTo(1)}
        onBlur={() => fadeTo(0)}
        value={props.value}
        onChangeText={props.setValue}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.focusBorder, { opacity: focusOpacity }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: 20,
  },
  input: {
    fontSize: 30,
    fontWeight: "800",
    fontFamily: "InterRegular",
    paddingVertical: 10,
    textAlign: "center",
    letterSpacing: 12,
  },
  focusBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: COLORS.PINK,
    borderRadius: 20,
  },
  loading: {
    opacity: 0.4,
  },
});
