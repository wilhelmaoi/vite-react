import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { DrawerActions, useNavigation } from "@react-navigation/native";

// 使用更简单的props，避免类型错误
export default function CustomTopTabBar(props: any) {
  const { state, descriptors, navigation } = props;
  const theme = useTheme();
  const drawerNavigation = useNavigation();

  // 获取状态栏高度增加了状态栏高度的动态计算：
  // 在 iOS 上使用固定值 44
  // 在 Android 上使用 StatusBar.currentHeight 或默认值 24
  const STATUSBAR_HEIGHT =
    Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: STATUSBAR_HEIGHT + 0, // 状态栏高度 + 额外边距
        },
      ]}
    >
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
              type: "tabPress",
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
              style={[
                styles.tabItem,
                isFocused && {
                  ...styles.tabItemActive,
                  borderBottomColor: theme.colors.primary,
                },
              ]}
            >
              <Text
                style={{
                  color: isFocused
                    ? theme.colors.primary
                    : theme.colors.secondary,
                  fontSize: 16,
                }}
              >
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
    // minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 10, // 底部也增加一些间距
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  centerTabs: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
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
