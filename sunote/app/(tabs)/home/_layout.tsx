// app/(tabs)/_layout.tsx
import React from "react";
import { useFonts } from "expo-font";
import { Tabs, Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Colors } from "react-native/Libraries/NewAppScreen";
import { Appbar } from "react-native-paper";
import ThemeToggleButton from "../../../src/theme/ThemeToggleButton";
import { useTheme } from "../../../src/theme/ThemeContext";

// SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  
  const theme = useTheme(); // 🔥 获取主题颜色
  return <Tabs
  screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: "#673ab7",
    tabBarInactiveTintColor: "#B59DDDFF",
    tabBarLabelStyle: { fontSize: 12 },
    tabBarStyle: { 
      height: 80, 
      backgroundColor: theme.colors.background, // ✅ 动态背景色 
      borderBottomWidth: 0, // 可选，去掉下边框
      // borderTopWidth: 0, // 可选，去掉下边框
      elevation: 0,      // 安卓去阴影
    },
    tabBarPosition: "top",
    
    // headerShown: false
  }}
>
 
  <Tabs.Screen name="hot" options={{ title: "首页"}}/>
  <Tabs.Screen name="sub" options={{ title: "消息" }} />
  {/* <Tabs.Screen name="(mine)" options={{ title: "我的" ,tabBarIcon: ({ color }) => <AntDesign name="user" size={28}  color={color}  />, headerShown: false}} /> */}


</Tabs> ;
}
