import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Text } from 'react-native-paper';
import { useTheme } from '../theme/ThemeContext';
import { AntDesign } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { DrawerContentComponentProps } from '@react-navigation/drawer';

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const theme = useTheme();

  return (
    <DrawerContentScrollView {...props}>
      {/* 用户信息区域 */}
      <View style={[styles.userSection, { backgroundColor: theme.colors.primary }]}>
        <Link href="/profile" asChild>
          <TouchableOpacity style={styles.userInfo}>
            <Image
              source={{ uri: 'https://via.placeholder.com/100' }}
              style={styles.avatar}
            />
            <View style={styles.userTextContainer}>
              <Text style={[styles.userName, { color: theme.colors.onPrimary }]}>用户名</Text>
              <Text style={[styles.userEmail, { color: theme.colors.onPrimary }]}>user@example.com</Text>
            </View>
          </TouchableOpacity>
        </Link>
      </View>

      {/* 菜单项 */}
      <View style={styles.menuSection}>
        <Link href="/(tabs)/home" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <AntDesign name="home" size={24} color={theme.colors.primary} />
            <Text style={[styles.menuText, { color: theme.colors.primary }]}>首页</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/favorites" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <AntDesign name="star" size={24} color={theme.colors.primary} />
            <Text style={[styles.menuText, { color: theme.colors.primary }]}>我的收藏</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/settings" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <AntDesign name="setting" size={24} color={theme.colors.primary} />
            <Text style={[styles.menuText, { color: theme.colors.primary }]}>设置</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* 底部区域 */}
      <View style={[styles.bottomSection, { borderTopColor: theme.colors.outlineVariant }]}>
        <Link href="/sign-in" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <AntDesign name="logout" size={24} color={theme.colors.error} />
            <Text style={[styles.menuText, { color: theme.colors.error }]}>退出登录</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  userSection: {
    padding: 16,
    marginTop: -4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.8,
  },
  menuSection: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 32,
  },
  menuText: {
    fontSize: 16,
  },
  bottomSection: {
    paddingVertical: 16,
    borderTopWidth: 1,
    marginTop: 8,
  },
}); 