import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Avatar, Card, Text } from "react-native-paper";
import { useTheme } from "../theme/ThemeContext";
import { AntDesign } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { useAuthStore } from "../context/store";

export default function CustomDrawerContent(
  props: DrawerContentComponentProps
) {
  const theme = useTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const { user, avatarUri } = useAuthStore();

  const [fontsLoaded] = useFonts({
    "mini-jian-huangcao": require("../assets/fonts/迷你简黄草.ttf"),
  });
  if (!fontsLoaded) return null; // 字体没加载好时不渲染

  // 关闭抽屉并导航到指定路径
  const navigateAndCloseDrawer = (path: string) => {
    // 关闭抽屉
    navigation.dispatch(DrawerActions.closeDrawer());
    // 导航到指定路径
    router.push(path);
  };
  return (
    <DrawerContentScrollView {...props}>
      {/* 用户信息区域 */}
      <Card
        style={[styles.userSection, { backgroundColor: theme.colors.primary }]}
      >
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => navigateAndCloseDrawer("/mine")}
        >
          <Avatar.Image
            source={
              avatarUri ? { uri: avatarUri } : require("../assets/avatar.jpg")
            }
            style={styles.avatar}
          />

          <View style={styles.userTextContainer}>
            <Text style={[styles.userName, { color: theme.colors.onPrimary }]}>
              {user?.nickname || "未登录"}
            </Text>
            <Text style={[styles.userEmail, { color: theme.colors.onPrimary }]}>
              {user?.email || "暂无邮箱"}
            </Text>
          </View>
        </TouchableOpacity>
      </Card>
      {/* 左侧大图标和文字 */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigateAndCloseDrawer("/sponsor")}
      >
        <View
          style={{
            borderRadius: 15,
            marginTop: 20,
            height: 60,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#e85C8A",
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              marginLeft: 10,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#E86A94FF", // 内层粉色
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 30,
                  fontFamily: "mini-jian-huangcao",
                }}
              >
                大
              </Text>
            </View>
          </View>
          <View>
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>
              我的大会员
            </Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 13,
                opacity: 0.85,
                marginTop: 2,
              }}
            >
              你所热爱的就是你的生活
            </Text>
          </View>
          <View>
            <Text
              style={{
                color: "#fff",
                fontSize: 13,
                marginLeft: 25,
                fontWeight: "bold",
              }}
            >
              赞助作者 &gt;
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* 菜单项 */}
      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateAndCloseDrawer("/(tabs)/home")}
        >
          <AntDesign name="home" size={24} color={theme.colors.primary} />
          <Text style={[styles.menuText, { color: theme.colors.primary }]}>
            首页
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateAndCloseDrawer("/favorites")}
        >
          <AntDesign name="star" size={24} color={theme.colors.primary} />
          <Text style={[styles.menuText, { color: theme.colors.primary }]}>
            我的收藏
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateAndCloseDrawer("/settings")}
        >
          <AntDesign name="setting" size={24} color={theme.colors.primary} />
          <Text style={[styles.menuText, { color: theme.colors.primary }]}>
            设置
          </Text>
        </TouchableOpacity>
      </View>

      {/* 底部区域 */}
      <View
        style={[
          styles.bottomSection,
          { borderTopColor: theme.colors.outlineVariant },
        ]}
      >
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateAndCloseDrawer("/sign-in")}
        >
          <AntDesign name="logout" size={24} color={theme.colors.error} />
          <Text style={[styles.menuText, { color: theme.colors.error }]}>
            退出登录
          </Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  userSection: {
    padding: 16,
    marginTop: 40,
    borderRadius: 15,
    // iOS 阴影
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,

    // Android 阴影
    elevation: 5,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 30,
    // backgroundColor: "#fff"
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.8,
  },
  menuSection: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 32,
  },
  menuText: {
    fontSize: 16,
  },
  bottomSection: {
    paddingVertical: 16,
    borderTopWidth: 1,
    marginTop: 8,
  },
});
