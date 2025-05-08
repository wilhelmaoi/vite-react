// app/_layout.tsx
import React from "react";
import { useFonts } from "expo-font";
import { Redirect, router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useAuthStore } from "../src/context/store";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { StatusBar, useColorScheme } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";
import { ThemeProvider } from "../src/theme/ThemeContext";

// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme();
  // const paperTheme = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const Theme = scheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider>
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
  );
}
