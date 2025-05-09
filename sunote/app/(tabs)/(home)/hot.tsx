// components/screens/index.tsx
import React from "react";
import { Button, Text,Surface, } from "react-native-paper";
import { StyleSheet } from "react-native";

import { useRouter } from "expo-router";
import { Appbar } from "react-native-paper";
import ThemeToggleButton from "../../../src/theme/ThemeToggleButton";

export default function Hot() {
  const router = useRouter();

  return (
    <Surface style={styles.container}>
      <Appbar.Header>
        {/* <Appbar.Content title="个人中心" /> */}
        <ThemeToggleButton />
      </Appbar.Header>
      <Text>热门 Screen</Text>
      <Text>Open up 'src/App.tsx' to start working on your app!</Text>
      {/* <Button title="Go to Settings" onPress={() => router.push("/Setting")} /> */}
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
});
