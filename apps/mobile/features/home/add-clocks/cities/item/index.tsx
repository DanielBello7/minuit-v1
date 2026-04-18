import AntDesign from "@expo/vector-icons/AntDesign";

import { AppTouchable, InterText } from "@/components/themed";
import { COLORS } from "@/constants/themes/colors";
import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";
import { memo } from "react";
import { CityData } from "city-timezones";

type Props = {
  selected?: boolean;
  data: CityData;
  pick: (val: string) => void;
};
export const Item = memo(function Item(props: Props) {
  const border = useThemeColor("SIDEBAR_BORDER");
  const dim = useThemeColor("ACCENT");

  return (
    <AppTouchable
      onPress={() => {
        props.pick(props.data.city);
      }}
      style={[
        styles.item,
        { borderColor: border },
        props.selected && { backgroundColor: dim },
      ]}
    >
      <View style={styles.textbox}>
        <InterText style={styles.city}>{props.data.city}</InterText>
        <InterText style={styles.country}>{props.data.country}</InterText>
      </View>
      {props.selected && (
        <AntDesign
          name="check"
          size={14}
          color="black"
        />
      )}
    </AppTouchable>
  );
});

const styles = StyleSheet.create({
  textbox: {},
  city: {
    textTransform: "capitalize",
  },
  tz: {
    fontSize: 12,
    color: COLORS.GRAY_500,
  },
  country: {
    fontSize: 12,
    color: COLORS.GRAY_500,
  },
  item: {
    width: "100%",
    height: 70,
    paddingHorizontal: 16,
    paddingRight: 35,
    borderBottomWidth: 0.4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
