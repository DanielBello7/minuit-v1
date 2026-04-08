import { StyleSheet, View } from "react-native";
import { AnalogClock } from "./analog-clock/";
import { DigitalClock } from "./digital-clock";
import { useLogic } from "./use-logic";
import { Header } from "./header";
import { Footer } from "./footer";
import { Zoned } from "@/libs/zoned";
import { TIME_TYPE } from "@/features/home/clocks";

export type CLOCK_SIZE = "SMALL" | "MEDIUM" | "LARGE";
export type CLOCK_TYPE = "DIGITAL" | "ANALOG";
export type CLOCK_SYNC = (val: Zoned | null) => void;
export type CLOCK_CUSTOM = (val: TIME_TYPE | null) => void;

type Props = {
  size?: CLOCK_SIZE;
  type?: CLOCK_TYPE;
  sync?: Zoned | null;
  city: string;
  tz: string;
  set?: CLOCK_SYNC;
  custom?: TIME_TYPE | null;
  setCustom?: CLOCK_CUSTOM;
  showSeconds?: boolean;
  showCity?: boolean;
  interactive?: boolean;
  showDate?: boolean;
  dateType?: "short" | "long";
  showHowTo?: boolean;
  showDays?: boolean;
};

export const Clock = (props: Props) => {
  const {
    size = "LARGE",
    type = "ANALOG",
    showSeconds = false,
    showCity = true,
    interactive = false,
    showDate = false,
    showHowTo = false,
    showDays = true,
  } = props;
  const { now, change, custom, proper } = useLogic(props);

  const hr = custom ? custom.hr : now.hr;
  const mn = custom ? custom.mn : now.mn;

  return (
    <View
      style={[
        styles.wrapper,
        size === "LARGE" ? styles.gapLarge : styles.gapSmall,
      ]}
    >
      <Header
        city={props.city}
        zone={now}
        sync={props.sync}
        showCity={showCity}
        showDays={showDays}
      />

      <View style={[styles.segment, styles.top]}>
        {type === "ANALOG" && (
          <AnalogClock
            size={size}
            change={change}
            hr={hr}
            mn={mn}
            date={now.base.toJSDate()}
            interactive={interactive}
            seconds={showSeconds}
          />
        )}

        {type === "DIGITAL" && (
          <DigitalClock
            size={size}
            hr={hr}
            mn={mn}
          />
        )}
      </View>

      <Footer
        size={size}
        showHowTo={showHowTo}
        showDates={showDate}
        date={proper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
