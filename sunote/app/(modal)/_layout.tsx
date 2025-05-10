// app/modal/_layout.tsx
import React from "react";
import { useFonts } from "expo-font";
import { Tabs, Redirect, Stack, Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";

// SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  return (
    <Stack />
    // <View style={{ flex: 1,backgroundColor: 'rgba(0,0,0,0.35)', }}>
    // <Stack  screenOptions={{ headerShown: false }}>
    //   <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }}>
    //     <Stack.Screen
    //       name="sign-up"
    //       options={{
    //         presentation: "transparentModal",
    //         animation: "slide_from_bottom",
            
    //       }}
    //     />
    //   </View>
    // </Stack>
    // </View>
  );
}
