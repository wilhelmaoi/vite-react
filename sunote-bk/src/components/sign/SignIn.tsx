import React, { useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/context/store';
import { saveToken, saveAccount, savePassword, getAccount, getPassword } from '@/context/secureStore'; // SecureStore相关
import request from '@/database/request';

type Props = NativeStackScreenProps<any>;
const Stack = createNativeStackNavigator();

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

export const SignIn: React.FC<Props> = ({ navigation }) => {
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
  }, []);

  const handleSignIn = async () => {
    try {
      const response = await request.post('/login', {
        username,
        password,
      });

      const { token } = response.data;
      await onLoginSuccess(token, username, password);
      navigation.replace('HomeTabs');

    } catch (error: any) {
      console.error('登录失败', error);
      alert('登录失败，请检查用户名或密码');
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
