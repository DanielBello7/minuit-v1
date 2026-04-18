import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Clock } from "@/components/clock";
import { ThemedView } from "@/components/themed";
import { FlatList } from "react-native-gesture-handler";
import { COLORS } from "@/constants/themes/colors";
import { useThemeColor } from "@/hooks/use-theme-color";
import { CloseBtn } from "@/components/ui/close";
import { Zoned } from "@/libs/zoned";
import { Refresh } from "./refresh";
import { AddNewClock } from "./add";
import { User } from "@/libs/user";

export type TIME_TYPE = { hr: number; mn: number };

export const Clocks = () => {
  const [synced, setSynced] = useState<Zoned | null>(null);
  const [custom, setCustom] = useState<TIME_TYPE | null>(null);

  const bg = useThemeColor("CARD");
  const br = useThemeColor("SIDEBAR_BORDER");
  const user = new User();

  const clock_bg_style = [
    styles.my_clock,
    { borderColor: br },
    styles.shadow,
  ];

  const refresh = () => {
    setSynced(null);
    setCustom(null);
  };

  const timezones = [
    { tz: "America/New_York", city: "New York" },
    { tz: "America/Sao_Paulo", city: "Sao Paulo" },
    { tz: "America/Toronto", city: "Toronto" },
    { tz: "America/Vancouver", city: "Vancouver" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.section_1}>
        <FlatList
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          style={styles.flatlist}
          data={timezones}
          horizontal={true}
          ListFooterComponent={<AddNewClock />}
          keyExtractor={(i) => i.city}
          renderItem={(i) => (
            <ThemedView
              style={[
                clock_bg_style,
                styles.list_clock,
                { backgroundColor: bg },
              ]}
            >
              <View style={styles.close}>
                <CloseBtn size={15} />
              </View>

              <Clock
                city={i.item.city}
                tz={i.item.tz}
                size="SMALL"
                sync={synced}
                type="ANALOG"
                showDate={true}
                dateType="short"
              />
            </ThemedView>
          )}
        />
      </View>

      <View style={styles.section_2}>
        <ThemedView
          style={[clock_bg_style, { width: "100%", backgroundColor: bg }]}
        >
          {custom && <Refresh action={refresh} />}
          <Clock
            city="indianapolis"
            size="LARGE"
            type="ANALOG"
            tz={user.timezone}
            set={setSynced}
            custom={custom}
            setCustom={setCustom}
            dateType="long"
            showDate={true}
            showSeconds={true}
            showDays={false}
            showHowTo={true}
            interactive={true}
          />
        </ThemedView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    gap: 10,
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: {
        elevation: 0.5,
      },
      default: {
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
    }),
  },
  my_clock: {
    borderWidth: 0.4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingVertical: 30,
  },
  section_1: {
    width: "100%",
  },
  section_2: {
    paddingHorizontal: 16,
    width: "100%",
    alignItems: "center",
  },
  list: {
    gap: 16,
    paddingBottom: 5,
    paddingHorizontal: 16,
  },
  flatlist: {
    width: "100%",
    flexGrow: 0,
  },
  close: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  list_clock: {
    width: 150,
    height: 220,
    gap: 5,
  },
});
