import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";

import { AppInput, Formbox } from "@/components/form";
import { AppTouchable, ButtonA, ButtonTextA } from "@/components/themed";
import { InterText } from "@/components/themed/styled-text";
import { StyleSheet, View } from "react-native";
import { useLogic } from "./use-logic";
import { useThemeColor } from "@/hooks/use-theme-color";

type Props = {
  continue: (val: string) => void;
};
export const SignupBody = (props: Props) => {
  const logic = useLogic(props);
  const border = useThemeColor("ICON");
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
            Create Account
          </InterText>
          <InterText style={styles.subtitle}>
            Enter your details to create a new account
          </InterText>
        </View>
      </View>

      {/* Form */}
      <Formbox>
        <AppInput
          label="Name"
          placeholder="John doe"
          autoCorrect={false}
          isLoading={logic.handler.isLoading}
          autoComplete="off"
          value={logic.watch.name}
          onChangeText={(e) => {
            logic.form.setValue("name", e);
          }}
          icon={
            <Feather
              name="user"
              size={16}
              color={border}
            />
          }
        />
        <AppInput
          label="Email"
          placeholder="you@example.com"
          autoCorrect={false}
          autoComplete="off"
          keyboardType="email-address"
          autoCapitalize="none"
          isLoading={logic.handler.isLoading}
          value={logic.watch.email}
          onChangeText={(e) => {
            logic.form.setValue("email", e);
          }}
          icon={
            <MaterialIcons
              name="mail-outline"
              size={16}
              color={border}
            />
          }
        />
        <ButtonA
          onPress={logic.submit}
          isLoading={logic.handler.isLoading}
        >
          <ButtonTextA>Continue</ButtonTextA>
          <AntDesign
            name="arrow-right"
            color={color}
            size={14}
          />
        </ButtonA>
      </Formbox>

      {/* Bottom */}
      <View style={styles.segment}>
        <View style={styles.footer_top}>
          <InterText style={styles.footer_text}>
            Already have an account?{" "}
          </InterText>
          <AppTouchable onPress={logic.click}>
            <InterText style={styles.link}>Sign in</InterText>
          </AppTouchable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    width: "100%",
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
