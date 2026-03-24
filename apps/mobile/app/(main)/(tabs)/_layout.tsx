import { HapticTab } from "@/components/haptic-tab";
import { Tabs } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { COLOR_THEMES } from "@/constants/themes/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLOR_THEMES[colorScheme ?? "light"].TINT,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="house.fill"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
