import { ThemedSafeArea } from "@/components/themed";
import { InterText } from "@/components/themed/styled-text";
import { Dimensions, StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "@/components/ui";
import { WebLink } from "@/components/ui/web-link";
import { Blob } from "@/components/ui/blob";
import { Icon } from "@/components/icon";
import { useLogic } from "./use-logic";

const Width = Dimensions.get("screen").width;

export const SignUp = () => {
  const logic = useLogic();
  return (
    <ThemedSafeArea>
      {/* Background decorations */}
      <Blob />
      <KeyboardAvoidingView style={styles.flex}>
        <View style={styles.content}>
          {/* Top */}
          <View style={styles.segment}>
            <Icon />
          </View>

          {logic.multiscreen.screen.component}

          {/* prettier-ignore */}
          <View style={styles.segment}>
            <InterText style={styles.terms_text}>
              By continuing, you agree to our <WebLink href={"https://minuit.site/legal#terms"}>Terms of Service</WebLink> and <WebLink href={"https://minuit.site/legal#policies"}>Privacy Policy</WebLink>.
            </InterText>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedSafeArea>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  content: {
    width: Width > 402 ? 360 : "100%",
    gap: 24,
  },
  terms_text: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    opacity: 0.7,
    textAlign: "center",
  },
  segment: {
    alignItems: "center",
    gap: 10,
  },
});
