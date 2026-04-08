import * as Haptics from "expo-haptics";

import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, View } from "react-native";
import { PlatformPressable } from "@react-navigation/elements";
import { Edge, SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/themes/colors";
import { useThemeColor } from "@/hooks/use-theme-color";

const edges: Edge[] = ["bottom"];

export const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const bg = useThemeColor("TAB_BAR_BACKGROUND");
  const fg = useThemeColor("TAB_BAR_FOREGROUND");
  const bd = useThemeColor("BUTTON_SECONDARY_BORDER");
  return (
    <SafeAreaView
      style={styles.container}
      edges={edges}
    >
      <View style={[styles.box, { backgroundColor: bg, borderColor: bd }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }

            // Haptic feedback
            if (process.env.EXPO_OS === "ios") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <PlatformPressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[styles.tab, isFocused && { backgroundColor: fg }]}
            >
              {options.tabBarIcon &&
                options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? COLORS.PINK : "#999",
                  size: 24,
                })}
            </PlatformPressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    elevation: 0,
    width: "100%",
  },
  box: {
    flexDirection: "row",
    borderRadius: 999,
    gap: 10,
    padding: 6,
    borderWidth: 1,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 999,
  },
  text: {
    fontSize: 10,
    fontWeight: "500",
    color: "#999",
  },
  focused: {
    color: COLORS.PINK,
    fontFamily: "QuicksandBold",
  },
});
