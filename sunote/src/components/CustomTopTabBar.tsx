import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";

// 使用更简单的props，避免类型错误
export default function CustomTopTabBar(props: any) {
  const { state, descriptors, navigation } = props;
  const theme = useTheme();
  const drawerNavigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 左侧按钮 */}
      <TouchableOpacity 
        onPress={() => drawerNavigation.dispatch(DrawerActions.openDrawer())}
        style={styles.iconButton}
      >
        <MaterialIcons name="menu" size={24} color={theme.colors.primary} />
      </TouchableOpacity>

      {/* 中间 Tabs */}
      <View style={styles.centerTabs}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.tabItem, isFocused && { ...styles.tabItemActive, borderBottomColor: theme.colors.primary }]}
            >
              <Text style={{ color: isFocused ? theme.colors.primary : theme.colors.secondary, fontSize: 16 }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 右侧按钮 */}
      <TouchableOpacity style={styles.iconButton}>
        <MaterialIcons name="search" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerTabs: {
    flex: 1,
    flexDirection: "row",
    justifyContent: 'center',
    gap: 20,
  },
  tabItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tabItemActive: {
    borderBottomWidth: 2,
  },
});
