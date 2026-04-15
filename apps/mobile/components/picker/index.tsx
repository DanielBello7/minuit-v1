import { StyleSheet, View } from "react-native";
import { PickerItem, PickerItemType } from "./item";
import { InterText } from "../themed";

type Props = {
  onPick: (val: PickerItemType) => void;
  selected: PickerItemType[];
  items: PickerItemType[];
  label: string;
};
export const Picker = (props: Props) => {
  return (
    <View style={styles.box}>
      <InterText style={styles.label}>{props.label}</InterText>
      <View style={styles.container}>
        {props.items.map((i) => (
          <PickerItem
            data={i}
            pick={props.onPick}
            selected={
              props.selected.find((a) => i.value === a.value)
                ? true
                : false
            }
            key={i.value}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    marginLeft: 2,
  },
  box: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 14,
  },
  container: {
    flexDirection: "row",
    width: "100%",
    gap: 6,
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
