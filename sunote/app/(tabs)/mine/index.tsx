// app/mine/index.tsx
import React, { useEffect, useState } from "react";
import { Avatar, Button, Text, List, Appbar, Surface } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { useAuthStore } from "../../../src/context/store"; // 根据你的项目结构调整路径
import { useRouter } from "expo-router";
import ThemeToggleButton from "../../../src/theme/ThemeToggleButton"; // 调整路径
import { useTheme } from '../../../src/theme/ThemeContext';
import request from "../../../src/database/request";
import * as FileSystem from "expo-file-system";
import { getAccount } from "../../../src/context/secureStore";


import { getUser, User } from "../../../src/database/sqlite";


const LOCAL_AVATAR_PATH = FileSystem.cacheDirectory + "avatar.jpg";

export default function Mine() {
  const authStore = useAuthStore.getState();
  const user = authStore.user;
  const router = useRouter();
  const theme = useTheme();

  const handleLogout = () => {
    authStore.logout();
    router.replace("/sign-in"); // 使用 replace 防止用户回退
  };
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  useEffect(() => {
    // 头像管理逻辑
    const manageAvatar = async () => {
      // 1. 先检查本地缓存是否存在
      const fileInfo = await FileSystem.getInfoAsync(LOCAL_AVATAR_PATH);
      
      if (fileInfo.exists) {
        // 如果本地有缓存，直接使用
        console.log("使用本地缓存头像");
        setAvatarUri(LOCAL_AVATAR_PATH);
        return;
      }
      
      // 2. 如果本地没有，但 user.avatar 有值，则下载并缓存
      if (user?.avatar) {
        try {
          console.log("下载并缓存头像");
          // 下载头像
          const { uri } = await FileSystem.downloadAsync(
            user.avatar,
            LOCAL_AVATAR_PATH
          );
          setAvatarUri(uri);
          return;
        } catch (error) {
          console.error("下载头像失败:", error);
          // 下载失败，继续尝试其他方法
        }
      }
      
      // 3. 如果上面都失败，尝试从服务器获取
      try {
        console.log("从服务器获取头像");
        const response = await request.get("/user/avatar", {
          responseType: "arraybuffer",
        });
        
        // 将二进制转为 base64
        const base64 = Buffer.from(response.data).toString("base64");
        
        // 保存到本地
        await FileSystem.writeAsStringAsync(
          LOCAL_AVATAR_PATH, 
          base64, 
          { encoding: FileSystem.EncodingType.Base64 }
        );
        
        setAvatarUri(LOCAL_AVATAR_PATH);
      } catch (error) {
        console.error("获取服务器头像失败:", error);
        // 所有尝试都失败，使用默认头像
        setAvatarUri(null);
      }
    };
    
    manageAvatar();
  }, [user?.avatar]); // 当 user.avatar 变化时重新获取


  return (
    <Surface style={{ flex: 1 }}>
      <Appbar.Header>
        {/* <Appbar.Content title="个人中心" /> */}
        <ThemeToggleButton />
      </Appbar.Header>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Avatar.Image
          size={80}
          source={
            user?.avatar
            ? { uri: user.avatar }
            : require("../../../src/assets/avatar.jpg")
          }
          // style={{ backgroundColor: "#fff" }}
        />
        <Avatar.Text
          size={24}
          label="在线"
          style={styles.statusIndicator}
          color="#fff"/>
        <Text style={styles.username}>{user?.username ?? "未登录"}</Text>
        <Text style={styles.tag}>{user?.bio ?? "暂无签名"}</Text>

        <Button mode="contained" style={styles.button}>
          编辑个人资料
        </Button>

        <List.Section style={styles.list}>
          <List.Item
            title="成员加入时间"
            description={user?.birthday ?? "未知"}
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
