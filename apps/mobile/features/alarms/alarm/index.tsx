import { InterText, ThemedView } from "@/components/themed";
import { StyleSheet, View } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Head } from "./head";
import { Days } from "./days";
import { Footer } from "./footer";
import { useAlarmListStore } from "../use-alarms-list.store";
import { DeleteAlarm } from "./delete";
import { BlurView } from "expo-blur";

export const Alarm = () => {
  const border = useThemeColor("BUTTON_SECONDARY_BORDER_DARK");
  const bg = useThemeColor("BASE");
  const store = useAlarmListStore((state) => state);

  return (
    <View style={{ position: "relative" }}>
      {/* <DeleteAlarm /> */}
      <BlurView
        intensity={100}
        style={styles.blurContainer}
      >
        <ThemedView
          style={[
            styles.box,
            {
              borderColor: border,
              backgroundColor: bg,
            },
          ]}
        >
          {/* {store.data.edit && <DeleteAlarm />} */}

          <Head />
          <Days />

          <View style={styles.timebox}>
            <InterText style={styles.time}>12:00</InterText>
          </View>

          <Footer />
        </ThemedView>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    padding: 20,
    margin: 16,
    textAlign: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 20,
  },
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
