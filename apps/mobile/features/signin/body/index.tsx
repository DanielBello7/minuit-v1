import AntDesign from "@expo/vector-icons/AntDesign";

import { AppInput, Formbox } from "@/components/form";
import { AppTouchable, ButtonA, ButtonTextA } from "@/components/themed";
import { InterText } from "@/components/themed/styled-text";
import { Dimensions, StyleSheet, View } from "react-native";
import { useLogic } from "./use-logic";
import { useThemeColor } from "@/hooks/use-theme-color";

const Width = Dimensions.get("screen").width;

type Props = {
  continue: (value: string) => void;
};

export const SigninBody = (props: Props) => {
  const logic = useLogic(props.continue);
  const color = useThemeColor("BUTTON_PRIMARY_FOREGROUND");
  return (
    <View style={styles.content}>
      {/* Header */}
      <View style={styles.segment}>
        <View style={styles.header}>
          <InterText
            style={styles.title}
            type="title"
          >
            Welcome Back
          </InterText>
          <InterText style={styles.subtitle}>
            Enter your email to sign in to your account
          </InterText>
        </View>
      </View>

      {/* Form */}
      <Formbox>
        <AppInput
          label="Email"
          placeholder="you@example.com"
          autoCorrect={false}
          keyboardType="email-address"
          autoCapitalize="none"
          value={logic.watch.email}
          isLoading={logic.handler.isLoading}
          onChangeText={(e) => {
            logic.form.setValue("email", e);
          }}
          style={{ letterSpacing: 0 }}
        />
        <ButtonA
          onPress={logic.submit}
          isLoading={logic.handler.isLoading}
        >
          <ButtonTextA>Continue</ButtonTextA>
          <AntDesign
            name="arrow-right"
            color={color}
            size={12}
            style={{ marginTop: 2 }}
          />
        </ButtonA>
      </Formbox>

      {/* Bottom */}
      <View style={styles.segment}>
        <View style={styles.footer_top}>
          <InterText style={styles.footer_text}>
            Don&apos;t have an account?{" "}
          </InterText>
          <AppTouchable onPress={logic.click}>
            <InterText style={styles.link}>Sign up</InterText>
          </AppTouchable>
        </View>
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
  footer_top: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  footer_text: {
    fontSize: 13,
    opacity: 0.8,
  },
  link: {
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  segment: {
    alignItems: "center",
    gap: 10,
  },
});
