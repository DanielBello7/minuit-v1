import AntDesign from "@expo/vector-icons/AntDesign";

import { SectionList, StyleSheet } from "react-native";
import { AppTouchable } from "@/components/themed";
import { RefObject } from "react";
import { COLORS } from "@/constants/themes/colors";

type Props = {
  link: RefObject<SectionList | null>;
};
export const ToTop = (props: Props) => {
  return (
    <AppTouchable
      style={[styles.box, { backgroundColor: COLORS.PINK }]}
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
        color={"white"}
        size={18}
      />
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  box: {
    position: "absolute",
    right: 40,
    bottom: 40,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
});
