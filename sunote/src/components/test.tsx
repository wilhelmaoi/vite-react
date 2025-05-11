import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { TextInput, Button, Text, useTheme, Surface } from "react-native-paper";
import { useAuthStore, useMaskStore } from "../src/context/store";
import {
  saveToken,
  saveAccount,
  savePassword,
  getAccount,
  getPassword,
} from "../src/context/secureStore";
import request from "../src/database/request";
import { useRouter } from "expo-router";
import BottomSheet from "@gorhom/bottom-sheet";
import { Pressable } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// 登录成功后的处理
async function onLoginSuccess(
  token: string,
  username: string,
  password: string
) {
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

  const sheetRef = useRef<BottomSheet>(null);

  // 下拉关闭遮罩用
  const { setVisible } = useMaskStore();
  const visible = useMaskStore((state) => state.visible);

  // 遮罩动画
  const opacity = useSharedValue(0);

  // snapPoints用useMemo优化
  const snapPoints = useMemo(() => ["20%", "90%"], []);

  // 动画样式
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // bottom sheet 关闭前淡出动画
  const fadeOutAndHide = () => {
    // runOnJS只能在worklet里被调用
    opacity.value = withTiming(0, { duration: 180 }, (finished) => {
      if (finished) {
        runOnJS(setVisible)(false);
      }
    });
  };

  // bottom sheet 打开动画
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 180 });
    }
  }, [visible]);

  // bottom sheet 关闭/下拉事件
  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1 && visible) {
        fadeOutAndHide();
      }
    },
    [visible]
  );

  // 按下 "注册" 或用代码控制展示 bottom sheet
  const handleSnapPress = useCallback(
    (idx: number) => {
      setVisible(true);
      sheetRef.current?.snapToIndex(idx);
    },
    []
  );

  // 遮罩点击关闭（交互友好：先close sheet，再淡出遮罩）
  const handleClosePress = useCallback(() => {
    sheetRef.current?.close();
    setVisible(false);
    // fadeOutAndHide 会由 onChange 做
  }, []);

  // --------- 登录逻辑略 -----------
  const {
    username,
    password,
    setUsername,
    setPassword,
  } = useAuthStore();

  // 自动读账号密码
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
      const response = await request.post("/login", { username, password });
      const { code, data, msg } = response.data;
      if (code === 200 && data?.token) {
        await onLoginSuccess(data.token, username, password);
        router.push("/(tabs)/home");
      } else {
        throw new Error(msg || "登录失败");
      }
    } catch (error: any) {
      Alert.alert("登录失败", error.message || "请检查用户名或密码");
    }
  };

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* 遮罩动画；只有visible时才渲染 */}
      {visible && (
        <Animated.View
          style={[styles.overlay, animatedStyle]}
          pointerEvents={visible ? "auto" : "none"}
        >
          <Pressable style={{ flex: 1 }} onPress={handleClosePress} />
        </Animated.View>
      )}

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
        <Text
          variant="bodyMedium"
          style={{
            ...styles.registerLink,
            color: theme.colors.primary,
            fontSize: 16,
          }}
          onPress={() => handleSnapPress(0)}
        >
          没有账号？注册一个
        </Text>
      </KeyboardAvoidingView>

      {/* BottomSheet only控制 */}
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
        enablePanDownToClose={true}
        index={-1}
        backgroundStyle={{
          backgroundColor: theme.colors.background,
        }}
        style={{
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <Text>nihao</Text>
      </BottomSheet>
    </Surface>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // 半透明黑色
    zIndex: 10,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    paddingVertical: 6,
  },
  registerLink: {
    alignSelf: "center",
    marginTop: 10,
  },
});