import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="personal" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="security" />
      <Stack.Screen name="general" />
      <Stack.Screen name="support" />
    </Stack>
  );
}
