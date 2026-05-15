import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Toaster } from "sonner-native";

import TanstackProvider from "@/components/providers/tanstack-provider";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const token = useAuthStore((state) => state.user?.token);
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const prepare = async () => {
      await useAuthStore.persist.rehydrate();
      setIsReady(true);
      await SplashScreen.hideAsync();
    };

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TanstackProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack screenOptions={{ headerShown: false }}>
              {token ? (
                <Stack.Screen name="(app)" />
              ) : (
                <Stack.Screen name="(auth)" />
              )}
            </Stack>
            <StatusBar style="auto" />
            <Toaster />
          </ThemeProvider>
        </TanstackProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
