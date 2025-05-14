// app/_layout.tsx
import React from "react";
import { useFonts } from "expo-font";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useAuthStore, useMaskStore, useThemeStore } from "../src/context/store";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { ThemeProvider, useTheme } from "../src/theme/ThemeContext";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CustomDrawerContent from "../src/components/CustomDrawerContent";
import TabsNavigator from "../src/navigation/TabsNavigator";

const Drawer = createDrawerNavigator();

// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // const scheme = useColorScheme();
  // const paperTheme = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const Theme = useTheme(); // 动态导航主题
  const mode = useThemeStore((state) => state.mode);
  // const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { visible } = useMaskStore();
  const StatusBarColor = visible === false ? "transparent" : "rgba(0, 0, 0, 0.25)"; 

  return (
    <NavigationContainer
      theme={mode === "dark" ? DarkTheme : DefaultTheme}
    >
    <SafeAreaView style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      <ThemeProvider>
        {/* 根据主题控制状态栏字色 */}
        <StatusBar
          style={mode === "dark" ? "light" : "dark"}
          // backgroundColor={Theme.colors.background}
          translucent={true}
          backgroundColor = {StatusBarColor}
        />

          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(drawer)" />
            <Stack.Screen
              name="sign-in"
              options={{
                presentation: "modal",
              }}
            />
          </Stack>

      </ThemeProvider>
    </SafeAreaView>
    </NavigationContainer>
  );
}
