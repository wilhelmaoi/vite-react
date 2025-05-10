// app/modal/sign-up.tsx
import { View, Pressable, StyleSheet } from "react-native";
import { Surface, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import React from "react";
import { useTheme } from "../../src/theme/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { MotiView } from "moti";
import { useMaskStore } from "../../src/context/store";

export default function SignUpModal() {
  const router = useRouter();
  const theme = useTheme();
  //theme.colors.background
  const { visible, setVisible } = useMaskStore();
  const fold =() => {
    setVisible(false);
    router.back();
  }
  return (
     <View style={styles.overlay} >

      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={fold}
      ></Pressable>

      <Surface style={styles.modal}>
        <Text variant="headlineMedium">注册</Text>
        {/* 注册表单内容... */}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    minHeight: "50%",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  
});
