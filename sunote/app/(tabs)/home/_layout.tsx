// app/(tabs)/home/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import { useTheme } from "../../../src/theme/ThemeContext";
import CustomTopTabBar from "../../../src/components/CustomTopTabBar";

export default function HomeLayout() {
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
          backgroundColor: theme.colors.background,
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
          title: "热门",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="sub"
        options={{
          title: "关注",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

