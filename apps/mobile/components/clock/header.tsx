import { StyleSheet, View } from "react-native";
import { InterText } from "../themed";
import { COLORS } from "@/constants/themes/colors";
import { Zoned } from "@/libs/zoned";

type Props = {
  showCity: boolean;
  showDays: boolean;
  zone: Zoned;
  city: string;
  sync?: Zoned | null;
};
export const Header = (props: Props) => {
  const status = Zoned.relative_day(props.zone, new Zoned());
  return (
    <View style={styles.segment}>
      {props.showCity && (
        <View style={styles.info}>
          <InterText
            style={styles.city}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {props.city ?? "Local time"}
          </InterText>
        </View>
      )}

      {props.showDays && (
        <View style={styles.info}>
          <InterText style={styles.day}>{status}</InterText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  info: {
    alignItems: "center",
  },
  city: {
    fontSize: 12,
    textAlign: "center",
    color: COLORS.GRAY_400,
    letterSpacing: 1,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  day: {
    fontSize: 10,
    textTransform: "capitalize",
    letterSpacing: 0.8,
    color: COLORS.PINK,
  },
  segment: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
});
