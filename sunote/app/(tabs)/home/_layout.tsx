// app/(tabs)/_layout.tsx
import React from "react";
import { useFonts } from "expo-font";
import { Redirect, Stack, useRouter } from "expo-router";
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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawerContent from "../../../src/components/CustomDrawerContent";
import { Dimensions } from "react-native";

const Drawer = createDrawerNavigator();
const SCREEN_WIDTH = Dimensions.get('window').width;

// SplashScreen.preventAutoHideAsync();
export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      tabBar={(props) => <CustomTopTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: "top",
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondary,
        tabBarLabelStyle: { fontSize: 16 },
        tabBarStyle: {
          height: 60,
          backgroundColor: theme.colors.background,
          borderBottomWidth: 0,
          elevation: 0,
        },
        tabBarShowLabel: true,
        tabBarIconStyle: {
          display: "none",
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

// export default function Layout() {
//   const theme = useTheme();

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <Drawer.Navigator
//         drawerContent={(props) => <CustomDrawerContent {...props} />}
//         screenOptions={{
//           headerShown: false,
//           drawerStyle: {
//             backgroundColor: theme.colors.background,
//             width: SCREEN_WIDTH * 0.8,
//           },
//           drawerType: "front",
//           overlayColor: 'rgba(0,0,0,0.5)',
//           swipeEnabled: true,
//           drawerPosition: "left",
//           drawerStatusBarAnimation: "slide",
//         }}
//       >
//         <Drawer.Screen 
//           name="tabs" 
//           component={TabsLayout}
//           options={{
//             drawerLabel: "主页"
//           }}
//         />
//       </Drawer.Navigator>
//     </GestureHandlerRootView>
//   );
// }
