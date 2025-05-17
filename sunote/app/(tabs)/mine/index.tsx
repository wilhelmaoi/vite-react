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


const LOCAL_AVATAR_PATH = FileSystem.cacheDirectory + "avatar.jpg";

export default function Mine() {
  const authStore = useAuthStore.getState();
  const user = authStore.user;
  const router = useRouter();
  const theme = useTheme();
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);

  const handleLogout = () => {
    authStore.logout();
    router.replace("/sign-in"); // 使用 replace 防止用户回退
  };

  // 检查并请求文件系统权限
  const checkAndRequestPermissions = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          '需要权限',
          '应用需要访问媒体库权限来管理头像，请在系统设置中授予权限',
          [
            {
              text: '确定',
              style: 'default',
            }
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('权限检查失败:', error);
      return false;
    }
  };

  useEffect(() => {
    // 头像管理逻辑
    const manageAvatar = async () => {
      try {
        // 首先检查权限
        const hasPermission = await checkAndRequestPermissions();
        if (!hasPermission) {
          console.log('没有必要的权限，使用默认头像');
          return;
        }

        // 确保缓存目录存在
        const cacheDir = FileSystem.cacheDirectory;
        if (!cacheDir) {
          console.error('无法获取缓存目录');
          return;
        }

        // 1. 先检查本地缓存是否存在
        const fileInfo = await FileSystem.getInfoAsync(LOCAL_AVATAR_PATH);
        console.log('缓存文件信息:', fileInfo);
        
        if (fileInfo.exists) {
          try {
            // 验证文件是否可读
            const fileContent = await FileSystem.readAsStringAsync(LOCAL_AVATAR_PATH, {
              encoding: FileSystem.EncodingType.Base64,
            });
            if (fileContent) {
              console.log("使用本地缓存头像，文件大小:", fileInfo.size);
              authStore.setAvatarUri(LOCAL_AVATAR_PATH);
              return;
            }
          } catch (readError) {
            console.error("读取本地头像文件失败:", readError);
            // 如果读取失败，删除可能损坏的文件
            await FileSystem.deleteAsync(LOCAL_AVATAR_PATH, { idempotent: true });
          }
        }
        
        // 2. 如果本地没有或文件损坏，但 user.avatar 有值，则下载并缓存
        if (user?.avatar) {
          try {
            console.log("下载并缓存头像");
            // 下载头像
            const { uri } = await FileSystem.downloadAsync(
              user.avatar,
              LOCAL_AVATAR_PATH,
              {
                md5: true, // 启用 MD5 校验
                cache: true // 启用缓存
              }
            );
            
            // 验证下载的文件
            const downloadedFileInfo = await FileSystem.getInfoAsync(uri);
            console.log('下载的文件信息:', downloadedFileInfo);
            
            if (downloadedFileInfo.exists && downloadedFileInfo.size > 0) {
              authStore.setAvatarUri(uri);
              return;
            }
          } catch (error) {
            console.error("下载头像失败:", error);
          }
        }
        
        // 3. 如果上面都失败，使用默认头像
        console.log("使用默认头像");
      } catch (error) {
        console.error("头像管理过程出错:", error);
      }
    };
    
    manageAvatar();
  }, [user?.avatar]); // 当 user.avatar 变化时重新获取

  // 处理头像变更
  const handleAvatarChange = async (newAvatarUri: string) => {
    try {
      // 验证新头像文件
      const fileInfo = await FileSystem.getInfoAsync(newAvatarUri);
      if (!fileInfo.exists) {
        throw new Error('新头像文件不存在');
      }

      // 复制到缓存目录
      const newPath = FileSystem.cacheDirectory + 'new_avatar_' + Date.now() + '.jpg';
      await FileSystem.copyAsync({
        from: newAvatarUri,
        to: newPath
      });

      authStore.setAvatarUri(newPath);
      
      // 准备上传到服务器
      const formData = new FormData();
      formData.append('avatar', {
        uri: newPath,
        name: 'avatar.jpg',
        type: 'image/jpeg'
      } as any);
      
      // 上传头像到服务器
      const response = await request.post('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.code === 200) {
        // 更新本地用户信息
        if (user) {
          const updatedUser: User = {
            ...user,
            avatar: newPath
          };
          saveUser(updatedUser);
          authStore.setUser(updatedUser);
        }
        Alert.alert('成功', '头像已更新');
      } else {
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
              authStore.avatarUri
              ? { uri: authStore.avatarUri }
              : require("../../../src/assets/avatar.jpg")
            }
          />
          <Avatar.Text
            size={24}
            label="在线"
            style={styles.statusIndicator}
            color="#fff"/>
        </TouchableOpacity>
        <Text style={styles.username}>{user?.nickname ?? "未登录"}</Text>
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
        
        {/* 头像预览模态框 */}
        <AvatarPreview
          visible={showAvatarPreview}
          imageUri={authStore.avatarUri}
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
