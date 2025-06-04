// app/sign-in.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  View,
  StatusBar,
} from "react-native";
import { Button, Text, useTheme, Surface } from "react-native-paper";
import { useAuthStore, useMaskStore } from "../src/context/store";

import {
  saveToken,
  saveAccount,
  savePassword,
  getAccount,
  getPassword,
} from "../src/context/secureStore"; // SecureStore相关
import request from "../src/database/request";
import { Link, useRouter } from "expo-router";
import BottomSheet from "@gorhom/bottom-sheet";
import { Pressable } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import RegisterForm from "./register";
import { saveUser, User } from "../src/database/sqlite";
import * as FileSystem from "expo-file-system";
import CustomInput from "../src/components/CustomInput";




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

  const response = await request.post("/user/info", {
    username,
    password
  });

  const user: User = response.data.data;
  if (user) {
    saveUser(user); // 存入sqlite
    authStore.setUser(user); // 存入 store
  }
  // const LOCAL_AVATAR_PATH = (FileSystem.cacheDirectory ?? '') + user?.username + "/avatar.jpg";

  // const fileInfo = await FileSystem.getInfoAsync(LOCAL_AVATAR_PATH);
  // if (fileInfo.exists) {
  //   await FileSystem.deleteAsync(LOCAL_AVATAR_PATH, { idempotent: true });
  // }

}

export default function SignIn() {

  
  const router = useRouter();
  const theme = useTheme();

  const sheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ["20%", "90%"], []);

  const [isSheetFull, setIsSheetFull] = useState(false);


  const handleSheetChange = (index: number) => {
    // console.log("handleSheetChange", index);
    setIsSheetFull(index === 1);

    if (index === -1) {
      // let visible = false;
      setVisible(false); // 关闭遮罩
    }
  };
  const handleSnapPress = useCallback((index:number) => {
    setVisible(true);

    sheetRef.current?.snapToIndex(index);
  }, []);

  const handleClosePress = useCallback(() => {
    sheetRef.current?.close();
    setVisible(false);
  }, []);

  // 从store拿状态
  const { username, password, setUsername, setPassword } = useAuthStore();
  const { setVisible } = useMaskStore();

  // 创建一个共享值，初值0（完全透明）
  const opacity = useSharedValue(0);
  const visible = useMaskStore((state) => state.visible);
  
  // 错误状态
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // 初次进入页面时，自动读取账号密码
    async function loadSavedCredentials() {
      const savedUsername = await getAccount();
      const savedPassword = await getPassword();
      if (savedUsername) setUsername(savedUsername);
      if (savedPassword) setPassword(savedPassword);
    }
    loadSavedCredentials();
    console.log("当前进入sign界面");

    // visible变true时，淡入；变false时淡出
    opacity.value = withTiming(visible ? 1 : 0, { duration: 100 });
  }, [visible]);

  // 定义动画样式
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));


  const handleSignIn = async () => {
    try {
      // 表单验证
      const newErrors: Record<string, string> = {};
      
      if (!username.trim()) {
        newErrors.username = '用户名不能为空';
      }
      
      if (!password.trim()) {
        newErrors.password = '密码不能为空';
      }
      
      setErrors(newErrors);
      
      if (Object.keys(newErrors).length > 0) {
        return;
      }
      
      console.log("账号信息", username, password);
      const response = await request.post("/login", {
        username,
        password,
      });
      console.log("code", response.data.code);
      const code = response.data.code;
      const msg = response.data.msg;
      const token = response.data.data.token;
      // const { code, msg, data: token } = response.data;
      // console.log('response', response);
      // console.log('登录成功', code, msg,token);
      if (code === 200 && token) {
        console.log("token获取成功", token);
        await onLoginSuccess(token, username, password);
        router.push("/(tabs)/home");
        // router.replace('(tabs)');
        // router.push({pathname:"/(tabs)",params:{token}})
        console.log("页面跳转成功");
      } else {
        throw new Error(msg || "登录失败");
      }
    } catch (error: any) {
      Alert.alert("登录失败", error.message || "请检查用户名或密码");
    }
  };

  return (

    
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>  
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text variant="headlineMedium" style={[styles.title, {color:theme.colors.primary}]}>
          欢迎登录
        </Text>
        
        <CustomInput
          label="用户名"
          value={username}
          onChangeText={setUsername}
          placeholder="请输入用户名"
          error={errors.username}
        />
        
        <CustomInput
          label="密码"
          value={password}
          onChangeText={setPassword}
          placeholder="请输入密码"
          secureTextEntry
          error={errors.password}
        />
        
        <Button
          mode="contained"
          onPress={handleSignIn}
          style={styles.button}
          buttonColor={theme.colors.primary}
        >
          登录
        </Button>
        {/* <Link href="/modal" style={styles.registerLink}> */}
        <Text
          variant="bodyMedium"
          style={{
            ...styles.registerLink,
            color: theme.colors.primary,
            fontSize: 16,
          }}
          onPress={() => {
            // router.push("/modal");

            handleSnapPress(0);
          }}
        >
          没有账号？注册一个
        </Text>
          {/* <Link href="/(tabs)/home" style={styles.registerLink}>
          <Text >测试，跳转主页</Text>
          
            
          </Link> */}
        {/* <Button onPress={() => handleSnapPress(0)}>测试</Button> */}

        {/* 控制弹窗 */}
        {/* <SignUpModal visible={visible} onClose={() => setVisible(false)} /> */}

        {/* </Link> */}
      </KeyboardAvoidingView>

      {visible && (
      <Pressable style={styles.overlay} onPress={handleClosePress} />
    )}
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
        index={-1}
        // index={visible ? 0 : -1}
        enablePanDownToClose={true}
        backgroundStyle={{
          backgroundColor: theme.colors.background,
        }}
        style={styles.BottomSheet}
      >
        <RegisterForm onSubmit={handleClosePress} isFull={isSheetFull}/>
      </BottomSheet>

    </Surface>
    
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.25)", // 半透明黑色
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "bold",
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  registerLink: {
    alignSelf: "center",
    marginTop: 16,
  },
  BottomSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
