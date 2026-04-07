import { AppTouchable, InterText } from "@/components/themed";
import { StyleSheet, View } from "react-native";
import { AnalogClockV1 } from "./analog-clock/v1/index.v1";
import { DigitalClock } from "./digital-clock";
import { COLORS } from "@/constants/themes/colors";
import { useLogic } from "./use-logic";
import { TIME_TYPE } from "@/features/home/clocks";

export type CLOCK_SIZE_TYPE = "SMALL" | "MEDIUM" | "LARGE";
export type CLOCK_TYPE = "DIGITAL" | "ANALOG";
export type TIME_CHANGE_TYPE = (val: TIME_TYPE | null) => void;

type Props = {
  size?: CLOCK_SIZE_TYPE;
  type?: CLOCK_TYPE;
  custom?: TIME_TYPE | null;
  date?: Date | null;
  timezone?: string;
  city?: string;
  seconds?: boolean;
  showCity?: boolean;
  interactive?: boolean;
  reset?: boolean;
  showDate?: boolean;
  showHowTo?: boolean;
  showDay?: boolean;
  onTimeChange?: TIME_CHANGE_TYPE;
};

export const Clock = (props: Props) => {
  const {
    size = "LARGE",
    showDay = false,
    interactive = false,
    showCity = true,
    seconds = true,
    showDate = false,
    type = "ANALOG",
    showHowTo = false,
    reset: rst = false,
  } = props;

  const {
    border,
    clock_face_border,
    card,
    foreground,
    formatted_date,
    muted,
    primary,
    status,
    reset,
    custom,
    now,
    zoned_now,
    setCustom,
  } = useLogic(props);

  const hr = custom ? custom.hr : zoned_now.hr;
  const mn = custom ? custom.mn : zoned_now.mn;

  return (
    <View
      style={[
        styles.wrapper,
        size === "LARGE" ? styles.gapLarge : styles.gapSmall,
      ]}
    >
      <View style={styles.segment}>
        {showCity && (
          <View style={styles.info}>
            <InterText
              style={styles.city}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {props.city ?? "Local time"}
            </InterText>
          </View>
        )}

        {showDay && (
          <View style={styles.info}>
            {!!formatted_date && (
              <InterText style={styles.day}>{status}</InterText>
            )}
          </View>
        )}
      </View>

      <View style={[styles.segment, styles.top]}>
        {type === "ANALOG" && (
          <AnalogClockV1
            faceBorder={clock_face_border}
            card={card}
            foreground={foreground}
            primary={primary}
            size={size}
            hr={hr}
            mn={mn}
            date={now}
            interactive={interactive}
            seconds={seconds}
            onTimeChange={props.onTimeChange}
            setCustom={setCustom}
          />
        )}

        {type === "DIGITAL" && (
          <DigitalClock
            border={border}
            card={card}
            foreground={foreground}
            primary={primary}
            size={size}
            hr={hr}
            mn={mn}
          />
        )}
      </View>

      <View style={styles.segment}>
        {showDate && (
          <View style={styles.info}>
            {!!formatted_date && (
              <InterText style={[styles.day, { color: muted }]}>
                {formatted_date}
              </InterText>
            )}
          </View>
        )}

        {showHowTo && (
          <View style={styles.info}>
            <InterText style={styles.howto}>
              Drag hands to check time difference
            </InterText>
          </View>
        )}
      </View>

      {rst && (
        <AppTouchable onPress={reset}>
          <InterText style={styles.reset}>Reset</InterText>
        </AppTouchable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  howto: {
    fontSize: 10,
    color: COLORS.GRAY_350,
  },
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 12,
    textAlign: "center",
    color: COLORS.GRAY_400,
    letterSpacing: 1,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  day: {
    fontSize: 10,
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
  top: {
    marginTop: 5,
  },
});
