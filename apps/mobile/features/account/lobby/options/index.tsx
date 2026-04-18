import { StyleSheet, View } from "react-native";
import { Option } from "./option";
import { useThemeColor } from "@/hooks/use-theme-color";
import { OptionsType } from "../use-logic";

type Props = {
  data: OptionsType[];
};
export const Options = (props: Props) => {
  const bg = useThemeColor("CARD");
  const border = useThemeColor("SIDEBAR_BORDER");

  return (
    <View
      style={[
        styles.main,
        {
          backgroundColor: bg,
          borderColor: border,
        },
      ]}
    >
      {props.data.map((d, idx) => (
        <Option
          {...d}
          border={idx !== props.data.length - 1}
          key={idx}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    borderWidth: 0.5,
    width: "100%",
    marginTop: 34,
    borderRadius: 20,
  },
});
