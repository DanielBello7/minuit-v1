import { InterText } from "@/components/themed";
import { StyleSheet, View } from "react-native";
import { CLOCK_SIZE } from "../..";
import { useLogic } from "./use-logic";
import { COLORS } from "@/constants/themes/colors";

type Props = {
  hr: number;
  mn: number;
  size: CLOCK_SIZE;
};
export const Digital = (props: Props) => {
  const { hr, mn, period, style } = useLogic(props);
  return (
    <View style={styles.box}>
      <View style={styles.time}>
        <InterText
          type="title"
          style={[styles.text, style]}
        >
          {hr}
        </InterText>
        <InterText
          type="title"
          style={[styles.text, style]}
        >
          :
        </InterText>
        <InterText
          type="title"
          style={[styles.text, style]}
        >
          {mn}
        </InterText>
        <InterText
          style={[
            styles.period,
            props.size === "SMALL" && {
              fontSize: 8,
            },
          ]}
        >
          {period}
        </InterText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  period: {
    fontWeight: "500",
    fontSize: 12,
    marginLeft: 3,
    color: COLORS.GRAY_400,
  },
  text: {
    fontWeight: "800",
    fontSize: 30,
  },
  time: {
    flexDirection: "row",
  },
  box: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    marginLeft: 16,
  },
});
