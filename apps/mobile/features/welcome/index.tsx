import { Dimensions, StyleSheet, View } from "react-native";
import {
  ButtonA,
  ButtonB,
  ButtonTextA,
  ButtonTextB,
  ThemedSafeArea,
  ThemedView,
} from "@/components/themed";
import { InterText } from "@/components/themed/styled-text";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { useThemeColor } from "@/hooks/use-theme-color";

const Width = Dimensions.get("screen").width;

export const Welcome = () => {
  const bg = useThemeColor("BASE");
  const router = useRouter();
  const signin = () => router.replace("/(main)/(auth)/signin.screen");
  const signup = () => router.replace("/(main)/(auth)/signup.screen");

  return (
    <ThemedSafeArea style={{ backgroundColor: bg }}>
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.icon}>
              <Feather
                name="clock"
                color="#111827"
                size={24}
              />
            </View>
            <InterText style={styles.appTitle}>World Clock</InterText>
          </View>

          <View style={styles.header}>
            <InterText
              style={styles.title}
              type="title"
            >
              Track time around the world
            </InterText>
            <InterText style={styles.subtitle}>
              Stay on top of different time zones with a clean, focused
              world clock.
            </InterText>
          </View>

          <View style={styles.actions}>
            <ButtonA onPress={signup}>
              <ButtonTextA>Continue with email</ButtonTextA>
            </ButtonA>
            <ButtonB onPress={signin}>
              <ButtonTextB>I already have an account</ButtonTextB>
            </ButtonB>
          </View>
        </View>
      </ThemedView>
    </ThemedSafeArea>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "transparent",
  },
  content: {
    width: Width > 402 ? 360 : "100%",
    gap: 32,
  },
  iconContainer: {
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  appTitle: {
    fontSize: 14,
    letterSpacing: 1,
    textTransform: "uppercase",
    opacity: 0.7,
  },
  header: {
    gap: 12,
  },
  title: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    opacity: 0.8,
  },
  actions: {
    gap: 12,
  },
});
