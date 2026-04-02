import { AppTouchable, InterText, ThemedView } from "@/components/themed";
import { StyleSheet, View } from "react-native";
import { AnalogClockV1 } from "./analog-clock/v1/index.v1";
import { DigitalClock } from "./digital-clock";
import { COLORS } from "@/constants/themes/colors";
import { useLogic } from "./use-logic";

export type CLOCK_SIZE_TYPE = "SMALL" | "MEDIUM" | "LARGE";
export type CLOCK_TYPE = "DIGITAL" | "ANALOG";

type Props = {
  size?: CLOCK_SIZE_TYPE;
  type?: CLOCK_TYPE;
  hr: number;
  mn: number;
  timezone?: string;
  city?: string;
  date?: Date;
  seconds?: boolean;
  showCity?: boolean;
  interactive?: boolean;
  reset?: boolean;
  showDate?: boolean;
  showHowTo?: boolean;
  showDay?: boolean;
  onTimeChange?: (hours: number, minutes: number) => void;
};

export const Clock = (props: Props) => {
  const {
    size = "LARGE",
    showDay = true,
    interactive = false,
    showCity = true,
    seconds = true,
    showDate = true,
    type = "ANALOG",
    showHowTo = true,
  } = props;

  const {
    border,
    card,
    foreground,
    formatted_date,
    muted,
    primary,
    status,
  } = useLogic(props);

  return (
    <ThemedView
      style={[
        styles.wrapper,
        size === "LARGE" ? styles.gapLarge : styles.gapSmall,
      ]}
    >
      {/* Header */}
      <View style={styles.segment}>
        {/* City */}
        {showCity && (
          <View style={styles.info}>
            <InterText style={styles.city}>
              {props.city ?? "Local time"}
            </InterText>
          </View>
        )}

        {/* Day */}
        {showDay && (
          <View style={styles.info}>
            {!!formatted_date && (
              <InterText style={[styles.day, { color: muted }]}>
                {status}
              </InterText>
            )}
          </View>
        )}
      </View>

      {/* Clock */}
      <View style={styles.segment}>
        {/* Analog */}
        {type === "ANALOG" && (
          <AnalogClockV1
            border={border}
            card={card}
            foreground={foreground}
            primary={primary}
            size={size}
            hr={props.hr}
            mn={props.mn}
            date={props.date ?? new Date()}
            interactive={interactive}
            seconds={seconds}
            onTimeChange={props.onTimeChange}
          />
        )}

        {/* Digital */}
        {props.type === "DIGITAL" && (
          <DigitalClock
            border={border}
            card={card}
            foreground={foreground}
            primary={primary}
            size={size}
            hr={props.hr}
            mn={props.mn}
          />
        )}
      </View>

      {/* Footer */}
      <View style={styles.segment}>
        {/* Date */}
        {showDate && (
          <View style={styles.info}>
            {!!formatted_date && (
              <InterText style={[styles.day, { color: muted }]}>
                {formatted_date}
              </InterText>
            )}
          </View>
        )}

        {/* How to */}
        {showHowTo && (
          <View style={styles.info}>
            <InterText style={styles.howto}>
              Drag hands to check time difference
            </InterText>
          </View>
        )}
      </View>

      {/* Reset Button */}
      {props.reset && (
        <AppTouchable onPress={() => {}}>
          <InterText style={styles.reset}>Reset</InterText>
        </AppTouchable>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  howto: {
    fontSize: 10,
  },
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  gapLarge: {
    gap: 12,
  },
  gapSmall: {
    gap: 6,
  },
  info: {
    alignItems: "center",
  },
  city: {
    fontSize: 20,
    color: COLORS.PINK,
  },
  day: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  reset: {
    color: COLORS.PINK,
    fontSize: 12,
  },
  segment: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
});
