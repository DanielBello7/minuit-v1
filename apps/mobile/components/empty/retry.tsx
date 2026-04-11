import { AppTouchable, InterText } from "@/components/themed";
import { COLORS } from "@/constants/themes/colors";
import { with_alpha } from "@/libs/with-alpha";
import { StyleSheet } from "react-native";

type Props = {
  action?: () => void;
  title?: string;
};
export const Retry = (props: Props) => {
  return (
    <AppTouchable
      style={styles.btn}
      onPress={props.action}
    >
      <InterText style={styles.txt}>{props.title ?? "Retry"}</InterText>
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    backgroundColor: with_alpha(COLORS.PINK, 0.1),
  },
  txt: {
    fontSize: 18,
  },
});
