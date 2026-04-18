import { StyleSheet, View } from "react-native";
import { AnalogClock } from "./analog-clock/";
import { DigitalClock } from "./digital-clock";
import { useLogic } from "./use-logic";
import { Header } from "./header";
import { Footer } from "./footer";
import { Zoned } from "@/libs/zoned";
import { TIME_TYPE } from "@/features/home/my-clocks/clocks";

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

/**
 * Renders a timezone-aware clock card with optional analog or digital display.
 *
 * The component can run in two modes:
 * - standalone: it keeps its own live `Zoned` time based on `tz`
 * - synced: when `sync` is provided, it mirrors the same instant from another
 *   clock but displays it in this clock's timezone
 *
 * It also supports controlled and uncontrolled custom time:
 * - uncontrolled: if `custom` is omitted, drag changes are stored internally
 * - controlled: if `custom` is provided, the parent owns the selected time and
 *   receives updates through `setCustom`
 *
 * @param props.size Visual size preset for spacing and child clock sizing.
 * @param props.type Whether to render the analog face or digital display.
 * @param props.sync Optional source clock to mirror. When present, this clock
 * displays the same instant as the source in its own timezone.
 * @param props.city Display label shown in the header.
 * @param props.tz IANA timezone used as the local zone for this clock.
 * @param props.set Optional callback fired with a `Zoned` instance when the
 * interactive time changes, or `null` when that custom selection is cleared.
 * @param props.custom Optional externally controlled custom time selection.
 * @param props.setCustom Optional callback fired whenever the custom
 * hour/minute selection changes.
 * @param props.showSeconds Whether the analog clock should render a second hand.
 * @param props.showCity Whether to show the city label in the header.
 * @param props.interactive Whether the analog clock hands can be dragged.
 * @param props.showDate Whether to show the formatted date in the footer.
 * @param props.dateType Controls the formatted date style used in the footer.
 * @param props.showHowTo Whether to show helper copy beneath the clock.
 * @param props.showDays Whether to show the relative day label in the header.
 */
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
