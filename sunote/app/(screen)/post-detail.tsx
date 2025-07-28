import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard,
  Dimensions,
  Alert,
  TextInput as RNTextInput
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
import SimpleImageViewer from '../../src/components/SimpleImageViewer';
import VideoThumbnail from '../../src/components/VideoThumbnail';

// 判断URL是否是视频文件
const isVideoFile = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.mkv', '.webm', '.m4v', '.3gp'];
  const lowerCaseUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerCaseUrl.endsWith(ext));
};

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
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});
  const [isFollowed, setIsFollowed] = useState(false);
  
  // 回复相关状态
  const [replyingTo, setReplyingTo] = useState<CommentItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [commentReplies, setCommentReplies] = useState<Record<string, CommentItem[]>>({});
  
  const scrollViewRef = useRef<ScrollView>(null);
  const commentInputRef = useRef<RNTextInput>(null);
  

  
  // 获取用户头像的函数
  const fetchUserAvatar = async (username: string) => {
    try {
      const url = `/user/avatar/${username}`;
      const response = await request({
        method: 'GET',
        url: url,
      });
      
      if (response.data.code === 200 && response.data.data?.avatarUrl) {
        const avatarUrl = response.data.data.avatarUrl;
        if (avatarUrl.startsWith('http')) {
          setPost(currentPost => currentPost ? {
            ...currentPost,
            avatar: avatarUrl
          } : null);
        }
      }
    } catch (error) {
      console.error('获取用户头像失败:', error);
    }
  };
  
  // 获取评论用户头像
  const fetchCommentUserAvatars = async (usernames: string[]) => {
    try {
      // 过滤掉重复的用户名
      const uniqueUsernames = [...new Set(usernames)];
      
      console.log(`开始获取${uniqueUsernames.length}个用户的头像`);
      
      // 对于每个用户名，获取其头像 URL
      const avatarPromises = uniqueUsernames.map(async (name) => {
        // 如果是当前用户并且已有本地头像，直接使用
        if (name === username && avatarUri) {
          console.log(`使用当前用户本地头像: ${name}`);
          return { username: name, avatar: avatarUri };
        }
        
        try {
          const response = await request({
            method: 'GET',
            url: `/user/avatar/${name}`,
          });
          
          if (response.data.code === 200 && response.data.data) {
            const avatarData = response.data.data;
            const avatarUrl = avatarData.avatarUrl || '';
            console.log(`获取到用户 ${name} 的头像URL: ${avatarUrl ? avatarUrl.substring(0, 30) + '...' : '无'}`);
            
            // 确保URL格式正确
            if (avatarUrl && !avatarUrl.startsWith('http')) {
              console.error(`用户 ${name} 的头像URL格式不正确:`, avatarUrl);
              return { username: name, avatar: '' };
            }
            
            return { 
              username: name, 
              avatar: avatarUrl
            };
          }
          console.log(`未能获取到用户 ${name} 的头像，响应码: ${response.data.code}`);
          return { username: name, avatar: '' };
        } catch (error) {
          console.error(`获取用户 ${name} 头像时出错:`, error);
          return { username: name, avatar: '' };
        }
      });
      
      const avatarResults = await Promise.all(avatarPromises);
      
      // 构建头像映射对象
      const newAvatars: Record<string, string> = {};
      avatarResults.forEach(item => {
        if (item.avatar) {
          newAvatars[item.username] = item.avatar;
        }
      });
      
      console.log(`成功获取了${Object.keys(newAvatars).length}个用户的头像`);
      
      // 更新评论列表中的头像
      setComments(prevComments => 
        prevComments.map(comment => ({
          ...comment,
          avatar: newAvatars[comment.username] || comment.avatar || ''
        }))
      );
      
      console.log('评论头像已更新');
    } catch (error) {
      console.error('获取评论用户头像失败:', error);
    }
  };
  
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
        
        console.log(`获取帖子详情响应: id=${id}, code=${response.data?.code}`);
        
        if (response.data.code === 200) {
          const postData = response.data.data;
          console.log(`帖子数据: username=${postData.username}, 是否有avatar=${Boolean(postData.avatar)}`);
          
          // 检查帖子数据中是否已包含头像信息
          if (postData.avatar) {
            console.log(`帖子数据已包含头像: ${postData.avatar.substring(0, 30)}...`);
          } else if (postData.username === username && avatarUri) {
            // 如果是当前用户的帖子，并且有本地头像，直接使用
            console.log('当前用户的帖子，使用本地头像');
            postData.avatar = avatarUri;
          }
          
          // 先设置帖子数据
          setPost(postData);
          
          // 如果没有头像，则获取帖子作者头像
          if (postData.username === username && avatarUri) {
            // 如果是当前用户，直接使用本地头像
            setPost({
              ...postData,
              avatar: avatarUri
            });
          } else  {
            // 异步获取用户头像
            setTimeout(() => {
              fetchUserAvatar(postData.username);
            }, 100);
          }
          
          // 检查用户交互状态
          setTimeout(() => {
            // 检查用户是否已经点赞/收藏
            checkUserInteraction();
            
            // 检查关注状态
            if (username && postData.username !== username) {
              checkFollowStatus(postData.username);
            }
          }, 100);
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
          const commentData = response.data.data || [];
          setComments(commentData);
          
          // 获取评论用户头像
          if (commentData.length > 0) {
            setTimeout(() => {
              fetchCommentUserAvatars(commentData.map(comment => comment.username));
            }, 100);
          }
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
        method: 'POST',
        url: `/post/${id}/like/check`,
        data: { username }
      });
      
      console.log(`检查点赞状态响应: postId=${id}, code=${likeResponse.data?.code}, data=`, likeResponse.data?.data);
      
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
  
  // 添加检查关注状态的函数
  const checkFollowStatus = async (postUsername: string) => {
    if (!username || !postUsername || username === postUsername) return;
    
    try {
      const response = await request({
        method: 'GET',
        url: `/user/follow/check?followerUsername=${username}&followingUsername=${postUsername}`,
      });
      
      if (response.data?.code === 200) {
        setIsFollowed(response.data.data);
      }
    } catch (error) {
      console.error('检查关注状态失败:', error);
    }
  };
  
  // 添加关注用户功能
  const handleFollow = async () => {
    if (!username || !post || username === post.username) return;
    
    try {
      // 先更新UI状态，提高响应速度
      setIsFollowed(!isFollowed);
      
      // 发送请求到服务器
      const response = await request({
        method: 'POST',
        url: '/user/follow',
        data: { 
          followerUsername: username, 
          followingUsername: post.username 
        }
      });
      
      if (response.data?.code !== 200) {
        console.error('关注请求失败:', response.data?.msg);
        // 如果请求失败，回滚状态
        setIsFollowed(isFollowed);
        Alert.alert('操作失败', response.data?.msg || '关注操作失败，请稍后重试');
      }
    } catch (error) {
      console.error('关注操作失败:', error);
      // 发生错误时，也需要回滚状态
      setIsFollowed(isFollowed);
      Alert.alert('操作失败', '关注操作失败，请稍后重试');
    }
  };
  
  // 处理点赞
  const handleLike = async () => {
    if (!username || !id) return;
    
    try {
      const currentLiked = liked;
      console.log(`点赞操作: postId=${id}, 当前状态=${currentLiked ? '已点赞' : '未点赞'}`);
      
      // 先更新UI状态，提高响应速度
      setLiked(!currentLiked);
      
      // 更新本地点赞数
      if (post) {
        setPost({
          ...post,
          likeCount: currentLiked ? post.likeCount - 1 : post.likeCount + 1
        });
      }
      
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
        setLiked(currentLiked);
        if (post) {
          setPost({
            ...post,
            likeCount: currentLiked ? post.likeCount + 1 : post.likeCount - 1
          });
        }
      } else {
        // 服务器返回成功，可以更新为服务器返回的实际状态
        const serverLiked = response.data?.data?.liked;
        if (serverLiked !== undefined) {
          setLiked(serverLiked);
        }
      }
    } catch (error) {
      console.error('点赞操作失败:', error);
      // 发生错误时，也需要回滚状态
      const currentLiked = liked;
      setLiked(currentLiked);
      if (post) {
        setPost({
          ...post,
          likeCount: currentLiked ? post.likeCount + 1 : post.likeCount - 1
        });
      }
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
      console.log(`提交评论: postId=${id}, username=${username}, content=${commentText.substring(0, 20)}...`);
      
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
        console.log('评论提交成功，获取返回的评论数据');
        // 添加新评论到列表
        const newComment = response.data.data;
        
        // 添加头像信息
        let commentAvatar = '';
        
        // 如果是当前用户，并且有头像，则添加头像信息
        if (avatarUri) {
          commentAvatar = avatarUri;
          console.log(`添加当前用户头像到评论: ${avatarUri.substring(0, 30)}...`);
        } else if (userAvatars[username]) {
          // 从缓存中获取
          commentAvatar = userAvatars[username];
          console.log(`从缓存获取用户头像: ${commentAvatar.substring(0, 30)}...`);
        }
        
        // 添加头像到评论对象
        const commentWithAvatar = {
          ...newComment,
          avatar: commentAvatar
        };
        
        // 更新评论列表
        setComments([...comments, commentWithAvatar]);
        
        // 同时更新头像缓存
        if (commentAvatar) {
          setUserAvatars(prev => ({ ...prev, [username]: commentAvatar }));
        }
        
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
  
  // 开始回复评论
  const handleStartReply = (comment: CommentItem) => {
    setReplyingTo(comment);
    setReplyText('');
    // 滚动到底部输入框并聚焦
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
      commentInputRef.current?.focus();
    }, 100);
  };
  
  // 取消回复
  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
    // 清空回复文本
    setReplyText('');
  };
  
  // 提交回复
  const handleSubmitReply = async () => {
    if (!replyText.trim() || !username || !id || !replyingTo) return;
    
    try {
      setReplySubmitting(true);
      console.log(`提交回复: postId=${id}, parentId=${replyingTo.id}, username=${username}`);
      
      const response = await request({
        method: 'POST',
        url: `/post/${id}/comment/reply`,
        data: {
          username,
          nickname: user?.nickname || username,
          content: `回复@${replyingTo.nickname}: ${replyText}`,
          parentId: replyingTo.id,
          replyToUsername: replyingTo.username,
          replyToNickname: replyingTo.nickname
        }
      });
      
      if (response.data.code === 200) {
        console.log('回复提交成功');
        const newReply = response.data.data;
        
        // 添加头像信息
        let replyAvatar = '';
        if (avatarUri) {
          replyAvatar = avatarUri;
        } else if (userAvatars[username]) {
          replyAvatar = userAvatars[username];
        }
        
        const replyWithAvatar = {
          ...newReply,
          avatar: replyAvatar
        };
        
        // 更新回复列表
        const currentReplies = commentReplies[replyingTo.id] || [];
        setCommentReplies(prev => ({
          ...prev,
          [replyingTo.id]: [...currentReplies, replyWithAvatar]
        }));
        
        // 更新头像缓存
        if (replyAvatar) {
          setUserAvatars(prev => ({ ...prev, [username]: replyAvatar }));
        }
        
        // 更新评论的回复数
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === replyingTo.id 
              ? { ...comment, replyCount: (comment.replyCount || 0) + 1 }
              : comment
          )
        );
        
        setReplyText('');
        setReplyingTo(null);
        
        // 自动展开回复列表
        setExpandedReplies(prev => new Set([...prev, replyingTo.id]));
        
        // 滚动到回复列表
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 300);
      } else {
        console.error('发表回复失败:', response.data.msg);
      }
    } catch (error) {
      console.error('发表回复出错:', error);
    } finally {
      setReplySubmitting(false);
    }
  };
  
  // 加载评论的回复
  const loadCommentReplies = async (commentId: string) => {
    try {
      const response = await request({
        method: 'GET',
        url: `/post/${id}/comment/${commentId}/replies`,
      });
      
      if (response.data.code === 200) {
        const replies = response.data.data || [];
        
        // 获取回复用户头像
        if (replies.length > 0) {
          const usernames = replies.map(reply => reply.username);
          setTimeout(() => {
            fetchCommentUserAvatars(usernames);
          }, 100);
        }
        
        setCommentReplies(prev => ({
          ...prev,
          [commentId]: replies
        }));
      }
    } catch (error) {
      console.error('加载评论回复失败:', error);
    }
  };
  
  // 切换回复展开状态
  const toggleReplies = (commentId: string) => {
    if (expandedReplies.has(commentId)) {
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } else {
      setExpandedReplies(prev => new Set([...prev, commentId]));
      // 如果还没有加载过回复，则加载
      if (!commentReplies[commentId]) {
        loadCommentReplies(commentId);
      }
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
    // 确认当前图片不是视频
    if (post?.imageUrls && !isVideoFile(post.imageUrls[index])) {
      setCurrentImageIndex(index);
      setImageViewerVisible(true);
    }
  };
  
  // 关闭图片查看器
  const handleCloseImageViewer = () => {
    setImageViewerVisible(false);
  };
  
  // 过滤出不是视频的图片URL，用于图片查看器
  const imageOnlyUrls = post?.imageUrls?.filter(url => !isVideoFile(url)) || [];
  
  // 渲染评论项
  const renderCommentItem = ({ item }: { item: CommentItem }) => {
    const isCurrentUser = item.username === username;
    const isExpanded = expandedReplies.has(item.id);
    const replies = commentReplies[item.id] || [];
    
    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <View style={styles.commentUserInfo}>
            {item.avatar ? (
              <Avatar.Image 
                size={32}
                source={{ uri: item.avatar }}
                style={{ backgroundColor: theme.colors.surfaceVariant }}
                onError={(e) => {
                  console.error('评论头像加载失败:', item.avatar, e.nativeEvent.error);
                }}
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
        
        {/* 评论操作按钮 */}
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleStartReply(item)}
          >
            <Text style={[styles.actionText, { color: theme.colors.primary }]}>
              回复
            </Text>
          </TouchableOpacity>
          
          {/* 显示回复数量 */}
          {(item.replyCount || 0) > 0 && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => toggleReplies(item.id)}
            >
              <Text style={[styles.actionText, { color: theme.colors.outline }]}>
                {isExpanded ? '收起' : `查看${item.replyCount}条回复`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* 回复列表 */}
        {isExpanded && replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {replies.map((reply, index) => (
              <View key={reply.id || index} style={styles.replyItem}>
                <View style={styles.replyHeader}>
                  <View style={styles.replyUserInfo}>
                    {reply.avatar ? (
                      <Avatar.Image 
                        size={24}
                        source={{ uri: reply.avatar }}
                        style={{ backgroundColor: theme.colors.surfaceVariant }}
                      />
                    ) : (
                      <Avatar.Text 
                        size={24} 
                        label={reply.nickname.substring(0, 2).toUpperCase()}
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                    )}
                    <View style={styles.replyUserText}>
                      <Text style={[styles.replyUsername, { color: theme.colors.primary }]}>
                        {reply.nickname}
                      </Text>
                      {reply.replyToNickname && (
                        <Text style={[styles.replyToText, { color: theme.colors.outline }]}>
                          回复 {reply.replyToNickname}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.replyTime}>{formatDate(reply.createdAt)}</Text>
                </View>
                <Text style={styles.replyContent}>{reply.content}</Text>
              </View>
            ))}
          </View>
        )}
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
        behavior={Platform.OS === "ios" ? "padding" : 'height'}
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
                {post.avatar ? (
                  <Avatar.Image 
                    size={45}
                    source={{ uri: post.avatar }}
                    style={{ backgroundColor: theme.colors.surfaceVariant }}
                    onError={(e) => {
                      console.error('头像加载失败:', post.avatar, e.nativeEvent.error);
                    }}
                  />
                ) : (
                  <Avatar.Text 
                    size={45} 
                    label={post.username.substring(0, 2).toUpperCase()} 
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                )}
                <View style={styles.userTextContainer}>
                  <Text style={[styles.username, { color: theme.colors.primary }]}>
                    {post.nickname}
                  </Text>
                  <Text style={styles.postTime}>
                    {formatDate(post.createdAt)}
                  </Text>
                </View>
                
                {/* 关注按钮 - 仅当不是当前用户时显示 */}
                {username && post.username !== username && (
                  <TouchableOpacity 
                    onPress={handleFollow}
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
                )}
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

              {/* 图片和视频区 */}
              {post.imageUrls && post.imageUrls.length > 0 && (
                <View style={styles.imagesContainer}>
                  {post.imageUrls.map((url, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.imageWrapper}
                      onPress={() => handleViewImage(index)}
                    >
                      {isVideoFile(url) ? (
                        <VideoThumbnail 
                          videoUrl={url} 
                          width={160} 
                          height={160}
                        />
                      ) : (
                        <Image 
                          source={{ uri: url }}
                          style={styles.postImage}
                          resizeMode="cover"
                        />
                      )}
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
          <Card style={[styles.commentsSection, { backgroundColor: theme.colors.onSecondary }]}>
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
              comments.map((comment, index) => (
                <React.Fragment key={comment.id || index}>
                  {renderCommentItem({ item: comment })}
                  <Divider/>
                </React.Fragment>
              ))
            )}
          </Card>
        </ScrollView>
        
        {/* 发表评论区 */}
        <View style={[
          styles.commentInput, 
          { 
            backgroundColor: theme.colors.surface,
          }
        ]}>
          <TextInput
            ref={commentInputRef}
            mode="outlined"
            placeholder={replyingTo ? `回复 ${replyingTo.nickname}` : "发表评论..."}
            value={replyingTo ? replyText : commentText}
            onChangeText={replyingTo ? setReplyText : setCommentText}
            style={[
              styles.commentTextField, 
              { 
                backgroundColor: theme.colors.secondaryContainer,
                borderColor: replyingTo ? theme.colors.primary : undefined,
                borderWidth: replyingTo ? 2 : undefined
              }
            ]}
            outlineStyle={{ borderRadius: 25 }}
            right={
              <TextInput.Icon 
                icon="send" 
                onPress={replyingTo ? handleSubmitReply : handleSubmitComment}
                disabled={
                  replyingTo
                    ? !replyText.trim() || replySubmitting
                    : !commentText.trim() || commentSubmitting
                }
                color={
                  replyingTo
                    ? replyText.trim() ? theme.colors.primary : theme.colors.outline
                    : commentText.trim() ? theme.colors.primary : theme.colors.outline
                }
              />
            }
          />
          {replyingTo && (
            <View style={styles.replyStatusContainer}>
              <Text style={[styles.replyStatusText, { color: theme.colors.primary }]}>
                正在回复 @{replyingTo.nickname}
              </Text>
              <TouchableOpacity 
                style={styles.cancelReplyButton}
                onPress={handleCancelReply}
              >
                <Text style={[styles.cancelReplyText, { color: theme.colors.outline }]}>
                  取消
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
      
      {/* 图片查看器 - 只显示图片，不显示视频 */}
      {imageOnlyUrls.length > 0 && (
        <SimpleImageViewer
          visible={imageViewerVisible}
          imageUrls={imageOnlyUrls}
          initialIndex={currentImageIndex}
          onClose={handleCloseImageViewer}
        />
      )}
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
    // borderBottomWidth: 1,
    // borderBottomColor: '#eee',
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
  commentActions: {
    flexDirection: 'row',
    marginTop: 8,
    marginLeft: 40,
  },
  actionButton: {
    marginRight: 16,
  },
  actionText: {
    fontSize: 13,
  },
  replyInputContainer: {
    marginTop: 8,
    marginLeft: 40,
    marginRight: 8,
  },
  replyTextField: {
    borderRadius: 20,
    fontSize: 14,
  },
  cancelButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelText: {
    fontSize: 12,
  },
  replyStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  replyStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cancelReplyButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelReplyText: {
    fontSize: 12,
  },
  repliesContainer: {
    marginTop: 8,
    marginLeft: 40,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#eee',
  },
  replyItem: {
    marginVertical: 6,
    paddingVertical: 4,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  replyUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyUserText: {
    marginLeft: 6,
  },
  replyUsername: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  replyToText: {
    fontSize: 11,
    marginTop: 1,
  },
  replyTime: {
    fontSize: 10,
    opacity: 0.6,
  },
  replyContent: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 30,
  },
  commentInput: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
   
    // paddingHorizontal: 12,
  },
  commentTextField: {
    borderRadius: 25,
    fontSize: 15,
  },
  followButton: {
    borderRadius: 15,
    height: 30,
    paddingHorizontal: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'absolute',
    right: 0,
    top: 10,
  },
}); 