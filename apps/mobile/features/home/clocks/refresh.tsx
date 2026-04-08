import { AppTouchable } from "@/components/themed";
import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet } from "react-native";

import Feather from "@expo/vector-icons/Feather";

type Props = {
  action: () => void;
};
export const Refresh = (props: Props) => {
  const border = useThemeColor("BUTTON_SECONDARY_BORDER_DARK");
  const colors = useThemeColor("BUTTON_SECONDARY_FOREGROUND");
  return (
    <AppTouchable
      style={[styles.box, { borderColor: border }]}
      onPress={props.action}
    >
      <Feather
        name="refresh-ccw"
        color={colors}
        size={18}
      />
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  box: {
    position: "absolute",
    top: 20,
    right: 20,
    borderWidth: 1,
    padding: 10,
    borderRadius: 99,
  },
});
