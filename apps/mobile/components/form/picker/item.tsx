import { StyleSheet } from "react-native";
import { AppTouchable, InterText } from "@/components/themed";
import { COLORS } from "@/constants/themes/colors";
import { useThemeColor } from "@/hooks/use-theme-color";

export type PickerItemType = {
  value: string;
  label: string;
};

type Props = {
  data: PickerItemType;
  selected: boolean;
  pick: (val: PickerItemType) => void;
};
export const PickerItem = (props: Props) => {
  const border = useThemeColor("BORDER_DARKER");
  const muted = useThemeColor("MUTED_FOREGROUND");
  const bg = useThemeColor("BASE");

  return (
    <AppTouchable
      onPress={() => {
        props.pick(props.data);
      }}
      style={[
        styles.item,
        { borderColor: border, backgroundColor: bg },
        props.selected && {
          backgroundColor: COLORS.PINK,
        },
      ]}
    >
      <InterText
        numberOfLines={1}
        style={[
          styles.text,
          { color: muted },
          props.selected && {
            color: "white",
          },
        ]}
      >
        {props.data.label}
      </InterText>
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  item: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    textTransform: "uppercase",
  },
});
