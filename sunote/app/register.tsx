// components/RegisterForm.tsx
import React from "react";
import { StyleSheet } from "react-native";
import { TextInput, Button, Text, useTheme } from "react-native-paper";
import { useAuthStore } from "../src/context/store";

export default function RegisterForm({ onSubmit }: { onSubmit: () => void }) {
  const theme = useTheme();
  const { username, password, setUsername, setPassword } = useAuthStore();

  const handleRegister = async () => {
    console.log("注册账号：", username, password);
    // 模拟注册请求（你可以改成真实请求）
    setTimeout(() => {
      alert("注册成功！");
    }, 1000);
    
     onSubmit(); // 注册完成后关闭底部弹窗
  };

  return (
    <>
      <Text variant="headlineSmall" style={styles.title}>注册账号</Text>
      <TextInput
        label="用户名"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        mode="outlined"
        left={<TextInput.Icon icon="account-plus" />}
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
        onPress={handleRegister}
        style={styles.button}
        buttonColor={theme.colors.primary}
      >
        注册
      </Button>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
    marginHorizontal: 16,
  },
  button: {
    marginTop: 10,
    marginHorizontal: 16,
    paddingVertical: 6,
  },
});
