import React from 'react';
import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from '../../src/components/CustomDrawerContent';
import { useTheme } from '../../src/theme/ThemeContext';
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function DrawerLayout() {
  const theme = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: theme.colors.background,
            width: 280,
          },
          drawerType: "front",
          overlayColor: 'rgba(0,0,0,0.5)',
          swipeEnabled: true,
        }}
      >
        <Drawer.Screen 
          name="index" 
          options={{ 
            headerShown: false,
            drawerLabel: "主页"
          }} 


        />
      </Drawer>
    </GestureHandlerRootView>
  );
} 