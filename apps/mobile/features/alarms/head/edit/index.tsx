import { AppTouchable, InterText } from "@/components/themed";
import { COLORS } from "@/constants/themes/colors";
import { StyleSheet } from "react-native";
import { useAlarmListStore } from "@/features/alarms/use-alarms-list.store";

export const EditAlarms = () => {
  const store = useAlarmListStore((state) => state);
  const press = () => {
    if (store.data.processing) return;
    store.set_data({ edit: !store.data.edit });
  };
  return (
    <AppTouchable onPress={press}>
      <InterText style={styles.text}>
        {!store.data.edit ? "Edit" : "Done"}
      </InterText>
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  text: {
    color: COLORS.PINK,
    fontWeight: "500",
  },
});
