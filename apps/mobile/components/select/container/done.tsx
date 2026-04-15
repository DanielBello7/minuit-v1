import { AppTouchable, InterText } from "@/components/themed";
import { COLORS } from "@/constants/themes/colors";
import { StyleSheet } from "react-native";

type Props = {
  action: () => void;
};

export const Done = (props: Props) => {
  return (
    <AppTouchable onPress={props.action}>
      <InterText style={styles.btn}>Done</InterText>
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  btn: {
    color: COLORS.PINK,
    fontWeight: "600",
  },
});
