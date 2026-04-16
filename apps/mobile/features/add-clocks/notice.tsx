import { AppTouchable, InterText } from "@/components/themed";
import { COLORS } from "@/constants/themes/colors";
import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";

type Props = {
  selected: string[];
  clear?: () => void;
};
export const Notice = (props: Props) => {
  const color = useThemeColor("MUTED_FOREGROUND");
  const bdr = useThemeColor("SIDEBAR_BORDER");

  const isEmpty = props.selected.length > 0 ? false : true;

  return (
    <View style={[styles.box, { borderColor: bdr }]}>
      <AppTouchable
        onPress={() => {
          if (isEmpty) return;
          return props.clear?.();
        }}
      >
        <InterText
          style={{
            color: !isEmpty ? COLORS.PINK : color,
            fontSize: 12,
            fontWeight: "600",
          }}
        >
          Clear Selected ({props.selected.length})
        </InterText>
      </AppTouchable>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    width: "100%",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.4,
  },
});
