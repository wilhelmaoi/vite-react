import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { Surface, Text, Card, Avatar, Chip, Divider, IconButton, Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import request from '../../../src/database/request';
import { useTheme } from '../../../src/theme/ThemeContext';
import { useAuthStore } from '../../../src/context/store';
import * as FileSystem from 'expo-file-system';

// 帖子数据类型
interface PostItem {
  id: number;
  username: string;
  content: string;
  imageUrls: string[];
  likeCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  location?: string;
  mood?: string;
}

export default function MyPosts() {
  const theme = useTheme();
  const router = useRouter();
  const { username, user, avatarUri } = useAuthStore();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // 获取本地缓存的头像路径
  const LOCAL_AVATAR_PATH = useMemo(() => {
    return (FileSystem.cacheDirectory ?? '') + user?.username + "/avatar.jpg";
  }, [user?.username]);

  // 加载用户帖子数据
  const loadPosts = useCallback(async (pageNum = 1, refresh = false) => {
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
        url: `/post/user/${username}?page=${pageNum}&size=10`,
      });

      if (response.data.code === 200) {
        const newPosts = response.data.data;
        if (refresh || pageNum === 1) {
          setPosts(newPosts);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
        }
        setHasMore(newPosts.length === 10);
        setPage(pageNum);
      } else {
        console.error('获取用户帖子失败:', response.data.msg);
      }
    } catch (error) {
      console.error('加载用户帖子数据出错:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [username]);

  // 首次加载
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // 下拉刷新
  const handleRefresh = useCallback(() => {
    loadPosts(1, true);
  }, [loadPosts]);

  // 加载更多
  const handleLoadMore = useCallback(() => {
    if (!refreshing && !loading && hasMore) {
      loadPosts(page + 1);
    }
  }, [refreshing, loading, hasMore, page, loadPosts]);

  // 渲染帖子项
  const renderPostItem = ({ item }: { item: PostItem }) => {
    // 格式化日期
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // 提取内容中的标签
    const extractTags = (content: string) => {
      const tagRegex = /#[^\s#]+/g;
      const tags: string[] = [];
      let match;
      
      while ((match = tagRegex.exec(content)) !== null) {
        tags.push(match[0]);
      }
      
      return tags;
    };

    const tags = extractTags(item.content);
    
    // 使用本地缓存的头像（只针对当前用户的帖子）
    const useLocalAvatar = item.username === username;
    const avatarSource = useLocalAvatar && avatarUri 
      ? { uri: avatarUri }
      : undefined;

    return (
      <Card style={[styles.postCard, { backgroundColor: theme.colors.surface }]} mode="outlined">
        <Card.Content>
          {/* 用户信息区 */}
          <View style={styles.userInfoContainer}>
            {avatarSource ? (
              <Avatar.Image 
                size={40}
                source={avatarSource}
              />
            ) : (
              <Avatar.Text 
                size={40} 
                label={item.username.substring(0, 2).toUpperCase()} 
                style={{ backgroundColor: theme.colors.primary }}
              />
            )}
            <View style={styles.userTextContainer}>
              <Text style={[styles.username, { color: theme.colors.primary }]}>{item.username}</Text>
              <Text style={styles.postTime}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>

          {/* 内容区 */}
          <Text style={[styles.postContent, { color: theme.colors.onSurface }]}>
            {item.content}
          </Text>

          {/* 标签区 */}
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <Chip 
                  key={index}
                  style={{ backgroundColor: theme.colors.primaryContainer, marginRight: 8, marginBottom: 8 }}
                  textStyle={{ color: theme.colors.primary }}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          )}

          {/* 图片区 */}
          {item.imageUrls && item.imageUrls.length > 0 && (
            <View style={styles.imagesContainer}>
              {item.imageUrls.slice(0, 3).map((url, index) => (
                <Image 
                  key={index}
                  source={{ uri: url }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              ))}
              {item.imageUrls.length > 3 && (
                <View style={styles.moreImagesIndicator}>
                  <Text style={styles.moreImagesText}>+{item.imageUrls.length - 3}</Text>
                </View>
              )}
            </View>
          )}

          {/* 位置和心情 */}
          <View style={styles.metaInfoContainer}>
            {item.location && (
              <Chip 
                icon="map-marker"
                style={styles.metaChip}
              >
                {item.location}
              </Chip>
            )}
            {item.mood && (
              <Chip 
                icon="emoticon-outline"
                style={styles.metaChip}
              >
                {item.mood}
              </Chip>
            )}
          </View>

          {/* 互动区 */}
          <View style={styles.interactionContainer}>
            <View style={styles.interactionItem}>
              <IconButton icon="heart-outline" size={20} />
              <Text>{item.likeCount}</Text>
            </View>
            <View style={styles.interactionItem}>
              <IconButton icon="comment-outline" size={20} />
              <Text>{item.commentCount}</Text>
            </View>
            <View style={styles.interactionItem}>
              <IconButton icon="eye-outline" size={20} />
              <Text>{item.viewCount}</Text>
            </View>
          </View>
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
    
    if (!hasMore && posts.length > 0) {
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
        <Text style={styles.emptyText}>您还没有发布任何帖子</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/Post')}>
          <Text style={[styles.createPostText, { color: theme.colors.primary }]}>
            立即发布第一个帖子
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="我的发帖" />
      </Appbar.Header>
      
      <FlatList
        data={posts}
        renderItem={renderPostItem}
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
        initialNumToRender={5}
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
  postCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userTextContainer: {
    marginLeft: 12,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  postTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  postImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  moreImagesIndicator: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreImagesText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  metaInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  metaChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  interactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  interactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  createPostText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 