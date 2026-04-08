import { Fragment } from "react";
import { View, StyleSheet } from "react-native";
import { InterText, AppTouchable } from "../themed";
import { useThemeColor } from "@/hooks/use-theme-color";
import { COLORS } from "@/constants/themes/colors";
import { CLOCK_SIZE } from ".";

type Props = {
  size: CLOCK_SIZE;
  showHowTo: boolean;
  showDates: boolean;
  date: string; // formatted date like Thursday 6 April 2026
  reset?: () => void;
};
export const Footer = (props: Props) => {
  const muted = useThemeColor("MUTED_FOREGROUND");
  return (
    <Fragment>
      <View style={styles.segment}>
        {props.showDates && (
          <View style={styles.info}>
            <InterText
              style={[
                styles.day,
                { color: muted },
                props.size === "SMALL" && { fontSize: 10 },
              ]}
            >
              {props.date}
            </InterText>
          </View>
        )}

        {props.showHowTo && (
          <View style={styles.info}>
            <InterText style={styles.howto}>
              Drag hands to check time difference
            </InterText>
          </View>
        )}
      </View>

      {props.reset && (
        <AppTouchable onPress={props.reset}>
          <InterText style={styles.reset}>Reset</InterText>
        </AppTouchable>
      )}
    </Fragment>
  );
};

const styles = StyleSheet.create({
  howto: {
    fontSize: 10,
    color: COLORS.GRAY_350,
  },
  info: {
    alignItems: "center",
  },
  day: {
    fontSize: 14,
    textTransform: "capitalize",
    letterSpacing: 0.8,
    color: COLORS.PINK,
  },
  reset: {
    color: COLORS.PINK,
    fontSize: 12,
  },
  segment: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});
