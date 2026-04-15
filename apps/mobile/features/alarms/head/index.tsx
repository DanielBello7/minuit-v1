import { InterText } from "@/components/themed";
import { StyleSheet, View } from "react-native";
import { AddAlarm } from "./add";
import { EditAlarms } from "./edit";

export const Head = () => {
  return (
    <View style={styles.box}>
      <InterText style={styles.title}>Alarms</InterText>

      <View style={styles.btns}>
        <EditAlarms />
        <AddAlarm />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  btns: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "600",
  },
});
