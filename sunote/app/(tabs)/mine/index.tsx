import React from "react";
import { Avatar, Button, Text, List, Appbar, Surface } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { useAuthStore } from "../../../src/context/store"; // 根据你的项目结构调整路径
import { useRouter } from "expo-router";
import ThemeToggleButton from "../../../src/theme/ThemeToggleButton"; // 调整路径
import { useTheme } from '../../../src/theme/ThemeContext';

export default function Mine() {
  const removeToken = useAuthStore((s) => s.clearToken); // 自定义 store 中的 removeToken 方法
  const router = useRouter();
  const theme = useTheme();

  const handleLogout = () => {
    removeToken(); // 清除 token
    router.replace("/sign-in"); // 使用 replace 防止用户回退
  };

  return (
    <Surface style={{ flex: 1 }}>
      <Appbar.Header>
        {/* <Appbar.Content title="个人中心" /> */}
        <ThemeToggleButton />
      </Appbar.Header>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Avatar.Image
          size={80}
          source={{
            uri: "https://raw.githubusercontent.com/wilhelmaoi/assets/ae663e7a1ef975e17915e2ab7536d6a7269a01fe/sunote/avatar.jpg",
          }}
          // style={{ backgroundColor: "#fff" }}
        />
        <Avatar.Text
          size={24}
          label="在线"
          style={styles.statusIndicator}
          color="#fff"/>
        <Text style={styles.username}>wilhelmaoi</Text>
        <Text style={styles.tag}>wilhelmaoi#1234</Text>

        <Button mode="contained" style={styles.button}>
          编辑个人资料
        </Button>

        <List.Section style={styles.list}>
          <List.Item
            title="成员加入时间"
            description="2017年8月27日"
            left={() => <List.Icon icon="calendar" />}
          />
          <List.Item
            title="您的好友"
            description="点击查看好友列表"
            left={() => <List.Icon icon="account-group" />}
          />
          <List.Item
            title="备注"
            description="添加备注信息"
            left={() => <List.Icon icon="note-outline" />}
            right={() => <List.Icon icon="plus-circle-outline" />}
          />
          <List.Item
            title="退出登录"
            description="退出当前账号"
            onPress={handleLogout}
            left={() => <List.Icon icon="logout" />}
          />
        </List.Section>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    gap: 10,
  },
  username: {
    // color: '#fff',
    fontSize: 22,
    fontWeight: "bold",
  },
  tag: {
    color: "#aaa",
    fontSize: 14,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#43b581",
    position: "absolute",
    bottom: 10,
    right: 15,
    borderWidth: 3,
    borderColor: "#18191c",
  },
  button: {
    marginTop: 10,
    width: "80%",
  },
  list: {
    width: "100%",
    marginTop: 10,
  },
});
