// app/(tabs)/_layout.tsx
import React from "react";
import { useFonts } from "expo-font";
import { Redirect, Stack, useRouter, withLayoutContext } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { Appbar } from "react-native-paper";
import ThemeToggleButton from "../../../src/theme/ThemeToggleButton";
import { useTheme } from "../../../src/theme/ThemeContext";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Tabs } from "expo-router";
import { Text } from "react-native-paper";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CustomTopTabBar from "../../../src/components/CustomTopTabBar";

// SplashScreen.preventAutoHideAsync();
export default function Layout() {
  const theme = useTheme(); // 🔥 获取主题颜色
  // const navigation = useNavigation();
  const router = useRouter();

  return (

    <Tabs

      tabBar={(props) => <CustomTopTabBar {...props} />}
      screenOptions={{
        headerShown: false,

        tabBarPosition: "top",

        tabBarActiveTintColor: theme.colors.primary, // 选中颜色
        tabBarInactiveTintColor: theme.colors.secondary, // 未选中颜色
        tabBarLabelStyle: { fontSize: 16 },
        tabBarStyle: {
          height: 60,
          backgroundColor: theme.colors.background, // ✅ 动态背景色
          borderBottomWidth: 0, // 可选，去掉下边框
          // borderTopWidth: 0, // 可选，去掉下边框
          elevation: 0, // 安卓去阴影
        },
        tabBarShowLabel: true,
        tabBarIconStyle: {
          display: "none", // 隐藏图标
        },
      }}
    >

      <Tabs.Screen
        name="hot"
        options={{
          title: "首页",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="sub"
        options={{
          title: "消息",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
