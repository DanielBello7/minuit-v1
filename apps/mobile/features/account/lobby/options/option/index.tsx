import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

import { AppTouchable, InterText } from "@/components/themed";
import { StyleSheet, View } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Icon } from "./icon";
import { ReactNode } from "react";

type Props = {
  action: () => void;
  rgba: string;
  icon: ReactNode;
  label: string;
  border?: boolean;
};
export const Option = (props: Props) => {
  const colors = useThemeColor("MUTED_FOREGROUND");
  const border = useThemeColor("SIDEBAR_BORDER");
  const show = props.border ?? true;

  return (
    <AppTouchable>
      <View
        style={[
          styles.main,
          {
            borderColor: border,
          },
          { borderBottomWidth: show ? 0.5 : 0 },
        ]}
      >
        <View style={styles.left}>
          <Icon
            icon={props.icon}
            rgba={props.rgba}
          />

          <InterText style={styles.label}>{props.label}</InterText>
        </View>
        <FontAwesome5
          name="chevron-right"
          color={colors}
          size={12}
        />
      </View>
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  main: {
    borderBottomWidth: 0.5,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  left: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
});
