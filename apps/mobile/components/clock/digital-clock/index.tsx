import { InterText } from "@/components/themed";
import { StyleSheet, View } from "react-native";
import { CLOCK_SIZE_TYPE } from "..";

type Props = {
  size: CLOCK_SIZE_TYPE;
  hr: number; // hours
  mn: number; // mins
  border: string;
  foreground: string;
  primary: string;
  card: string;
};

export const DigitalClock = (props: Props) => {
  return (
    <View style={styles.box}>
      <InterText
        style={[
          styles.digital,
          props.size === "LARGE" ? styles.large : styles.small,
        ]}
      >
        {String(props.hr).padStart(2, "0")}:
        {String(props.mn).padStart(2, "0")}
      </InterText>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
  },
  digital: {
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  large: {
    fontSize: 28,
  },
  small: {
    fontSize: 14,
  },
});
