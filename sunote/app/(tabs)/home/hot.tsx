// components/screens/hot.tsx
import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, FlatList, RefreshControl, Image, TouchableOpacity, Alert } from "react-native";
import { Surface, Text, Card, Avatar, Chip, Divider, IconButton, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import request from "../../../src/database/request";
import { useTheme } from "../../../src/theme/ThemeContext";
import { useAuthStore } from "../../../src/context/store";
import { PostItem } from "../../../src/context/store";


export default function Hot() {
  const theme = useTheme();
  const router = useRouter();
  const { username } = useAuthStore();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});

  // 获取用户头像的函数
  const fetchUserAvatars = async (usernames: string[]) => {
    try {
      // 过滤掉重复的用户名
      const uniqueUsernames = [...new Set(usernames)];
      
      // 对于每个用户名，获取其头像 URL
      const avatarPromises = uniqueUsernames.map(async (name) => {
        // 如果已经有缓存，就不再请求
        if (userAvatars[name]) return { username: name, avatar: userAvatars[name] };
        
        // 确保URL格式正确
        const url = `/user/avatar/${name}`;
        console.log(`请求用户 ${name} 的头像，URL: ${url}`);
        
        const response = await request({
          method: 'GET',
          url: url,
        });
        
        if (response.data.code === 200 && response.data.data) {
          const avatarData = response.data.data;
          const avatarUrl = avatarData.avatarUrl || '';
          console.log(`获取到用户 ${name} 的头像: ${avatarUrl ? (avatarUrl.substring(0, 30) + '...') : '无'}`);
          
          if (!avatarUrl || !avatarUrl.startsWith('http')) {
            console.error(`用户 ${name} 头像URL格式不正确:`, avatarUrl);
            return { username: name, avatar: '' };
          }
          
          return { 
            username: name, 
            avatar: avatarUrl 
          };
        }
        console.log(`未获取到用户 ${name} 的头像数据`);
        return { username: name, avatar: '' };
      });
      
      const avatarResults = await Promise.all(avatarPromises);
      
      // 更新头像缓存
      const newAvatars: Record<string, string> = {};
      avatarResults.forEach(item => {
        newAvatars[item.username] = item.avatar;
      });
      
      setUserAvatars(prev => ({ ...prev, ...newAvatars }));
      
      // 更新帖子列表，添加头像信息
      setPosts(prevPosts => 
        prevPosts.map(post => ({
          ...post,
          avatar: newAvatars[post.username] || ''
        }))
      );
    } catch (error) {
      console.error('获取用户头像失败:', error);
    }
  };
  
  // 获取用户点赞状态
  const fetchLikeStatus = async (postIds: string[]) => {
    try {
      if (!username) return;
      
      // 过滤掉重复的帖子ID
      const uniquePostIds = [...new Set(postIds)];
      console.log('获取点赞状态: postIds=', uniquePostIds, 'username=', username);
      
      // 对于每个帖子ID，获取当前用户是否点赞
      const likePromises = uniquePostIds.map(async (postId) => {
        // 如果已经有缓存，就不再请求
        // if (likedPosts[postId] !== undefined) return { postId, liked: likedPosts[postId] };
        
        try {
          // 改为使用POST请求，将username放在请求体中，避免Spring参数解析问题
          const response = await request({
            method: 'POST',
            url: `/post/${postId}/like/check`,
            data: { username }
          });
          
          console.log(`获取点赞状态响应: postId=${postId}, code=${response.data?.code}, data=`, response.data?.data);
          
          if (response.data?.code === 200) {
            return { 
              postId, 
              liked: response.data.data 
            };
          }
          return { postId, liked: false };
        } catch (err) {
          console.error(`获取单个帖子(${postId})点赞状态失败:`, err);
          return { postId, liked: false };
        }
      });
      
      const likeResults = await Promise.all(likePromises);
      console.log('点赞状态结果:', likeResults);
      
      // 更新点赞缓存
      const newLikes: Record<string, boolean> = {};
      likeResults.forEach(item => {
        newLikes[item.postId] = item.liked;
      });
      
      setLikedPosts(prev => ({ ...prev, ...newLikes }));
    } catch (error) {
      console.error('获取用户点赞状态失败:', error);
    }
  };

  // 获取关注状态
  const fetchFollowStatus = async (usernames: string[]) => {
    try {
      if (!username) return;
      
      // 过滤掉重复的用户名和当前用户
      const uniqueUsernames = [...new Set(usernames)].filter(name => name !== username);
      
      // 请求关注状态
      const followPromises = uniqueUsernames.map(async (followingUsername) => {
        try {
          const response = await request({
            method: 'GET',
            url: `/user/follow/check?followerUsername=${username}&followingUsername=${followingUsername}`,
          });
          
          if (response.data?.code === 200) {
            return { 
              username: followingUsername, 
              followed: response.data.data 
            };
          }
          return { username: followingUsername, followed: false };
        } catch (err) {
          console.error(`获取关注状态失败:`, err);
          return { username: followingUsername, followed: false };
        }
      });
      
      const followResults = await Promise.all(followPromises);
      
      // 更新关注状态缓存
      const newFollowStatus: Record<string, boolean> = {};
      followResults.forEach(item => {
        newFollowStatus[item.username] = item.followed;
      });
      
      setFollowStatus(prev => ({ ...prev, ...newFollowStatus }));
    } catch (error) {
      console.error('获取关注状态失败:', error);
    }
  };

  // 加载帖子数据
  const loadPosts = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        pageNum = 1;
      } else if (pageNum === 1) {
        setLoading(true);
      }

      const response = await request({
        method: 'GET',
        url: `/post/hot?page=${pageNum}&size=10`,
      });

      if (response.data.code === 200) {
        const newPosts = response.data.data;
        console.log(`加载了${newPosts.length}条热门帖子`);
        
        // 更新帖子列表
        if (refresh || pageNum === 1) {
          setPosts(newPosts);
          setPage(pageNum);
          setHasMore(newPosts.length === 10);
          
          // 获取新帖子的用户头像和点赞状态
          if (newPosts.length > 0) {
            // 先更新UI，然后异步获取头像和点赞状态
            setTimeout(() => {
              fetchUserAvatars(newPosts.map(post => post.username));
              if (username) {
                fetchLikeStatus(newPosts.map(post => post.id));
                fetchFollowStatus(newPosts.map(post => post.username));
              }
            }, 100);
          }
        } else {
          setPosts(prev => [...prev, ...newPosts]);
          setPage(pageNum);
          setHasMore(newPosts.length === 10);
          
          // 获取新加载帖子的用户头像和点赞状态
          if (newPosts.length > 0) {
            // 先更新UI，然后异步获取头像和点赞状态
            setTimeout(() => {
              fetchUserAvatars(newPosts.map(post => post.username));
              if (username) {
                fetchLikeStatus(newPosts.map(post => post.id));
                fetchFollowStatus(newPosts.map(post => post.username));
              }
            }, 100);
          }
        }
      } else {
        console.error('获取热门帖子失败:', response.data.msg);
      }
    } catch (error) {
      console.error('加载热门帖子数据出错:', error);
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

  // 点赞功能
  const handleLike = async (id: string, event: any) => {
    // 阻止事件冒泡，防止触发卡片点击
    event.stopPropagation();
    
    try {
      if (!username) {
        Alert.alert('提示', '请先登录');
        return;
      }
      
      const currentLiked = likedPosts[id] || false;
      console.log(`点赞操作: postId=${id}, 当前状态=${currentLiked ? '已点赞' : '未点赞'}`);
      
      // 先更新UI状态，提高响应速度
      setLikedPosts(prev => ({ ...prev, [id]: !currentLiked }));
      
      // 更新本地点赞数
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === id 
            ? { 
                ...post, 
                likeCount: currentLiked ? post.likeCount - 1 : post.likeCount + 1 
              } 
            : post
        )
      );
      
      // 发送请求到服务器
      const response = await request({
        method: 'POST',
        url: `/post/${id}/like`,
        data: { username }
      });
      
      console.log(`点赞请求响应: postId=${id}, code=${response.data?.code}, data=`, response.data?.data);

      if (response.data?.code !== 200) {
        console.error('点赞请求失败:', response.data?.msg);
        // 如果请求失败，回滚状态
        setLikedPosts(prev => ({ ...prev, [id]: currentLiked }));
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === id 
              ? { 
                  ...post, 
                  likeCount: currentLiked ? post.likeCount + 1 : post.likeCount - 1 
                } 
              : post
          )
        );
      } else {
        // 服务器返回成功，可以更新为服务器返回的实际状态
        const serverLiked = response.data?.data?.liked;
        if (serverLiked !== undefined) {
          setLikedPosts(prev => ({ ...prev, [id]: serverLiked }));
        }
      }
    } catch (error) {
      console.error('点赞操作失败:', error);
      // 发生错误时，也需要回滚状态
      const currentLiked = likedPosts[id] || false;
      setLikedPosts(prev => ({ ...prev, [id]: currentLiked }));
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === id 
            ? { 
                ...post, 
                likeCount: currentLiked ? post.likeCount + 1 : post.likeCount - 1 
              } 
            : post
        )
      );
    }
  };

  // 跳转到帖子详情
  const navigateToPostDetail = (postId: string) => {
    router.push(`/(screen)/post-detail?id=${postId}`);
  };

  // 关注用户功能
  const handleFollow = async (followingUsername: string, event: any) => {
    // 阻止事件冒泡，防止触发卡片点击
    event.stopPropagation();
    
    try {
      if (!username) {
        Alert.alert('提示', '请先登录');
        return;
      }
      
      // 获取当前关注状态
      const isFollowed = followStatus[followingUsername] || false;
      
      // 先更新UI状态，提高响应速度
      setFollowStatus(prev => ({ ...prev, [followingUsername]: !isFollowed }));
      
      // 发送请求到服务器
      const response = await request({
        method: 'POST',
        url: '/user/follow',
        data: { 
          followerUsername: username, 
          followingUsername 
        }
      });
      
      if (response.data?.code !== 200) {
        console.error('关注请求失败:', response.data?.msg);
        // 如果请求失败，回滚状态
        setFollowStatus(prev => ({ ...prev, [followingUsername]: isFollowed }));
        Alert.alert('操作失败', response.data?.msg || '关注操作失败，请稍后重试');
      }
    } catch (error) {
      console.error('关注操作失败:', error);
      // 发生错误时，也需要回滚状态
      const isFollowed = followStatus[followingUsername] || false;
      setFollowStatus(prev => ({ ...prev, [followingUsername]: isFollowed }));
      Alert.alert('操作失败', '关注操作失败，请稍后重试');
    }
  };

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
    const isLiked = likedPosts[item.id] || false;
    const isFollowed = followStatus[item.username] || false;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigateToPostDetail(item.id)}
      >
        <Card style={[styles.postCard, { backgroundColor: theme.colors.onSecondary }]}  mode="elevated">
          <Card.Content>
            {/* 用户信息区 */}
            <View style={styles.userInfoContainer}>
              <View style={styles.userInfoLeft}>
                {item.avatar ? (
                  <Avatar.Image 
                    size={40} 
                    source={{ uri: item.avatar }} 
                    style={{ backgroundColor: theme.colors.surfaceVariant }}
                    onError={(e) => {
                      console.error('头像加载失败:', item.avatar, e.nativeEvent.error);
                    }}
                  />
                ) : (
                  <Avatar.Text 
                    size={40} 
                    label={item.username.substring(0, 2).toUpperCase()} 
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                )}
                <View style={styles.userTextContainer}>
                  <Text style={[styles.username, { color: theme.colors.primary }]}>{item.nickname}</Text>
                  <Text style={styles.postTime}>{formatDate(item.createdAt)}</Text>
                </View>
              </View>
              
              {/* 不是当前用户才显示关注按钮 */}
              {item.username !== username && 
                <TouchableOpacity 
                  onPress={(e) => handleFollow(item.username, e)}
                  style={[
                    styles.followButton, 
                    { 
                      borderColor: isFollowed ? theme.colors.outline : theme.colors.primary,
                      borderWidth: 1,
                      backgroundColor: isFollowed ? theme.colors.surfaceVariant : 'transparent' 
                    }
                  ]}
                >
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <IconButton 
                      icon={isFollowed ? "account-check" : "account-plus-outline"} 
                      size={14} 
                      iconColor={isFollowed ? theme.colors.outline : theme.colors.primary}
                      style={{margin: 0, padding: 0, marginRight: -5}}
                    />
                    <Text style={{
                      color: isFollowed ? theme.colors.outline : theme.colors.primary, 
                      fontSize: 13, 
                      marginLeft: 4,
                      marginBottom: 3
                    }}>
                      {isFollowed ? '已关注' : '关注'}
                    </Text>
                  </View>
                </TouchableOpacity>
              }
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
              <TouchableOpacity 
                style={styles.interactionItem}
                onPress={(e) => handleLike(item.id, e)}
              >
                <IconButton 
                  icon={isLiked ? "heart" : "heart-outline"} 
                  size={20}
                  iconColor={isLiked ? theme.colors.error : undefined}
                />
                <Text>{item.likeCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.interactionItem}>
                <IconButton icon="comment-outline" size={20} />
                <Text>{item.commentCount}</Text>
              </TouchableOpacity>
              <View style={styles.interactionItem}>
                <IconButton icon="eye-outline" size={20} />
                <Text>{item.viewCount}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
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
        <Text style={styles.emptyText}>还没有任何热门帖子</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/Post')}>
          <Text style={[styles.createPostText, { color: theme.colors.primary }]}>
            发布帖子，成为热门博主
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
    justifyContent: 'space-between',
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  followButton: {
    borderRadius: 15,
    height: 30,
    paddingHorizontal: 10,
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
