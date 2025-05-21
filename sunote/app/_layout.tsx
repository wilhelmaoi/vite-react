// app/_layout.tsx
import React from "react";
import { useFonts } from "expo-font";
import { Redirect, Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useAuthStore, useMaskStore, useThemeStore, useNavigationStore } from "../src/context/store";
import { StatusBar } from "expo-status-bar";
import { DarkTheme, DefaultTheme, NavigationContainer, ParamListBase, RouteProp } from "@react-navigation/native";
import {  useColorScheme } from "react-native";
import { ThemeProvider, useTheme } from "../src/theme/ThemeContext";
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CustomDrawerContent from "../src/components/CustomDrawerContent";
import { Dimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { initDatabase } from "../src/database/sqlite"; // 导入初始化数据库函数

const Drawer = createDrawerNavigator();
const SCREEN_WIDTH = Dimensions.get('window').width;

// SplashScreen.preventAutoHideAsync();

// 定义路由组件
function TabsScreen() {
  return <Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(tabs)" /></Stack>;
}

function SignInScreen() {
  return <Stack screenOptions={{ headerShown: false }}><Stack.Screen name="sign-in" options={{ presentation: "modal" }} /></Stack>;
}

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

      
      <Drawer.Navigator
        drawerContent={(props: DrawerContentComponentProps) => <CustomDrawerContent {...props} />}
        screenOptions={({ route }: { route: RouteProp<ParamListBase, keyof ParamListBase> }) => {
          const swipeEnabledScreens = ['hot', 'sub'];
          const isSwipeEnabled = swipeEnabledScreens.includes(currentTab);

          return {
            headerShown: false,
            drawerStyle: {
              backgroundColor: theme.colors.background,
              width: SCREEN_WIDTH * 0.8,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            },
            drawerType: "front",
            overlayColor: 'rgba(0,0,0,0.5)',
            swipeEnabled: isSwipeEnabled,
            swipeEdgeWidth: isSwipeEnabled ? 30 : 0,
            drawerPosition: "left",
            drawerStatusBarAnimation: "slide",
          };
        }}
      >
        <Drawer.Screen 
          name="tabs" 
          component={TabsScreen}
          options={{
            drawerLabel: "主页",
            swipeEnabled: true,
          }}
        />
        <Drawer.Screen 
          name="signin" 
          component={SignInScreen}
          options={{
            drawerLabel: "登录",
            swipeEnabled: false,
          }}
        />
      </Drawer.Navigator>

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
    <NavigationContainer theme={mode === "dark" ? DarkTheme : DefaultTheme}>
      <SafeAreaView style={{ flex: 1,backgroundColor:theme.colors.background  }} edges={['bottom']}>
      <StatusBar
        style={mode === "dark" ? "light" : "dark"}
        translucent={true}
      />
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>

      </SafeAreaView>
    </NavigationContainer>
  );
}


