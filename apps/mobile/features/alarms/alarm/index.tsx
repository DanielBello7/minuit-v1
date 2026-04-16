import { InterText, ThemedView } from "@/components/themed";
import { StyleSheet, View } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Head } from "./head";
import { Days } from "./days";
import { Footer } from "./footer";
import { useAlarmListStore } from "../use-alarms-list.store";
import { DeleteAlarm } from "./delete";

export const Alarm = () => {
  const border = useThemeColor("SIDEBAR_BORDER");
  const bg = useThemeColor("CARD");
  const store = useAlarmListStore((state) => state);

  return (
    <View style={{ position: "relative" }}>
      {store.data.edit && <DeleteAlarm />}

      <ThemedView
        style={[
          styles.box,
          {
            borderColor: border,
            backgroundColor: bg,
          },
        ]}
      >
        <Head />
        <Days />

        <View style={styles.timebox}>
          <InterText style={styles.time}>12:00</InterText>
        </View>

        <Footer />
      </ThemedView>
    </View>
  );
};

const styles = StyleSheet.create({
  timebox: {
    width: "100%",
  },
  time: {
    fontSize: 40,
    fontWeight: "800",
  },
  box: {
    width: "100%",
    borderWidth: 1,
    padding: 10,
    gap: 5,
    borderRadius: 16,
  },
});
