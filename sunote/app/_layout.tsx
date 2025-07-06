// app/_layout.tsx
import React from "react";
import { useFonts } from "expo-font";
import { Redirect, Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useAuthStore, useMaskStore, useThemeStore, useNavigationStore } from "../src/context/store";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { ThemeProvider, useTheme } from "../src/theme/ThemeContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Dimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { initDatabase } from "../src/database/sqlite"; // 导入初始化数据库函数
import { getToken } from "../src/context/secureStore";
import { Drawer } from "expo-router/drawer";
import CustomDrawerContent from "../src/components/CustomDrawerContent";

const SCREEN_WIDTH = Dimensions.get('window').width;

// SplashScreen.preventAutoHideAsync();

function AppContent() {
  const theme = useTheme();
  const mode = useThemeStore((state) => state.mode);
  const currentTab = useNavigationStore((state) => state.currentTab);
  const pathname = usePathname();
  const setCurrentTab = useNavigationStore((state) => state.setCurrentTab);
  
  // 从路径中提取当前标签名
  useEffect(() => {
    const pathParts = pathname.split('/');
    const currentTabFromPath = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2] || '';
    console.log("当前路径：", pathname);
    console.log("当前提取的Tab：", currentTabFromPath);
    setCurrentTab(currentTabFromPath);
  }, [pathname, setCurrentTab]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: theme.colors.background,
            width: SCREEN_WIDTH * 0.8,
          },
          drawerType: "front",
          overlayColor: 'rgba(0,0,0,0.5)',
          swipeEnabled: true,
          swipeEdgeWidth: 30,
          drawerPosition: "left",
          drawerStatusBarAnimation: "slide",
        }}
      >
        <Drawer.Screen 
          name="(tabs)" 
          options={{
            drawerLabel: "主页",
            swipeEnabled: true,
          }}
        />
        <Drawer.Screen 
          name="sign-in" 
          options={{
            drawerLabel: "登录",
            swipeEnabled: false,
          }}
        />
        <Drawer.Screen 
          name="register" 
          options={{
            drawerLabel: "注册",
            swipeEnabled: false,
          }}
        />
        <Drawer.Screen 
          name="sponsor" 
          options={{
            drawerLabel: "赞助",
            swipeEnabled: false,
          }}
        />
        <Drawer.Screen 
          name="(screen)" 
          options={{
            drawerLabel: "其他页面",
            swipeEnabled: false,
          }}
        />
        <Drawer.Screen 
          name="chat" 
          options={{
            drawerLabel: "聊天",
            swipeEnabled: false,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const theme = useTheme();
  const mode = useThemeStore((state) => state.mode);

  // 应用启动时初始化数据库
  useEffect(() => {
    initDatabase();
  }, []);

  return (
      <SafeAreaView style={{ flex: 1,backgroundColor:theme.colors.background  }} edges={['bottom']}>
      <StatusBar
        style={mode === "dark" ? "light" : "dark"}
        translucent={true}
      />
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>

      </SafeAreaView>
  );
}


