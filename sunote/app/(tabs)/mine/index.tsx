// app/mine/index.tsx
import React, { useEffect, useState } from "react";
import { Avatar, Button, Text, List, Appbar, Surface } from "react-native-paper";
import { StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import { useAuthStore } from "../../../src/context/store"; // 根据你的项目结构调整路径
import { useRouter } from "expo-router";
import ThemeToggleButton from "../../../src/theme/ThemeToggleButton"; // 调整路径
import { useTheme } from '../../../src/theme/ThemeContext';
import request from "../../../src/database/request";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from 'expo-media-library';
import { getAccount } from "../../../src/context/secureStore";
import AvatarPreview from "../../../src/components/AvatarPreview";

import { getUser, User, saveUser } from "../../../src/database/sqlite";



// const LOCAL_AVATAR_PATH = FileSystem.cacheDirectory + user?.username + "avatar.jpg";

export default function Mine() {

  const { user, avatarUri, setAvatarUri, logout, setUser } = useAuthStore();
  // 如果需要，可以在组件挂载时设置头像
  useEffect(() => {
    if (user?.avatar && !avatarUri) {
      setAvatarUri(user.avatar);
    }
  }, [user]);
  
  const router = useRouter();
  const theme = useTheme();
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace("/sign-in"); // 使用 replace 防止用户回退
  };

  // 处理头像变更
  const handleAvatarChange = async (newAvatarUri: string) => {
    try {
      // 验证新头像文件
      const fileInfo = await FileSystem.getInfoAsync(newAvatarUri);
      if (!fileInfo.exists) {
        throw new Error('新头像文件不存在');
      }

      // 准备上传到服务器
      const formData = new FormData();
      formData.append('avatar', {
        uri: newAvatarUri,
        name: 'avatar.jpg',
        type: 'image/jpeg'
      } as any);
      
      // 获取当前token
      const token = useAuthStore.getState().token;
      
      // 上传头像到服务器
      const response = await request.post('/user/avatar-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'token': token, // 直接添加token到请求头
        },
      });
      
      if (response.data.code === 200) {
        console.log("上传头像响应:", response.data);
        // 从响应中获取云端URL和时间戳
        const responseData = response.data.data;
        const avatarUrl = responseData.avatarUrl || responseData;
        const timestamp = responseData.timestamp || Date.now(); // 使用毫秒级时间戳
        
        // 更新本地用户信息
        if (user) {
          // 添加日志检查时间戳类型
          console.log("更新头像时间戳类型:", typeof timestamp, "值:", timestamp);
          
          const updatedUser: User = {
            ...user,
            avatar: avatarUrl,
            avatarUpdatedAt: timestamp // 使用原始时间戳值
          };
          saveUser(updatedUser);
          setUser(updatedUser);
          setAvatarUri(avatarUrl); // 直接设置新的头像URL
        }
      } 
      else {
        throw new Error(response.data.msg || '上传失败');
      }
    } catch (error) {
      console.error('更新头像失败:', error);
      Alert.alert('更新失败', '头像更新失败，请稍后再试');
    }
  };

  return (
    <Surface style={{ flex: 1 }}>
      <Appbar.Header>
        {/* <Appbar.Content title="个人中心" /> */}
        <ThemeToggleButton />
      </Appbar.Header>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity 
          onPress={() => setShowAvatarPreview(true)}
          activeOpacity={0.7}
        >
          <Avatar.Image
            size={80}
            source={ 
             avatarUri ? { uri: avatarUri }
              : require("../../../src/assets/avatar.jpg")
            }
          />
          <Avatar.Text
            size={24}
            label="在线"
            style={[styles.statusIndicator, { borderColor: theme.colors.background,backgroundColor: avatarUri? "#43b581" : "#DA4F4FFF", }]}
            color="#fff"/>
        </TouchableOpacity>
        <Text style={styles.username}>{user?.nickname ?? "未登录"}</Text>
        <Text style={styles.tag}>{user?.bio ?? "暂无签名"}</Text>

        <Button 
          mode="contained" 
          style={styles.button}
          onPress={() => router.push('/(screen)/edit-profile')}
        >
          编辑个人资料
        </Button>

        <List.Section style={styles.list}>
          <List.Item
            title="成员加入时间"
            description={user?.birthday ?? "未知"}
            left={() => <List.Icon icon="card-account-details-outline" />}
          />
          <List.Item
            title="我的收藏"
            description="点击查看收藏的帖子"
            left={() => <List.Icon icon="message-bookmark-outline" />}
            onPress={() => router.push('/(screen)/my-collects')}
          />
          <List.Item
            title="您的好友"
            description="点击查看好友列表"
            left={() => <List.Icon icon="at" />}
            onPress={() => router.push('/(screen)/my-follows')}
          />
          <List.Item
            title="我的帖子"
            description="点击查看我发的帖子"
            onPress={() => router.push('/(screen)/my-posts')}
            left={() => <List.Icon icon="inbox-full" />}
          />
          <List.Item
            title="退出登录"
            description="退出当前账号"
            onPress={handleLogout}
            left={() => <List.Icon icon="logout" />}
          />
        </List.Section>
        
        {/* 头像预览模态框 */}
        <AvatarPreview
          visible={showAvatarPreview}
          imageUri={avatarUri || null}
          defaultImage={require("../../../src/assets/avatar.jpg")}
          onClose={() => setShowAvatarPreview(false)}
          onAvatarChange={handleAvatarChange}
        />
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

    position: "absolute",
    bottom: 5,
    right: 5,
    borderWidth: 2,
    
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

