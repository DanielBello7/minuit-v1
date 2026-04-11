import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Tabs } from "expo-router";
import { COLOR_THEMES } from "@/constants/themes/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CustomTabBar } from "@/components/tab";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: COLOR_THEMES[colorScheme ?? "light"].TINT,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { position: "absolute" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Feather
              size={22}
              name="globe"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="alarms"
        options={{
          title: "Alarms",
          tabBarIcon: ({ color }) => (
            <Ionicons
              size={22}
              name="alarm-outline"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <Feather
              size={22}
              name="user"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
