import { AppTouchable, InterText } from "@/components/themed";
import { COLORS } from "@/constants/themes/colors";
import { StyleSheet } from "react-native";

type Props = {
  action: () => void;
};
export const Reset = (props: Props) => {
  return (
    <AppTouchable onPress={props.action}>
      <InterText style={styles.text}>Reset</InterText>
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  text: {
    color: COLORS.PINK,
    fontWeight: "600",
    fontSize: 17,
  },
});
