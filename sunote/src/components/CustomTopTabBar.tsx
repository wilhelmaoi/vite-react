import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigationState } from "@react-navigation/native";
import { useTheme } from "../theme/ThemeContext";

export default function CustomTopTabBar({ state, descriptors, navigation }) {
    const theme = useTheme(); // 🔥 获取主题颜色
  return (
    <View style={styles.container}>
      {/* 左侧按钮 */}
      <TouchableOpacity onPress={() => console.log("Left pressed")}>
        <MaterialIcons name="menu" size={24} color="black" />
      </TouchableOpacity>

      {/* 中间 Tabs */}
      <View style={styles.centerTabs}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = state.index === index;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.tabItem, isFocused && styles.tabItemActive]}
            >
              <Text style={{ color: isFocused ? "#673ab7" : "#aaa", fontSize: 16 }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 右侧按钮 */}
      <TouchableOpacity onPress={() => console.log("Right pressed")}>
        <MaterialIcons name="search" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: "#fff",
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
    borderBottomColor: "#673ab7",
  },
});