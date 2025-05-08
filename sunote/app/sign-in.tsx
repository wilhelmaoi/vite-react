// app/index.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useAuthStore } from '../src/context/store';

import { saveToken, saveAccount, savePassword, getAccount, getPassword } from '../src/context/secureStore'; // SecureStore相关
import request from '../src/database/request';
import { Link,useRouter } from 'expo-router';

// 登录成功后的处理
async function onLoginSuccess(token: string, username: string, password: string) {
  const authStore = useAuthStore.getState();
  authStore.setToken(token);
  authStore.setUsername(username);
  authStore.setPassword(password);

  await saveToken(token);
  await saveAccount(username);
  await savePassword(password);
}

export default function SignIn() {

  const router = useRouter();
  const theme = useTheme();
  
  // 从store拿状态
  const { username, password, setUsername, setPassword } = useAuthStore();

  // 初次进入页面时，自动读取账号密码
  useEffect(() => {
    async function loadSavedCredentials() {
      const savedUsername = await getAccount();
      const savedPassword = await getPassword();
      if (savedUsername) setUsername(savedUsername);
      if (savedPassword) setPassword(savedPassword);
    }
    loadSavedCredentials();
    console.log('当前进入sign界面');
    
  }, []);

  
  const handleSignIn = async () => {
    try {
      console.log('账号信息', username, password);
      const response = await request.post('/login', {
        username,
        password,
      });
      console.log('code', response.data.code);
      const  code  = response.data.code;
      const  msg  = response.data.msg;
      const  token  = response.data.data.token;
      // const { code, msg, data: token } = response.data;
      // console.log('response', response);
      // console.log('登录成功', code, msg,token);
      if (code === 200 && token) {
        console.log('token获取成功', token);
        await onLoginSuccess(token, username, password);
        // router.push('/(tabs)')
        router.replace('/');
        // router.push({pathname:"/(tabs)",params:{token}})
        console.log('页面跳转成功');
      } else {
        throw new Error(msg || '登录失败');
      }
    } catch (error: any) {
      Alert.alert('登录失败', error.message || '请检查用户名或密码');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text variant="headlineMedium" style={styles.title}>
        欢迎登录
      </Text>
      <TextInput
        label="用户名"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        mode="outlined"
        left={<TextInput.Icon icon="account" />}
      />
      <TextInput
        label="密码"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
        left={<TextInput.Icon icon="lock" />}
      />
      <Button
        mode="contained"
        onPress={handleSignIn}
        style={styles.button}
        buttonColor={theme.colors.primary}
      >
        登录
      </Button>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    paddingVertical: 6,
  },
});
