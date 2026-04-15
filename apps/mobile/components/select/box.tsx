import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";
import { AppTouchable, InterText } from "../themed";
import { SelectOption } from "./use-logic";

import Entypo from "@expo/vector-icons/Entypo";

type Props = {
  label: string;
  value: SelectOption | null;
  placeholder: string;
  open: boolean;
  toggle: (val: boolean) => void;
};

export const Box = (props: Props) => {
  const border = useThemeColor("BUTTON_SECONDARY_BORDER_DARK");
  const colors = useThemeColor("MUTED_FOREGROUND");
  const text = useThemeColor("TEXT");
  const bg = useThemeColor("BASE");

  return (
    <View style={styles.box}>
      <InterText style={styles.label}>{props.label}</InterText>
      <AppTouchable
        style={[styles.form, { borderColor: border, backgroundColor: bg }]}
        onPress={() => {
          props.toggle(!props.open);
        }}
      >
        <InterText
          numberOfLines={1}
          style={[styles.text, { color: props.value ? text : colors }]}
        >
          {props.value
            ? props.value.description
              ? `${props.value.label}, ${props.value.description}`
              : props.value.label
            : props.placeholder}
        </InterText>

        <Entypo
          name={props.open ? "chevron-up" : "chevron-down"}
          color={colors}
          size={18}
        />
      </AppTouchable>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    width: "100%",
    gap: 6,
  },
  form: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    gap: 10,
  },
  text: {
    flex: 1,
    fontSize: 15,
  },
  label: {
    marginLeft: 2,
  },
});
