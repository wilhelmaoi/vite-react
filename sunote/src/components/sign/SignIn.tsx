import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/context/store';
import { saveToken } from '@/context/tokenStore';


type Props = NativeStackScreenProps<any>;
const Stack = createNativeStackNavigator();
async function onLoginSuccess(token: string) {
  useAuthStore.getState().setToken(token);
  await saveToken(token);
}

export const SignIn: React.FC<Props> = ({ navigation }) => {

  const theme = useTheme();

  const handleSignIn = () => {
    // 登录逻辑（这里你可以加上 WatermelonDB 查询验证用户）
    if (username === 'admin' && password === '123456') {
      navigation.replace('HomeTabs'); // 登录成功后跳转到主页面
    } else {
      alert('用户名或密码错误');
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
    // backgroundColor: '#fff',
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
