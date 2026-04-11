import * as Animatable from "react-native-animatable";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect } from "react";
import {
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSonnerStore } from "./use-sonner.store";
import { InterText, ThemedView } from "../themed";
import { capitalize } from "@repo/libs";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "@/hooks/use-theme-color";

const edges = ["top"] as const;

export const SonnerBox = () => {
  const { data: state, hide } = useSonnerStore((state) => state);
  const { visible, msg, title, state: type, ref } = state;
  const border = useThemeColor("BORDER");
  const bg = useThemeColor("BASE");

  useEffect(() => {
    let timeout: number | undefined;
    if (visible) {
      timeout = setTimeout(() => {
        hide();
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [visible, hide]);

  return (
    <Animatable.View
      style={[styles.container]}
      ref={ref}
      delay={50}
      duration={500}
      direction={"normal"}
    >
      <TouchableWithoutFeedback onPress={hide}>
        <SafeAreaView
          style={styles.safe}
          edges={edges}
        >
          <ThemedView
            style={[
              styles.box,
              {
                borderColor: border,
                backgroundColor: bg,
              },
            ]}
          >
            <View style={{ paddingTop: 10 }}>
              <Ionicons
                name="alert-circle"
                color="black"
                size={15}
              />
            </View>
            <View
              style={{
                flex: 1,
                minWidth: 0,
                flexShrink: 1,
              }}
            >
              <InterText
                numberOfLines={1}
                style={[
                  styles.title,
                  type === "error" && { color: "red" },
                  type === "success" && { color: "green" },
                ]}
              >
                {title ?? capitalize(type)}
              </InterText>
              <InterText
                style={[styles.text]}
                numberOfLines={4}
              >
                {msg}
              </InterText>
            </View>
          </ThemedView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: -500,
    left: 0,
    width: "100%",
    height: 150,
    zIndex: 1000,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: "flex-end",
  },
  box: {
    flexDirection: "row",
    gap: 6,
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
    padding: 10,
    shadowColor: "rgb(99, 102, 241)",
    shadowOpacity: 0.6,
    shadowRadius: 100,
    shadowOffset: { width: 2, height: 2 },
    ...Platform.select({
      android: {
        elevation: 16,
      },
    }),
  },
  text: {
    fontSize: 14,
    lineHeight: 18,
  },
  title: {
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "400",
  },
  top: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  segment: {
    flex: 1,
    gap: 5,
    alignItems: "center",
    overflow: "hidden",
    flexDirection: "row",
  },
});
