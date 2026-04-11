import AntDesign from "@expo/vector-icons/AntDesign";

import { AppTouchable } from "@/components/themed";
import { RefObject } from "react";
import { SectionList, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

type Props = {
  link: RefObject<SectionList | null>;
};
export const ToTop = (props: Props) => {
  const bg = useThemeColor("BUTTON_SECONDARY_BACKGROUND_DARK");
  const fg = useThemeColor("BUTTON_SECONDARY_FOREGROUND");
  const bd = useThemeColor("BUTTON_SECONDARY_BORDER_DARK");

  return (
    <AppTouchable
      style={[styles.box, { backgroundColor: bg, borderColor: bd }]}
      onPress={() => {
        props.link?.current?.scrollToLocation({
          itemIndex: 0,
          animated: true,
          sectionIndex: 0,
        });
      }}
    >
      <AntDesign
        name="arrow-up"
        color={fg}
        size={18}
      />
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  box: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
  },
});
