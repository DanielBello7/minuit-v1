import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Tabs } from "expo-router";
import { CustomTabBar } from "@/components/c-tab";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function TabLayout() {
  const tint = useThemeColor("TINT");

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        lazy: false,
        tabBarActiveTintColor: tint,
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
