// app/drawer
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { withLayoutContext } from 'expo-router';
import { Avatar, IconButton, List,Surface,Text } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

export default function Drawer() {
  const router = useRouter();

  // 假设这里有用户信息
  const user = {
    name: '张三',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  };

  return (
      <Surface style={styles.header}>
        {/* 用户头像 */}
        <Avatar.Image source={{ uri: user.avatar }} size={60} />
        <Surface style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.userName}>{user.name}</Text>
        </Surface>
        {/* 设置按钮 */}
        <IconButton
          icon="cog-outline"
          size={24}
          onPress={() => router.push('/drawer/settings')}
        />
        {/* 扫一扫按钮 */}
        <IconButton
          icon="qrcode-scan"
          size={24}
          onPress={() => router.push('/drawer/scan')}
        />
      </Surface>
    );
    //   <DrawerItemList {...props} />
}

// export default function DrawerLayout() {
//   return (
//     <Drawer
//       drawerContent={(props) => <CustomDrawerContent {...props} />}
//       screenOptions={{
//         headerShown: true,      // 若需隐藏抽屉外导航头可以改false
//       }}
//     >
//       <Drawer.Screen
//         name="(tabs)"
//         options={{
//           title: '工作台',
//           drawerIcon: ({ color, size }) => (
//             <Ionicons name="home-outline" color={color} size={size} />
//           ),
//         }}
//       />
//       <Drawer.Screen
//         name="settings"
//         options={{
//           title: '设置',
//           drawerIcon: ({ color, size }) => (
//             <Ionicons name="settings-outline" color={color} size={size} />
//           ),
//         }}
//       />
//       <Drawer.Screen 
//         name="scan"
//         options={{
//           title: '扫一扫',
//           drawerIcon: ({ color, size }) => (
//             <MaterialIcons name="qr-code-scanner" color={color} size={size} />
//           ),
//         }}
//       />
//     </Drawer>
//   );
// }

const styles = StyleSheet.create({
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  }
});