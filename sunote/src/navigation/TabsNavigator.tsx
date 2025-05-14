import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme } from '../theme/ThemeContext';
import CustomTopTabBar from '../components/CustomTopTabBar';
import HomeScreen from '../screens/HomeScreen';
import SubScreen from '../screens/SubScreen';

const Tab = createMaterialTopTabNavigator();

export default function TabsNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTopTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: '首页',
        }}
      />
      <Tab.Screen
        name="Sub"
        component={SubScreen}
        options={{
          title: '消息',
        }}
      />
    </Tab.Navigator>
  );
} 