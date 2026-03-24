import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useEffect } from "react";
import { SplashScreen, Stack, useNavigation } from "expo-router";
import { useFonts } from "expo-font";
import { Platform, StyleSheet, View, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "react-query";
import { FONTS_OBJ } from "@/constants/assets/fonts";
import { SonnerBox } from "@/components/sonner";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "index",
  initialRouteName: "index",
};

const client = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const navigation = useNavigation();
  const colors = useColorScheme();
  const [loaded, error] = useFonts({
    ...FONTS_OBJ,
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    const remove = navigation.addListener("beforeRemove", (event) => {
      if (Platform.OS === "android") {
        if (event.data.action.type === "GO_BACK") {
          event.preventDefault();
        }
      }
    });
    return remove;
  }, [navigation]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>
        <ThemeProvider
          value={colors === "dark" ? DarkTheme : DefaultTheme}
        >
          <View style={styles.container}>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(main)" />
            </Stack>
            <SonnerBox />
          </View>
          <StatusBar
            animated={true}
            barStyle={Platform.OS === "ios" ? "default" : "dark-content"}
            translucent={true}
            backgroundColor="transparent"
          />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  flex: {
    flex: 1,
  },
});

export default RootLayout;
