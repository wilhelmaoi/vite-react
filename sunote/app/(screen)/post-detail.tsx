import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { 
  Surface, 
  Text, 
  Card, 
  Avatar, 
  Chip, 
  Divider, 
  IconButton, 
  Appbar,
  TextInput,
  Button,
  ActivityIndicator
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import request from '../../src/database/request';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuthStore } from '../../src/context/store';
import * as FileSystem from 'expo-file-system';
import { PostItem, CommentItem } from '../../src/context/store';



export default function PostDetail() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { username, user, avatarUri } = useAuthStore();
  const [post, setPost] = useState<PostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [collected, setCollected] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const scrollViewRef = useRef<ScrollView>(null);
  
  // 加载帖子详情
  useEffect(() => {
    if (!id) return;
    
    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        const response = await request({
          method: 'GET',
          url: `/post/${id}`,
        });
        
        if (response.data.code === 200) {
          setPost(response.data.data);
          // 检查用户是否已经点赞/收藏
          checkUserInteraction();
        } else {
          console.error('获取帖子详情失败:', response.data.msg);
        }
      } catch (error) {
        console.error('加载帖子详情出错:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPostDetail();
  }, [id]);
  
  // 加载评论
  useEffect(() => {
    if (!id) return;
    
    const fetchComments = async () => {
      try {
        setCommentLoading(true);
        const response = await request({
          method: 'GET',
          url: `/post/${id}/comments`,
        });
        
        if (response.data.code === 200) {
          setComments(response.data.data || []);
        } else {
          console.error('获取评论失败:', response.data.msg);
        }
      } catch (error) {
        console.error('加载评论出错:', error);
      } finally {
        setCommentLoading(false);
      }
    };
    
    fetchComments();
  }, [id]);
  
  // 检查用户交互状态（点赞/收藏）
  const checkUserInteraction = async () => {
    if (!username || !id) return;
    
    try {
      // 检查是否点赞
      const likeResponse = await request({
        method: 'GET',
        url: `/post/${id}/like/check?username=${username}`,
      });
      
      if (likeResponse.data.code === 200) {
        setLiked(likeResponse.data.data);
      }
      
      // 检查是否收藏
      const collectResponse = await request({
        method: 'GET',
        url: `/post/${id}/collect/check?username=${username}`,
      });
      
      if (collectResponse.data.code === 200) {
        setCollected(collectResponse.data.data);
      }
    } catch (error) {
      console.error('检查用户交互状态出错:', error);
    }
  };
  
  // 处理点赞
  const handleLike = async () => {
    if (!username || !id) return;
    
    try {
      const response = await request({
        method: 'POST',
        url: `/post/${id}/like`,
        data: { username }
      });
      
      if (response.data.code === 200) {
        setLiked(!liked);
        // 更新点赞数
        if (post) {
          setPost({
            ...post,
            likeCount: liked ? post.likeCount - 1 : post.likeCount + 1
          });
        }
      } else {
        console.error('点赞操作失败:', response.data.msg);
      }
    } catch (error) {
      console.error('点赞操作出错:', error);
    }
  };
  
  // 处理收藏
  const handleCollect = async () => {
    if (!username || !id) return;
    
    try {
      const response = await request({
        method: 'POST',
        url: `/post/${id}/collect`,
        data: { username }
      });
      
      if (response.data.code === 200) {
        setCollected(!collected);
      } else {
        console.error('收藏操作失败:', response.data.msg);
      }
    } catch (error) {
      console.error('收藏操作出错:', error);
    }
  };
  
  // 提交评论
  const handleSubmitComment = async () => {
    if (!commentText.trim() || !username || !id) return;
    
    try {
      setCommentSubmitting(true);
      
      const response = await request({
        method: 'POST',
        url: `/post/${id}/comment`,
        data: {
          username,
          nickname: user?.nickname || username,
          content: commentText
        }
      });
      
      if (response.data.code === 200) {
        // 添加新评论到列表
        const newComment = response.data.data;
        setComments([...comments, newComment]);
        setCommentText('');
        
        // 更新评论数
        if (post) {
          setPost({
            ...post,
            commentCount: post.commentCount + 1
          });
        }
        
        // 滚动到底部
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 300);
      } else {
        console.error('发表评论失败:', response.data.msg);
      }
    } catch (error) {
      console.error('发表评论出错:', error);
    } finally {
      setCommentSubmitting(false);
    }
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric',
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
  
  // 查看大图
  const handleViewImage = (index: number) => {
    setCurrentImageIndex(index);
    setImageViewerVisible(true);
  };
  
  // 渲染评论项
  const renderCommentItem = ({ item }: { item: CommentItem }) => {
    const isCurrentUser = item.username === username;
    
    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <View style={styles.commentUserInfo}>
            {isCurrentUser && avatarUri ? (
              <Avatar.Image 
                size={32}
                source={{ uri: avatarUri }}
              />
            ) : (
              <Avatar.Text 
                size={32} 
                label={item.nickname.substring(0, 2).toUpperCase()}
                style={{ backgroundColor: theme.colors.primary }}
              />
            )}
            <View style={styles.commentUserText}>
              <Text style={[styles.commentUsername, { color: theme.colors.primary }]}>
                {item.nickname}
              </Text>
              <Text style={styles.commentTime}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.commentContent}>{item.content}</Text>
      </View>
    );
  };
  
  if (loading) {
    return (
      <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="帖子详情" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16 }}>加载中...</Text>
        </View>
      </Surface>
    );
  }
  
  if (!post) {
    return (
      <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="帖子详情" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <Text>帖子不存在或已被删除</Text>
        </View>
      </Surface>
    );
  }
  
  const tags = post.tags || extractTags(post.content);
  
  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="帖子详情" />
      </Appbar.Header>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 帖子内容卡片 */}
          <Card style={[styles.postCard, { backgroundColor: theme.colors.surface }]} mode="elevated">
            <Card.Content>
              {/* 用户信息区 */}
              <View style={styles.userInfoContainer}>
                <Avatar.Text 
                  size={45} 
                  label={post.username.substring(0, 2).toUpperCase()} 
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <View style={styles.userTextContainer}>
                  <Text style={[styles.username, { color: theme.colors.primary }]}>
                    {post.nickname}
                  </Text>
                  <Text style={styles.postTime}>
                    {formatDate(post.createdAt)}
                  </Text>
                </View>
              </View>

              {/* 内容区 */}
              <Text style={[styles.postContent, { color: theme.colors.onSurface }]}>
                {post.content}
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
              {post.imageUrls && post.imageUrls.length > 0 && (
                <View style={styles.imagesContainer}>
                  {post.imageUrls.map((url, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.imageWrapper}
                      onPress={() => handleViewImage(index)}
                    >
                      <Image 
                        source={{ uri: url }}
                        style={styles.postImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* 位置和心情 */}
              <View style={styles.metaInfoContainer}>
                {post.location && (
                  <Chip 
                    icon="map-marker"
                    style={styles.metaChip}
                  >
                    {post.location}
                  </Chip>
                )}
                {post.mood && (
                  <Chip 
                    icon="emoticon-outline"
                    style={styles.metaChip}
                  >
                    {post.mood}
                  </Chip>
                )}
              </View>

              {/* 互动区 */}
              <View style={styles.interactionContainer}>
                <TouchableOpacity 
                  style={styles.interactionItem}
                  onPress={handleLike}
                >
                  <IconButton 
                    icon={liked ? "heart" : "heart-outline"} 
                    size={24} 
                    iconColor={liked ? theme.colors.error : undefined}
                  />
                  <Text>{post.likeCount}</Text>
                </TouchableOpacity>
                
                <View style={styles.interactionItem}>
                  <IconButton icon="comment-outline" size={24} />
                  <Text>{post.commentCount}</Text>
                </View>
                
                <View style={styles.interactionItem}>
                  <IconButton icon="eye-outline" size={24} />
                  <Text>{post.viewCount}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.interactionItem}
                  onPress={handleCollect}
                >
                  <IconButton 
                    icon={collected ? "bookmark" : "bookmark-outline"} 
                    size={24}
                    iconColor={collected ? theme.colors.primary : undefined}
                  />
                  <Text>收藏</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
          
          {/* 评论区 */}
          <View style={styles.commentsSection}>
            <View style={styles.commentsSectionHeader}>
              <Text style={[styles.commentsSectionTitle, { color: theme.colors.onSurface }]}>
                评论 ({post.commentCount})
              </Text>
            </View>
            
            <Divider />
            
            {/* 评论列表 */}
            {commentLoading ? (
              <View style={styles.commentLoading}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={{ marginTop: 8 }}>加载评论中...</Text>
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.noComments}>
                <Text style={{ color: theme.colors.outline }}>
                  暂无评论，快来发表第一条评论吧
                </Text>
              </View>
            ) : (
              comments.map((comment) => renderCommentItem({ item: comment }))
            )}
          </View>
        </ScrollView>
        
        {/* 发表评论区 */}
        <View style={[styles.commentInput, { backgroundColor: theme.colors.surface }]}>
          <TextInput
            mode="outlined"
            placeholder="发表评论..."
            value={commentText}
            onChangeText={setCommentText}
            style={styles.commentTextField}
            right={
              <TextInput.Icon 
                icon="send" 
                onPress={handleSubmitComment}
                disabled={!commentText.trim() || commentSubmitting}
                color={commentText.trim() ? theme.colors.primary : theme.colors.outline}
              />
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  postCard: {
    margin: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    lineHeight: 24,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  imageWrapper: {
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  postImage: {
    width: 160,
    height: 160,
    borderRadius: 8,
  },
  metaInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  metaChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  interactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  interactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentsSection: {
    margin: 12,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  commentsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentLoading: {
    padding: 20,
    alignItems: 'center',
  },
  noComments: {
    padding: 20,
    alignItems: 'center',
  },
  commentItem: {
    marginVertical: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentUserText: {
    marginLeft: 8,
  },
  commentUsername: {
    fontWeight: 'bold',
  },
  commentTime: {
    fontSize: 11,
    opacity: 0.6,
  },
  commentContent: {
    fontSize: 15,
    lineHeight: 22,
    marginLeft: 40,
  },
  commentInput: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  commentTextField: {
    backgroundColor: 'white',
  },
}); 