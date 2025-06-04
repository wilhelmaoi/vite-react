import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Appbar, Button, Avatar, Surface, Text } from 'react-native-paper';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuthStore } from '../../src/context/store';
import { useRouter } from 'expo-router';
import request from '../../src/database/request';
import * as ImagePicker from 'expo-image-picker';
import { saveUser } from '../../src/database/sqlite';
import AvatarPreview from '../../src/components/AvatarPreview';
import CustomInput from '../../src/components/CustomInput';

export default function EditProfile() {
  const theme = useTheme();
  const router = useRouter();
  const { user, setUser, avatarUri, setAvatarUri } = useAuthStore();
  
  // 表单状态
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [email, setEmail] = useState(user?.email || '');
  const [birthday, setBirthday] = useState(user?.birthday || '');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 处理保存个人信息
  const handleSave = async () => {
    if (!user) {
      Alert.alert('错误', '用户未登录');
      return;
    }
    
    // 验证表单
    const newErrors: Record<string, string> = {};
    
    if (!nickname.trim()) {
      newErrors.nickname = '昵称不能为空';
    }
    
    if (email && !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
      newErrors.email = '邮箱格式不正确';
    }
    
    if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      newErrors.birthday = '日期格式应为 YYYY-MM-DD';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await request({
        method: 'POST',
        url: '/user/update-profile',
        data: {
          username: user.username,
          nickname,
          bio,
          email,
          birthday,
          gender
        }
      });
      
      if (response.data.code === 200) {
        // 更新本地用户信息
        const updatedUser = {
          ...user,
          nickname,
          bio,
          email,
          birthday,
          gender
        };
        
        // 更新状态管理和本地存储
        setUser(updatedUser);
        saveUser(updatedUser);
        
        Alert.alert('成功', '个人资料已更新', [
          { text: '确定', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('失败', response.data.msg || '更新资料失败');
      }
    } catch (error) {
      console.error('更新个人资料出错:', error);
      Alert.alert('错误', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 处理头像变更
  const handleAvatarChange = async (newAvatarUri: string) => {
    try {
      setShowAvatarPreview(false);
      
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
          'token': token,
        },
      });
      
      if (response.data.code === 200) {
        const responseData = response.data.data;
        const avatarUrl = responseData.avatarUrl || responseData;
        const timestamp = responseData.timestamp || Date.now();
        
        // 更新本地用户信息
        if (user) {
          const updatedUser = {
            ...user,
            avatar: avatarUrl,
            avatarUpdatedAt: timestamp
          };
          saveUser(updatedUser);
          setUser(updatedUser);
          setAvatarUri(newAvatarUri);
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
    <Surface style={{flex: 1, backgroundColor: theme.colors.background}}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="编辑个人资料" />
        <Appbar.Action icon="check" onPress={handleSave} disabled={loading} />
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles.container}>
        {/* 头像区域 */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity 
            onPress={() => setShowAvatarPreview(true)}
            style={styles.avatarWrapper}
          >
            <Avatar.Image
              size={100}
              source={ 
                avatarUri 
                ? { uri: avatarUri }
                : require("../../src/assets/avatar.jpg")
              }
            />
            <View style={styles.avatarEditBadge}>
              <Text style={styles.avatarEditText}>编辑</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* 表单区域 */}
        <View style={styles.formContainer}>
          <CustomInput
            label="昵称"
            value={nickname}
            onChangeText={setNickname}
            placeholder="请输入昵称"
            error={errors.nickname}
          />
          
          <CustomInput
            label="个人简介"
            value={bio}
            onChangeText={setBio}
            placeholder="介绍一下自己吧"
            multiline
            numberOfLines={3}
          />
          
          <CustomInput
            label="电子邮箱"
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            keyboardType="email-address"
            error={errors.email}
          />
          
          <CustomInput
            label="生日"
            value={birthday}
            onChangeText={setBirthday}
            placeholder="YYYY-MM-DD"
            error={errors.birthday}
          />
          
          <CustomInput
            label="性别"
            value={gender}
            onChangeText={setGender}
            placeholder="男/女/保密"
          />
          
          <Button 
            mode="contained" 
            onPress={handleSave} 
            style={styles.saveButton}
            loading={loading}
            disabled={loading}
          >
            保存
          </Button>
        </View>
        
        {/* 头像预览模态框 */}
        <AvatarPreview
          visible={showAvatarPreview}
          imageUri={avatarUri}
          defaultImage={require("../../src/assets/avatar.jpg")}
          onClose={() => setShowAvatarPreview(false)}
          onAvatarChange={handleAvatarChange}
        />
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  avatarEditText: {
    color: 'white',
    fontSize: 12,
  },
  formContainer: {
    width: '100%',
  },
  saveButton: {
    marginTop: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
}); 