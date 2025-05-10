// components/screens/index.tsx
import React, { useRef } from "react";
import { Button, Text, Surface, Drawer } from "react-native-paper";
import { StyleSheet } from "react-native";

import { useRouter } from "expo-router";
import { Appbar } from "react-native-paper";
import ThemeToggleButton from "../../../src/theme/ThemeToggleButton";
import { DrawerLayout } from "react-native-gesture-handler";

export default function Hot() {
  const router = useRouter();
  // const drawerRef = useRef<DrawerLayout>(null);

  // // 可配合按钮触发侧抽屉打开
  // const openDrawer = () => {
  //   drawerRef.current && drawerRef.current.openDrawer();
  // };
    // <Surface style={styles.container}>
    //    <DrawerLayout
    //   ref={drawerRef}
    //   drawerWidth={260}
    //   drawerPosition="left"
    //   // 抽屉内容
    //   renderNavigationView={() => (
    //     <Surface style={styles.drawerContent}>
    //       <Drawer.Section>
    //         <Drawer.Item label="主页" onPress={() => {}} />
    //         <Drawer.Item label="消息" onPress={() => {}} />
    //         <Drawer.Item label="设置" onPress={() => {}} />
    //       </Drawer.Section>
    //     </Surface>
    //   )}
    // >
    //   <Surface style={styles.container}>
    //     <Text variant="headlineMedium">Home 页面</Text>
    //     <Button onPress={openDrawer} icon="menu">打开抽屉</Button>
    //     <Text>这里右滑也能打开抽屉。其它Tab页面没抽屉和手势。</Text>
    //   </Surface>
    // </DrawerLayout>
    // </Surface>
  return (
    <Surface style={styles.container}>
      <Text>这里右滑也能打开抽屉。其它Tab页面没抽屉和手势。</Text>
    </Surface>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // gap: 10,
    // backgroundColor: "#EC2525FF",
  },
  drawerContent: { flex: 1, backgroundColor: "#fff" },
});
