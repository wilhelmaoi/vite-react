import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { DrawerActions, useNavigation } from "@react-navigation/native";

// 使用更简单的props，避免类型错误
export default function CustomTopTabBar(props: any) {
  const { state, descriptors, navigation } = props;
  const theme = useTheme(); // 🔥 获取主题颜色
  const drawerNavigation = useNavigation(); // 获取导航对象用于操作抽屉
  
  // 打开侧边栏的处理函数
  const handleOpenDrawer = () => {
    drawerNavigation.dispatch(DrawerActions.openDrawer());
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 左侧按钮 */}
      <TouchableOpacity onPress={handleOpenDrawer}>
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
      <TouchableOpacity onPress={() => console.log("Right pressed")}>
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
  centerTabs: {
    flexDirection: "row",
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
