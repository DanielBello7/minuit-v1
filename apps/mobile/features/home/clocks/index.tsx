import { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Clock } from "@/components/clock";
import { ThemedView } from "@/components/themed";
import { FlatList } from "react-native-gesture-handler";
import { COLORS } from "@/constants/themes/colors";
import { useThemeColor } from "@/hooks/use-theme-color";
import { CloseBtn } from "@/components/close";
import { get_tz_time } from "@/libs/get-tz-time";

export type TIME_TYPE = { hr: number; mn: number };

export const Clocks = () => {
  const [current, setCurrent] = useState(new Date());
  const [custom, setCustom] = useState<Date | null>(null);

  const br = useThemeColor("SIDEBAR_BORDER");

  const clock_bg_style = [
    styles.my_clock,
    { borderColor: br },
    styles.shadow,
  ];

  const home_tz = "America/Indiana/Indianapolis";
  const display_date = custom ?? current;

  const timezones = [
    { tz: "America/New_York", city: "New York" },
    { tz: "America/Sao_Paulo", city: "Sao Paulo" },
    { tz: "America/Toronto", city: "Toronto" },
    { tz: "America/Vancouver", city: "Vancouver" },
  ];

  useEffect(() => {
    const id = setInterval(() => {
      if (!custom) {
        setCurrent(new Date());
      }
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [custom]);

  const handleTimeChange = (val: TIME_TYPE | null) => {
    if (!val) {
      setCustom(null);
      return;
    }

    const base = display_date;

    const currentHome = get_tz_time(base, home_tz);

    const hourDiff = val.hr - currentHome.hr;
    const minuteDiff = val.mn - currentHome.mn;

    const adjusted = new Date(base);
    adjusted.setHours(adjusted.getHours() + hourDiff);
    adjusted.setMinutes(adjusted.getMinutes() + minuteDiff);

    setCustom(adjusted);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section_1}>
        <FlatList
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          style={styles.flatlist}
          data={timezones}
          horizontal={true}
          keyExtractor={(i) => i.city}
          renderItem={(i) => (
            <ThemedView style={[clock_bg_style, styles.list_clock]}>
              <View style={styles.close}>
                <CloseBtn size={15} />
              </View>

              <Clock
                date={display_date}
                interactive={false}
                city={i.item.city}
                type="ANALOG"
                size="SMALL"
                seconds={false}
                timezone={i.item.tz}
                showDay={true}
                showDate={true}
              />
            </ThemedView>
          )}
        />
      </View>

      <View style={styles.section_2}>
        <ThemedView style={[clock_bg_style, { width: "100%" }]}>
          <Clock
            date={display_date}
            interactive={true}
            type="ANALOG"
            city="INDIANAPOLIS"
            timezone={home_tz}
            size="LARGE"
            showHowTo={true}
            showDate={true}
            reset={true}
            onTimeChange={handleTimeChange}
          />
        </ThemedView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 5,
    paddingTop: 10,
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
    }),
  },
  my_clock: {
    borderWidth: 0.4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingVertical: 20,
  },
  section_1: {
    width: "100%",
    flex: 0.35,
  },
  section_2: {
    paddingHorizontal: 20,
    width: "100%",
    flex: 0.65,
    alignItems: "center",
  },
  list: {
    gap: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  flatlist: {
    width: "100%",
  },
  close: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  list_clock: {
    paddingVertical: 30,
    width: 140,
    gap: 5,
    paddingTop: 40,
  },
});
