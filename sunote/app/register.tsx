// app/RegisterForm.tsx
import React, { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { TextInput, Button, Text, useTheme } from "react-native-paper";
import { useAuthStore } from "../src/context/store";
import { MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import request from "../src/database/request";
// import BottomSheet from "@gorhom/bottom-sheet";

export default function RegisterForm({
  onSubmit,
  isFull = false,
}: {
  onSubmit: () => void;
  isFull?: boolean;
}) {
  const theme = useTheme();
  const { username, password, setUsername, setPassword, nickname, setNickname, setUser } = useAuthStore();
  // const sheetRef = useRef<BottomSheet>(null);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0); // 初始值改为0
  const [isSending, setIsSending] = useState(false); // 添加发送状态

  // 处理表单的展开和收起的css样式
  let formStyle = isFull ? styles.container_expand : styles.container_contract;

  // 发送验证码，同时禁用按钮几秒
  const handleSendCode = async () => {
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      alert("请输入有效邮箱！");
      return;
    }

    if (isSending) return; // 如果正在发送，直接返回

    try {
      setIsSending(true);
      await request.post("/email/sendCode", { email });
      alert("验证码已发送，请检查邮箱");

      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsSending(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (e) {
      setIsSending(false);
      alert("发送失败，请稍后重试");
    }
  };

  const handleRegister = async () => {
    // 表单简单校验
    if (!email || !username || !password || !code) {
      alert("请完整填写信息");
      return;
    }

    // 验证码校验
    try {
      const verifyResponse = await request.post("/email/verifyCode", { email, code });
      if (verifyResponse.data !== "验证成功") {
        alert("验证码错误或已过期");
        return;
      }

      // 注册请求
      const registerResponse = await request.post("/register", {
        username,
        password,
        email,
        nickname: nickname || username // 如果没有设置昵称，使用用户名作为昵称
      });

      if (registerResponse.data.code === 200) {
        // 注册成功，保存用户信息
        const userData = registerResponse.data.data;
        setUser(userData);
        alert("注册成功！");
        onSubmit?.();
      } else {
        alert(registerResponse.data.msg || "注册失败");
      }
    } catch (e: any) {
      alert("注册失败：" + (e?.response?.data?.msg || e?.message || "未知错误"));
    }
  };

  return (
    <MotiView
      from={{ maxHeight: 30, paddingTop: 10 }} // ⚠️ 用 maxHeight 而不是 height
      // animate={{ maxHeight: isFull ? 500 : 500, paddingTop: isFull ? 200 : 10 }}
      animate={{ maxHeight: isFull ? 600 : 500, paddingTop: isFull ? 100 : 10 }}
      transition={{
        type: "timing",
        duration: 450,
        easing: Easing.inOut(Easing.ease),
      }}
      style={[formStyle, { overflow: "hidden" }]} // overflow避免内容外溢
    >
      <KeyboardAvoidingView
        // style={formStyle}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text variant="headlineSmall" style={styles.title}>
          注册账号
        </Text>
        <TextInput
          label="邮箱"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="email" />}
          keyboardType="email-address"
          autoCapitalize="none"
        />
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
         <TextInput
          label="昵称"
          value={nickname}
          onChangeText={setNickname}
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="account-circle" />}
        />
        <TextInput
          label="验证码"
          value={code}
          onChangeText={setCode}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="form-textbox-password" />}
          right={
            <TextInput.Icon
              icon="send"
              onPress={handleSendCode}
              disabled={isSending || countdown > 0 || !email}
              color={theme.colors.primary}
            />
          }
          placeholder="输入邮箱收到的验证码"
        />
        {countdown > 0 && (
          <Text style={{ marginLeft: 18, color: theme.colors.secondary }}>
            {countdown}秒后可重新获取
          </Text>
        )}
        <Button
          mode="contained"
          onPress={handleRegister}
          style={styles.button}
          buttonColor={theme.colors.primary}
        >
          注册
        </Button>
      </KeyboardAvoidingView>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container_contract: {
    // flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  container_expand: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
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
