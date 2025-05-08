// app/(tabs)/_layout.tsx
import React from "react";
import { useFonts } from "expo-font";
import { Tabs, Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// SplashScreen.preventAutoHideAsync();
export default function RootLayout() {

  return <Stack  screenOptions={{headerShown: false}}/>;
}
