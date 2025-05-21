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

  const { user, avatarUri, setAvatarUri, logout,setUser } = useAuthStore();
  const router = useRouter();
  const theme = useTheme();
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const LOCAL_AVATAR_PATH = (FileSystem.cacheDirectory ?? '') + user?.username + "/avatar.jpg";


  const handleLogout = () => {
    logout();
    router.replace("/sign-in"); // 使用 replace 防止用户回退
  };

  // 检查并请求文件系统权限
  const checkAndRequestPermissions = async () => {
    try {
      // 创建用户头像目录
      const userAvatarDir = (FileSystem.cacheDirectory ?? '') + user?.username;
      const dirInfo = await FileSystem.getInfoAsync(userAvatarDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(userAvatarDir, { intermediates: true });
      }
      
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

        // 检查本地缓存
        const localFileInfo = await FileSystem.getInfoAsync(LOCAL_AVATAR_PATH);

        // 获取最新用户信息，检查头像是否需要更新
        if (user?.username) {
          try {
            // 调用API获取最新的用户信息
            const response = await request.post('/user/info', {
              username: user.username,
              password: user.password
            });
            
            if (response.data.code === 200) {
              console.log("获取到服务器用户信息:", response.data.data);
              const serverUser = response.data.data;
              const serverAvatarUrl = serverUser.avatar;
              // 获取后端返回的时间戳，Java类avatarUpdatedAt对应的JSON字段可能是avatarUpdatedAt
              let serverTimestamp = 0;
              if (serverUser.avatarUpdatedAt) {
                // 如果是日期字符串，转换为时间戳数字
                serverTimestamp = typeof serverUser.avatarUpdatedAt === 'string'
                  ? new Date(serverUser.avatarUpdatedAt).getTime()
                  : serverUser.avatarUpdatedAt;
                console.log("服务器端头像更新时间戳:", serverUser.avatarUpdatedAt);
                console.log("转换后的服务器时间戳:", serverTimestamp);
              }
              
              // 获取本地存储的时间戳
              let localTimestamp = 0;
              if (user.avatarUpdatedAt) {
                localTimestamp = typeof user.avatarUpdatedAt === 'string' 
                  ? new Date(user.avatarUpdatedAt).getTime() 
                  : user.avatarUpdatedAt;
                console.log("本地头像更新时间戳:", user.avatarUpdatedAt);
                console.log("转换后的本地时间戳:", localTimestamp);
              }
              
              // 如果服务器头像更新时间比本地新，或者本地无头像但服务器有
              if ((serverTimestamp > localTimestamp) || (!user.avatar && serverAvatarUrl)) {
                console.log("检测到头像更新，从服务器同步最新头像");
                
                // 清除旧头像
                await FileSystem.deleteAsync(LOCAL_AVATAR_PATH, { idempotent: true });
                console.log("已删除旧头像缓存:", LOCAL_AVATAR_PATH);
                
                // 下载新头像
                if (serverAvatarUrl) {
                  // 构建带有防缓存参数的URL（确保使用转换后的时间戳数字）
                  const avatarUrlWithCache = `${serverAvatarUrl}?t=${serverTimestamp}`;
                  console.log("准备下载新头像：", avatarUrlWithCache);
                  
                  const { uri } = await FileSystem.downloadAsync(
                    avatarUrlWithCache,
                    LOCAL_AVATAR_PATH,
                    {
                      md5: true,
                      cache: true
                    }
                  );
                  
                  // 验证下载的文件
                  const downloadedFileInfo = await FileSystem.getInfoAsync(uri);
                  
                  if (downloadedFileInfo.exists && downloadedFileInfo.size > 0) {
                    // 更新内存中的头像和用户信息
                    setAvatarUri(uri);
                    
                    // 更新本地数据库中的用户信息
                    const updatedUser = {
                      ...user,
                      avatar: serverAvatarUrl,
                      avatarUpdatedAt: serverTimestamp
                    };
                    saveUser(updatedUser);
                    setUser(updatedUser);
                    
                    return;
                  }
                }
              }
            
            }
          } catch (error) {
            console.error("获取最新用户信息失败:", error);
          }
        }

        // 如果以上逻辑未返回，说明需要使用本地缓存或处理旧逻辑
        // 下面是原有逻辑，作为备用方案

        // 1. 先检查本地缓存是否存在
        // if (localFileInfo.exists) {
        //   try {
        //     // 验证文件是否可读
        //     const fileContent = await FileSystem.readAsStringAsync(LOCAL_AVATAR_PATH, {
        //       encoding: FileSystem.EncodingType.Base64,
        //     });
        //     if (fileContent) {
        //       console.log("使用本地缓存头像，文件大小:", localFileInfo.size);
        //       setAvatarUri(LOCAL_AVATAR_PATH);  // 使用 hook 获取的函数
        //       return;
        //     }
        //   } catch (readError) {
        //     console.error("读取本地头像文件失败:", readError);
        //     // 如果读取失败，删除可能损坏的文件
        //     await FileSystem.deleteAsync(LOCAL_AVATAR_PATH, { idempotent: true });
        //   }
        // }
        
        // // 2. 如果本地没有或文件损坏，但 user.avatar 有值，则下载并缓存
        // if (user?.avatar) {
        //   try {
        //     console.log("下载并缓存头像");
        //     // 下载头像
        //     const { uri } = await FileSystem.downloadAsync(
        //       user.avatar,
        //       LOCAL_AVATAR_PATH,
        //       {
        //         md5: true, // 启用 MD5 校验
        //         cache: true // 启用缓存
        //       }
        //     );
            
        //     // 验证下载的文件
        //     const downloadedFileInfo = await FileSystem.getInfoAsync(uri);
        //     console.log('下载的文件信息:', downloadedFileInfo);
            
        //     if (downloadedFileInfo.exists && downloadedFileInfo.size > 0) {
        //       setAvatarUri(uri);
        //       return;
        //     }
        //   } catch (error) {
        //     console.error("下载头像失败:", error);
        //   }
        // }
        
        // 3. 如果上面都失败，使用默认头像
    //     console.log("使用默认头像");
      } catch (error) {
        console.error("头像管理过程出错:", error);
      }
    };
    




    
  useEffect(() => {

    manageAvatar();
  },  []);  // 添加 user?.username 作为依赖

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

      setAvatarUri(newPath);
      
      // 准备上传到服务器
      const formData = new FormData();
      formData.append('avatar', {
        uri: newPath,
        name: 'avatar.jpg',
        type: 'image/jpeg'
      } as any);
      
      // 获取当前token
      const token = useAuthStore.getState().token;
      
      // 上传头像到服务器
      const response = await request.post('/user/avatar', formData, {
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
        }

   
        
        //删除旧的本地缓存，强制重新下载
        await FileSystem.deleteAsync(LOCAL_AVATAR_PATH, { idempotent: true });
        console.log("已删除旧头像缓存:", LOCAL_AVATAR_PATH);
        
        // 下载云端最新头像到本地缓存
        console.log("开始下载新头像，URL:", `${avatarUrl}?t=${timestamp}`);
        const { uri } = await FileSystem.downloadAsync(
          `${avatarUrl}?t=${timestamp}`, // 使用毫秒级时间戳作为URL参数
          LOCAL_AVATAR_PATH,
          {
            md5: true,
            cache: true
          }
        );
        
        // 验证下载成功并更新UI
        const newFileInfo = await FileSystem.getInfoAsync(uri);
        console.log("新下载的头像信息:", newFileInfo);
        if (newFileInfo.exists && newFileInfo.size > 0) {
          // 确保使用新的URI更新头像
          console.log("头像下载成功，更新头像URI:", uri);
          setAvatarUri(uri);
        } else {
          console.error("头像下载成功但文件验证失败");
        }
        
      //   Alert.alert('成功', '头像已更新');
      } 
      else {
        throw new Error(response.data.msg || '上传失败');
      }
    } catch (error) {
      console.error('更新头像失败:', error);
      Alert.alert('更新失败', '头像更新失败，请稍后再试');
    }
  };


  useEffect(() => {
  },  [handleAvatarChange ]);  

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
             avatarUri        
              ? { uri: avatarUri }
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
            title="我的发帖"
            description="点击查看我的发帖"
            onPress={() => router.push('/(tabs)/mine/my-posts')}
            left={() => <List.Icon icon="note-outline" />}
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
          imageUri={avatarUri}
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

