// components/SignUpModal.tsx
import React from "react";
import { Modal, View, StyleSheet, Pressable } from "react-native";
import { Surface, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

export default function SignUpModal({ visible, onClose }: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* 半透明背景 */}
        {/* <LinearGradient
          colors={["#ffffff", "rgba(0,0,0,0.4)"]}
          style={StyleSheet.absoluteFill}
        /> */}
        {/* 点击背景关闭 */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* 弹窗内容 */}
        <Surface style={styles.modal}>
          <Text variant="headlineMedium">注册</Text>
          {/* 你的注册表单 */}
        </Surface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modal: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: "40%",
  },
});
