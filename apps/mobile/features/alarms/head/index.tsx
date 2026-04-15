import { InterText } from "@/components/themed";
import { StyleSheet, View } from "react-native";
import { AddAlarm } from "./add";
import { EditAlarms } from "./edit";
import { useThemeColor } from "@/hooks/use-theme-color";

type Props = {
  data?: any[];
};
export const Head = (props: Props) => {
  const border = useThemeColor("BUTTON_SECONDARY_BACKGROUND_DARK");
  return (
    <View
      style={[
        styles.box,
        props.data &&
          props.data.length > 0 && {
            borderBottomWidth: 1,
            borderColor: border,
          },
      ]}
    >
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
    paddingBottom: 10,
    paddingHorizontal: 16,
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
