import AntDesign from "@expo/vector-icons/AntDesign";

import { Formbox } from "@/components/form/formbox";
import { AppTouchable, ButtonA, ButtonTextA } from "@/components/themed";
import { InterText } from "@/components/themed/styled-text";
import { Dimensions, StyleSheet, View } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { OTP_TYPE, useLogic } from "./use-logic";
import { Resend } from "./resend";
import { COLORS } from "@/constants/themes/colors";
import { OtpInput } from "./otp-input";

const Width = Dimensions.get("screen").width;

type Props = {
  type: OTP_TYPE;
  email: string;
  oncomplete: (value: string) => Promise<void>;
  back: () => void;
};

export const OTP = (props: Props) => {
  const logic = useLogic(props);
  const text = useThemeColor("BUTTON_PRIMARY_FOREGROUND");

  return (
    <View style={styles.content}>
      {/* Header */}
      <View style={styles.segment}>
        <View style={styles.header}>
          <InterText
            style={styles.title}
            type="title"
          >
            Check your inbox
          </InterText>
          <InterText style={styles.subtitle}>
            We&apos;ve sent a code to{" "}
            {props.email.trim().length > 0
              ? props.email
              : "email@example.com"}
          </InterText>
        </View>
      </View>

      <View style={[styles.segment, styles.top]}>
        <InterText style={styles.txt}>Verification Code</InterText>
        <AppTouchable onPress={props.back}>
          <InterText style={styles.link}>Change email</InterText>
        </AppTouchable>
      </View>

      {/* Form */}
      <Formbox>
        <OtpInput
          isLoading={logic.isLoading}
          value={logic.values.token ?? ""}
          setValue={(value) => {
            logic.form.setValue("token", value);
          }}
        />
        <ButtonA
          onPress={logic.submit}
          isLoading={logic.isLoading}
          disabled={
            !logic.values.token
              ? true
              : logic.values.token.length > 5
                ? false
                : true
          }
        >
          <ButtonTextA>
            Verify & {props.type === "SIGNIN" ? "Sign In" : "Sign Up"}
          </ButtonTextA>
          <AntDesign
            name="check-circle"
            color={text}
            size={15}
          />
        </ButtonA>
      </Formbox>

      {/* Bottom */}
      <View style={styles.segment}>
        <Resend
          email={props.email}
          type={props.type}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    width: Width > 402 ? 360 : "100%",
    gap: 24,
  },
  header: {
    gap: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  link: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.PINK,
  },
  segment: {
    alignItems: "center",
    gap: 10,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  txt: {
    fontSize: 12,
    fontWeight: "800",
  },
});
