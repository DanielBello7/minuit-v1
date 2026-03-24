import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="recovery.screen" />
      <Stack.Screen name="signin.screen" />
      <Stack.Screen name="signup.screen" />
    </Stack>
  );
}
