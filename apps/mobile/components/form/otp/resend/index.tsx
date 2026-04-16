import { AppTouchable, InterText } from "@/components/themed";
import { COLORS } from "@/constants/themes/colors";
import { StyleSheet } from "react-native";
import { useLogic } from "./use-logic";
import { OTP_TYPE } from "../use-logic";

type Props = {
  email: string;
  type: OTP_TYPE;
};
export const Resend = (props: Props) => {
  const logic = useLogic(props.email, props.type);
  return (
    <AppTouchable onPress={logic.resend}>
      <InterText style={styles.text}>
        {logic.isDisabled
          ? `Resend Code in ${logic.timeLeft}s`
          : "Resend Code"}
      </InterText>
    </AppTouchable>
  );
};

const styles = StyleSheet.create({
  text: {
    color: COLORS.PINK,
    fontSize: 12,
    lineHeight: 12,
  },
});
