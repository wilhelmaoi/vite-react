// app/(tabs)/_layout.tsx
import React from "react";
import { useFonts } from "expo-font";
import { Tabs, Redirect } from "expo-router";
import { useAuthStore, useThemeStore } from "../../src/context/store";
import { FontAwesome } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react"
import { getToken } from "../../src/context/secureStore"; // SecureStore相关
import AntDesign from '@expo/vector-icons/AntDesign';
import { useTheme } from "../../src/theme/ThemeContext";
import { Surface } from "react-native-paper";


// import userDrawer from "./(drawer)/_layout";

// SplashScreen.preventAutoHideAsync();
export default function TabLayout() {
  const token = getToken();
  const theme = useTheme(); // 🔥 获取主题颜色
  const mode = useThemeStore((state) => state.mode);

  if (!token) {
    return <Redirect href="/sign-in" />;
  }
  return( 
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: theme.colors.primary, // 选中颜色
        // tabBarInactiveTintColor: "#673ab7",
        tabBarInactiveTintColor: theme.colors.secondary, // 未选中颜色
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: { 
          height: 60,
          backgroundColor: theme.colors.background, // ✅ 动态背景色
          // opacity: 0.8, // 设置 80% 不透明度
          borderTopColor: theme.colors.outlineVariant, // 分隔线颜色
          borderTopWidth: 0, // 可选，去掉上边框
          elevation: 0,      // 安卓去阴影
         },
        tabBarPosition: "bottom",

      }}
    >
      <Tabs.Screen name="home" options={{ title: "首页",tabBarIcon: ({ color }) => <AntDesign name="home" size={28} color={color} />,  headerShown: false,}} />
      <Tabs.Screen name="DayUp" options={{ title: "打卡" ,tabBarIcon: ({ color }) => <AntDesign name="clockcircleo" size={28}  color={color}  />, headerShown: false}} />
      <Tabs.Screen name="Post" 
      options={{  
        tabBarIcon: ({ color }) =>(
          <Surface
          style={{
            backgroundColor: theme.colors.primary,         // 或主题色
            borderRadius: 12,                // 圆角矩形
            // padding: 6,
            alignItems: 'center',
            justifyContent: 'center',
            height: 45, // 100% 高度
            width: 70,  
            // 可选阴影等
          }}
        >
          <AntDesign name="pluscircleo" size={32}  color={theme.colors.onPrimary} />
          </Surface>

        ), 
        tabBarIconStyle: { marginTop: 5 }, // 只让icon整体下移
        tabBarLabel: '',   // 或 tabBarLabel: () => null, 
        title: '',         // 保险起见 title 也设空 
        headerShown: false
      }} 
        />
      <Tabs.Screen name="Community" 
      options={{ 
        title: "消息" ,
        tabBarIcon: ({ color }) => <AntDesign name="mail" size={28}  color={color} />,
        headerShown: false,
      }} 
        />
      <Tabs.Screen name="mine" options={{ title: "我的" ,tabBarIcon: ({ color }) => <AntDesign name="user" size={28}  color={color}  />, headerShown: false}} />
    </Tabs>
  )

}


