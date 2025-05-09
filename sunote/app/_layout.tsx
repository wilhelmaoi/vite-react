// app/_layout.tsx
import React from "react";
import { useFonts } from "expo-font";
import { Redirect, router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useAuthStore, useThemeStore } from "../src/context/store";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { Provider as PaperProvider, Surface } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";
import { ThemeProvider, useTheme } from "../src/theme/ThemeContext";

// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // const scheme = useColorScheme();
  // const paperTheme = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const Theme = useTheme(); // 动态导航主题
  const mode = useThemeStore((state) => state.mode);
  // const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      <ThemeProvider>
        {/* 根据主题控制状态栏字色 */}
        <StatusBar
          style={mode === "dark" ? "light" : "dark"}
          // backgroundColor={Theme.colors.primary}
          translucent={true}
        />

        {/* <Surface> */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="sign-in"
            options={{
              presentation: "modal",
            }}
          />
        </Stack>
      </ThemeProvider>
    </SafeAreaView>
  );
}
