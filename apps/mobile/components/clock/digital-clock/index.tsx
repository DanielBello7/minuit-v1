import { InterText } from "@/components/themed";
import { StyleSheet, View } from "react-native";
import { CLOCK_SIZE } from "..";
// import { useThemeColor } from "@/hooks/use-theme-color";

type Props = {
  size: CLOCK_SIZE;
  hr: number; // hours
  mn: number; // mins
};

export const DigitalClock = (props: Props) => {
  // const border = useThemeColor("BORDER_DARKER");
  // const clock_face_border = useThemeColor("CLOCK_FACE_BORDER");
  // const muted = useThemeColor("MUTED_FOREGROUND");
  // const primary = useThemeColor("PRIMARY");
  // const card = useThemeColor("BACKGROUND");
  // const foreground = useThemeColor("FOREGROUND");

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
