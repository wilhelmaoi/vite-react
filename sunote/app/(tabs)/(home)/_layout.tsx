// app/(tabs)/_layout.tsx
import React from "react";
import { useFonts } from "expo-font";
import { Tabs, Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
{/* <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#673ab7",
        tabBarInactiveTintColor: "#B59DDDFF",
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: { height: 60 },
        tabBarPosition: "bottom",
      }}
    >
     
      <Tabs.Screen name="(home)" options={{ title: "首页",tabBarIcon: ({ color }) => <AntDesign name="home" size={28} color={color} />,  headerShown: false}} />
      <Tabs.Screen name="Community" options={{ title: "消息" ,tabBarIcon: ({ color }) => <AntDesign name="mail" size={28}  color={color} />, headerShown: false}} />
      <Tabs.Screen name="(mine)" options={{ title: "我的" ,tabBarIcon: ({ color }) => <AntDesign name="user" size={28}  color={color}  />, headerShown: false}} />
    </Tabs> */}
  return <Stack screenOptions={{headerShown: false}}/>;
}
