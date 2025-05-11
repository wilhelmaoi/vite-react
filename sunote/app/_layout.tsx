// app/_layout.tsx
import React from "react";
import { useFonts } from "expo-font";
import { Redirect, router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useAuthStore, useMaskStore, useThemeStore } from "../src/context/store";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useColorScheme, View } from "react-native";
import { Provider as PaperProvider, Surface } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";
import { ThemeProvider, useTheme } from "../src/theme/ThemeContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // const scheme = useColorScheme();
  // const paperTheme = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const Theme = useTheme(); // 动态导航主题
  const mode = useThemeStore((state) => state.mode);
  // const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { visible,setVisible } = useMaskStore();
  const StatusBarColor = visible === false ? "transparent" : "rgba(0, 0, 0, 0.6)"; 

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      <ThemeProvider>
        {/* 根据主题控制状态栏字色 */}
        <StatusBar
          style={mode === "dark" ? "light" : "dark"}
          // backgroundColor={Theme.colors.background}
          translucent={true}
          backgroundColor = {StatusBarColor}
        />
        <GestureHandlerRootView style={{ flex: 1 }}>
          {/* <Surface> */}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            {/* <Stack.Screen name="drawer" /> */}
            <Stack.Screen
              name="sign-in"
              options={{
                presentation: "modal",
              }}
            />
            {/* <Stack.Screen name="modal/greyMask"/> */}
            <Stack.Screen
              name="(modal)"
              options={{
                presentation: "modal",
                headerShown: false,
                // contentStyle: { backgroundColor: 'rgba(0,0,0,0.35)' },
              }}
            />
          </Stack>
        </GestureHandlerRootView>
      </ThemeProvider>
    </SafeAreaView>
  );
}
