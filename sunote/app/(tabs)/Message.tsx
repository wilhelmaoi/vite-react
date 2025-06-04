import React, { useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Image } from 'react-native';
import { Surface, Text, Searchbar, Avatar, Divider, Badge, IconButton, ActivityIndicator, Menu } from 'react-native-paper';
import { useTheme } from '../../src/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/context/store';
import { StatusBar } from 'expo-status-bar';

// 定义消息类型
type MessageType = 'text' | 'image' | 'system' | 'notification';

// 聊天消息类型
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: MessageType;
  isMine?: boolean;
}

// 会话类型
interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  lastMessage: ChatMessage;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  isOnline?: boolean;
  isPinned?: boolean;
}

export default function Message() {
  const theme = useTheme();
  const router = useRouter();
  const { username } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // 模拟会话数据
  const conversations: Conversation[] = [
    {
      id: '1',
      participants: [
        { id: 'user1', name: '哈基米', avatar: 'https://sunote.s3.cn-south-1.jdcloud-oss.com/avatar/-405478432.jpg' }
      ],
      lastMessage: {
        id: 'm1',
        senderId: 'user1',
        senderName: '哈基米',
        content: '你好，我看了你分享的那篇读书笔记，写得非常棒！',
        timestamp: new Date(Date.now() - 5 * 60000),
        isRead: false,
        type: 'text'
      },
      unreadCount: 0,
      isGroup: false,
      isOnline: true,
      isPinned: true
    },
    {
      id: '2',
      participants: [
        { id: 'user2', name: '耄耋', avatar: 'https://sunote.s3.cn-south-1.jdcloud-oss.com/avatar/-1809587470.jpg' }
      ],
      lastMessage: {
        id: 'm2',
        senderId: 'user2',
        senderName: '耄耋',
        content: '我们一起参加下周的主题打卡活动吧！',
        timestamp: new Date(Date.now() - 30 * 60000),
        isRead: true,
        type: 'text'
      },
      unreadCount: 0,
      isGroup: false,
      isOnline: false
    },
    {
      id: '3',
      participants: [
        { id: 'user3', name: '张伟', avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
        { id: 'user4', name: '刘洋', avatar: 'https://randomuser.me/api/portraits/men/37.jpg' },
        { id: 'user5', name: '赵燕', avatar: 'https://randomuser.me/api/portraits/women/11.jpg' }
      ],
      lastMessage: {
        id: 'm3',
        senderId: 'user3',
        senderName: '张伟',
        content: '[图片]',
        timestamp: new Date(Date.now() - 2 * 3600000),
        isRead: false,
        type: 'image'
      },
      unreadCount: 12,
      isGroup: true,
      groupName: '读书分享群',
      groupAvatar: 'https://img.icons8.com/color/96/000000/group.png'
    },
    {
      id: '4',
      participants: [],
      lastMessage: {
        id: 'm4',
        senderId: 'system',
        senderName: '系统通知',
        content: '您已成功连续签到7天，获得额外积分奖励！',
        timestamp: new Date(Date.now() - 1 * 86400000),
        isRead: true,
        type: 'system'
      },
      unreadCount: 0,
      isGroup: false,
      groupName: '系统通知'
    },
    {
      id: '5',
      participants: [
        { id: 'user6', name: '最强毒液', avatar: 'https://sunote.s3.cn-south-1.jdcloud-oss.com/avatar/692522576.jpg' }
      ],
      lastMessage: {
        id: 'm5',
        senderId: 'currentUser',
        senderName: username || '我',
        content: '好的，明天见！',
        timestamp: new Date(Date.now() - 5 * 86400000),
        isRead: true,
        type: 'text',
        isMine: true
      },
      unreadCount: 0,
      isGroup: false,
      isOnline: false
    },
    {
      id: '6',
      participants: [
        { id: 'user7', name: '耄耋', avatar: 'https://sunote.s3.cn-south-1.jdcloud-oss.com/avatar/-1809587470.jpg' },
        { id: 'user8', name: '哈基米', avatar: 'https://sunote.s3.cn-south-1.jdcloud-oss.com/avatar/-405478432.jpg' },
        { id: 'user9', name: '最强毒液', avatar: 'https://sunote.s3.cn-south-1.jdcloud-oss.com/avatar/692522576.jpg' }
      ],
      lastMessage: {
        id: 'm6',
        senderId: 'user8',
        senderName: '周梅',
        content: '下周的线下活动地点确定了吗？',
        timestamp: new Date(Date.now() - 7 * 86400000),
        isRead: true,
        type: 'text'
      },
      unreadCount: 0,
      isGroup: true,
      groupName: '健身打卡群',
      groupAvatar: 'https://img.icons8.com/color/96/000000/conference-call.png'
    }
  ];

  // 过滤会话
  const filteredConversations = conversations
    .filter(conv => {
      if (searchQuery === '') return true;
      
      // 搜索逻辑
      const searchLower = searchQuery.toLowerCase();
      
      if (conv.isGroup && conv.groupName) {
        return conv.groupName.toLowerCase().includes(searchLower);
      } else if (!conv.isGroup && conv.participants.length > 0) {
        return conv.participants[0].name.toLowerCase().includes(searchLower);
      } else if (conv.lastMessage.content) {
        return conv.lastMessage.content.toLowerCase().includes(searchLower);
      }
      
      return false;
    })
    .sort((a, b) => {
      // 置顶对话排在前面
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // 然后按时间戳排序
      return b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime();
    });

  // 格式化时间
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const oneDay = 86400000; // 毫秒
    
    if (diff < 60000) {
      return '刚刚';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < oneDay && now.getDate() === date.getDate()) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diff < oneDay * 7) {
      const days = ['日', '一', '二', '三', '四', '五', '六'];
      return `周${days[date.getDay()]}`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  // 渲染会话项
  const renderConversationItem = ({ item }: { item: Conversation }) => {
    // 获取头像和名称
    let name = '';
    let avatar: string | undefined = undefined;
    
    if (item.isGroup) {
      name = item.groupName || '群聊';
      avatar = item.groupAvatar;
    } else if (item.participants.length > 0) {
      name = item.participants[0].name;
      avatar = item.participants[0].avatar;
    } else {
      name = item.groupName || '通知';
    }
    
    // 获取消息预览
    const preview = item.lastMessage.content.length > 20 
      ? `${item.lastMessage.content.substring(0, 20)}...` 
      : item.lastMessage.content;
    
    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          item.isPinned && { backgroundColor: theme.colors.surfaceVariant }
        ]}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <View style={styles.avatarContainer}>
          {avatar ? (
            <Avatar.Image size={50} source={{ uri: avatar }} />
          ) : (
            <Avatar.Icon 
              size={50} 
              icon={item.isGroup ? 'account-group' : 'account'} 
              color={theme.colors.onPrimary}
              style={{ backgroundColor: theme.colors.primary }}
            />
          )}
          {item.isOnline && (
            <View style={[styles.onlineIndicator, { backgroundColor: '#4CAF50' }]} />
          )}
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.conversationName, { color: theme.colors.onSurface }]} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.timeText}>{formatTime(item.lastMessage.timestamp)}</Text>
          </View>
          
          <View style={styles.messagePreviewContainer}>
            {item.lastMessage.isMine && (
              <Text style={styles.messagePrefix}>我: </Text>
            )}
            <Text style={styles.messagePreview} numberOfLines={1}>
              {item.lastMessage.type === 'image' ? '[图片]' : 
               item.lastMessage.type === 'system' ? '[系统通知]' : 
               preview}
            </Text>
            
            {item.unreadCount > 0 && (
              <Badge style={styles.unreadBadge}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Badge>
            )}
            
            {item.isPinned && (
              <IconButton
                icon="pin"
                size={16}
                style={styles.pinIcon}
                iconColor={theme.colors.primary}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>消息</Text>
        
        <View style={styles.headerActions}>
          <IconButton 
            icon="magnify" 
            size={24} 
            onPress={() => {}} 
          />
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton 
                icon="dots-vertical" 
                size={24} 
                onPress={() => setMenuVisible(true)} 
              />
            }
          >
            <Menu.Item onPress={() => {}} title="全部已读" />
            <Menu.Item onPress={() => {}} title="消息设置" />
          </Menu>
        </View>
      </View>
      
      <Searchbar
        placeholder="搜索消息"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
        inputStyle={{ color: theme.colors.onSurface }}
        iconColor={theme.colors.onSurfaceVariant}
      />
      
      <View style={styles.filterChips}>
        <TouchableOpacity 
          style={[
            styles.filterChip, 
            activeFilters.includes('unread') && { backgroundColor: theme.colors.primaryContainer }
          ]}
          onPress={() => {}}
        >
          <Text style={{ color: activeFilters.includes('unread') ? theme.colors.primary : theme.colors.onSurfaceVariant }}>
            未读
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterChip, 
            activeFilters.includes('groups') && { backgroundColor: theme.colors.primaryContainer }
          ]}
          onPress={() => {}}
        >
          <Text style={{ color: activeFilters.includes('groups') ? theme.colors.primary : theme.colors.onSurfaceVariant }}>
            群聊
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterChip, 
            activeFilters.includes('pinned') && { backgroundColor: theme.colors.primaryContainer }
          ]}
          onPress={() => {}}
        >
          <Text style={{ color: activeFilters.includes('pinned') ? theme.colors.primary : theme.colors.onSurfaceVariant }}>
            置顶
          </Text>
        </TouchableOpacity>
      </View>

      {filteredConversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Image 
            source={{ uri: 'https://img.icons8.com/bubbles/200/null/chat.png' }}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyText}>暂无消息</Text>
          <Text style={styles.emptySubText}>
            {searchQuery ? '没有找到匹配的消息' : '开始和好友聊天吧'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.conversationList}
          ItemSeparatorComponent={() => <Divider style={{ marginLeft: 70 }} />}
        />
      )}
      
      <TouchableOpacity 
        style={[styles.newChatButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/contacts')}
      >
        <IconButton icon="message-plus" size={24} iconColor={theme.colors.onPrimary} />
      </TouchableOpacity>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 10,
    elevation: 0,
    borderRadius: 10,
  },
  filterChips: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  conversationList: {
    paddingBottom: 80,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  onlineIndicator: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  messagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messagePrefix: {
    fontSize: 14,
    color: '#666',
  },
  messagePreview: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  unreadBadge: {
    marginLeft: 8,
  },
  pinIcon: {
    margin: 0,
    padding: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  newChatButton: {
      position: 'absolute',
      right: 40,
      bottom: 40,
      width: 70,
      height: 70,
      borderRadius: 35,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
  },
});
