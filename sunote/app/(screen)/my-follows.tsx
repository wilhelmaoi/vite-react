import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Surface, Text, Card, Avatar, IconButton, Appbar, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import request from '../../src/database/request';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuthStore } from '../../src/context/store';

interface FollowUser {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  bio: string;
  isFollowEachOther: boolean;
  followTime: string;
}

export default function MyFollows() {
  const theme = useTheme();
  const router = useRouter();
  const { username } = useAuthStore();
  const [followingList, setFollowingList] = useState<FollowUser[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 加载关注列表
  const loadFollowingList = useCallback(async (pageNum = 1, refresh = false) => {
    if (!username) {
      console.error('用户未登录');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (refresh) {
        setRefreshing(true);
        pageNum = 1;
      } else if (pageNum === 1) {
        setLoading(true);
      }

      const response = await request({
        method: 'GET',
        url: `/user/follow/following?username=${username}&page=${pageNum}&size=20`,
      });

      if (response.data.code === 200) {
        const newList = response.data.data;
        console.log(`加载了${newList.length}条关注数据`);
        
        if (refresh || pageNum === 1) {
          setFollowingList(newList);
          setPage(pageNum);
          setHasMore(newList.length === 20);
        } else {
          setFollowingList(prev => [...prev, ...newList]);
          setPage(pageNum);
          setHasMore(newList.length === 20);
        }
      } else {
        console.error('获取关注列表失败:', response.data.msg);
      }
    } catch (error) {
      console.error('加载关注列表数据出错:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [username]);

  // 首次加载
  useEffect(() => {
    loadFollowingList();
  }, [loadFollowingList]);

  // 下拉刷新
  const handleRefresh = useCallback(() => {
    loadFollowingList(1, true);
  }, [loadFollowingList]);

  // 加载更多
  const handleLoadMore = useCallback(() => {
    if (!refreshing && !loading && hasMore) {
      loadFollowingList(page + 1);
    }
  }, [refreshing, loading, hasMore, page, loadFollowingList]);

  // 关注/取消关注
  const handleFollow = async (targetUsername: string, event: any) => {
    event.stopPropagation();
    
    try {
      if (!username) {
        Alert.alert('提示', '请先登录');
        return;
      }

      const response = await request({
        method: 'POST',
        url: '/user/follow',
        data: {
          followerUsername: username,
          followingUsername: targetUsername
        }
      });

      if (response.data.code === 200) {
        // 更新关注状态
        setFollowingList(prevList => 
          prevList.map(user => 
            user.username === targetUsername
              ? { ...user, isFollowEachOther: !user.isFollowEachOther }
              : user
          )
        );
      } else {
        Alert.alert('提示', response.data.msg || '操作失败');
      }
    } catch (error) {
      console.error('关注操作失败:', error);
      Alert.alert('提示', '操作失败，请稍后重试');
    }
  };

  // 渲染用户项
  const renderUserItem = ({ item }: { item: FollowUser }) => {
    const handleUserPress = () => {
      router.push(`/(screen)/user-profile?username=${item.username}`);
    };

    return (
      <Card 
        style={[styles.userCard, { backgroundColor: theme.colors.onSecondary }]} 
        mode="elevated"
        onPress={handleUserPress}
      >
        <Card.Content style={styles.userCardContent}>
          <View style={styles.userInfo}>
            {item.avatar ? (
              <Avatar.Image 
                size={50} 
                source={{ uri: item.avatar }} 
                style={{ backgroundColor: theme.colors.surfaceVariant }}
              />
            ) : (
              <Avatar.Text 
                size={50} 
                label={item.username.substring(0, 2).toUpperCase()} 
                style={{ backgroundColor: theme.colors.primary }}
              />
            )}
            <View style={styles.userTextContainer}>
              <Text style={[styles.nickname, { color: theme.colors.primary }]}>{item.nickname}</Text>
              <Text style={styles.username}>@{item.username}</Text>
              {item.bio && (
                <Text style={styles.bio} numberOfLines={2}>{item.bio}</Text>
              )}
            </View>
          </View>
          <Button
            mode={item.isFollowEachOther ?  "contained":"outlined"}
            onPress={(e) => handleFollow(item.username, e)}
            style={styles.followButton}
          >
            {item.isFollowEachOther ? "关注" : "已关注"}
          </Button>
        </Card.Content>
      </Card>
    );
  };

  // 渲染加载指示器或空状态
  const renderFooter = () => {
    if (loading && page > 1) {
      return (
        <View style={styles.footerContainer}>
          <Text>正在加载更多...</Text>
        </View>
      );
    }
    
    if (!hasMore && followingList.length > 0) {
      return (
        <View style={styles.footerContainer}>
          <Text>没有更多内容了</Text>
        </View>
      );
    }
    
    return null;
  };

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>您还没有关注任何人</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/home')}>
          <Text style={[styles.discoverText, { color: theme.colors.primary }]}>
            去发现更多用户
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="我的关注" />
      </Appbar.Header>
      
      <FlatList
        data={followingList}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        initialNumToRender={10}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 12,
    paddingBottom: 20,
    flexGrow: 1,
  },
  userCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  nickname: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  username: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
  bio: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
  },
  followButton: {
    marginLeft: 12,
  },
  footerContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
    opacity: 0.6,
  },
  discoverText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 