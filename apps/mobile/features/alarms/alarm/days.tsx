import { InterText } from "@/components/themed";
import { StyleSheet, View } from "react-native";

const WEEKDAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export const Days = () => {
  return (
    <View style={styles.days}>
      {WEEKDAYS.map((i, idx) => {
        return (
          <InterText
            key={idx}
            style={styles.day}
          >
            {i[0]}
          </InterText>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  days: {
    width: "100%",
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  day: {
    fontSize: 12,
    fontWeight: "600",
  },
});
