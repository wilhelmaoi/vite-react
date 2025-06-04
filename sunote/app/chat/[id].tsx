import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, FlatList, TextInput, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Surface, Text, Avatar, IconButton, Appbar, Menu, Divider } from 'react-native-paper';
import { useTheme } from '../../src/theme/ThemeContext';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../src/context/store';

// 消息类型
type MessageType = 'text' | 'image' | 'voice' | 'file' | 'location' | 'system';

// 消息接口
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  type: MessageType;
  mediaUrl?: string;
  isMine: boolean;
}

export default function ChatDetail() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { username } = useAuthStore();
  const [inputMessage, setInputMessage] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // 模拟聊天数据
  const [chatInfo, setChatInfo] = useState({
    id: id as string,
    name: '哈基米',
    avatar: 'https://sunote.s3.cn-south-1.jdcloud-oss.com/avatar/-405478432.jpg',
    isGroup: false,
    isOnline: true,
    members: [] as Array<{id: string; name: string; avatar: string}>
  });

  // 模拟消息列表
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'user1',
      senderName: '哈基米',
      senderAvatar: 'https://sunote.s3.cn-south-1.jdcloud-oss.com/avatar/-405478432.jpg',
      content: '你好，最近在读什么书？',
      timestamp: new Date(Date.now() - 60 * 60000),
      status: 'read',
      type: 'text',
      isMine: false,
    },
    {
      id: '2',
      senderId: 'currentUser',
      senderName: username || '我',
      content: '我在读《人类简史》，你呢？',
      timestamp: new Date(Date.now() - 59 * 60000),
      status: 'read',
      type: 'text',
      isMine: true,
    },
    {
      id: '3',
      senderId: 'user1',
      senderName: '哈基米',
      senderAvatar: 'https://sunote.s3.cn-south-1.jdcloud-oss.com/avatar/-405478432.jpg',
      content: '我最近在读《未来简史》，是同一个作者的',
      timestamp: new Date(Date.now() - 58 * 60000),
      status: 'read',
      type: 'text',
      isMine: false,
    },
    {
      id: '4',
      senderId: 'currentUser',
      senderName: username || '我',
      content: '太巧了，我打算读完这本就开始读《未来简史》',
      timestamp: new Date(Date.now() - 55 * 60000),
      status: 'read',
      type: 'text',
      isMine: true,
    },
    {
      id: '5',
      senderId: 'user1',
      senderName: '哈基米',
      senderAvatar: 'https://sunote.s3.cn-south-1.jdcloud-oss.com/avatar/-405478432.jpg',
      content: '看完我们可以一起讨论一下心得',
      timestamp: new Date(Date.now() - 54 * 60000),
      status: 'read',
      type: 'text',
      isMine: false,
    },
    {
      id: '6',
      senderId: 'currentUser',
      senderName: username || '我',
      content: '好啊，很期待！',
      timestamp: new Date(Date.now() - 53 * 60000),
      status: 'read',
      type: 'text',
      isMine: true,
    },
    {
      id: '7',
      senderId: 'currentUser',
      senderName: username || '我',
      content: '对了，我拍了一下我现在在读的部分',
      timestamp: new Date(Date.now() - 52 * 60000),
      status: 'read',
      type: 'text',
      isMine: true,
    },
    {
      id: '8',
      senderId: 'currentUser',
      senderName: username || '我',
      type: 'image',
      mediaUrl: 'https://sunote.s3.cn-south-1.jdcloud-oss.com/assets/14fbe16c07ab3bdc05719a075dfe49ec.jpg',
      content: '[图片]',
      timestamp: new Date(Date.now() - 51 * 60000),
      status: 'read',
      isMine: true,
    },
    {
      id: '9',
      senderId: 'user1',
      senderName: '哈基米',
      senderAvatar: 'https://sunote.s3.cn-south-1.jdcloud-oss.com/avatar/-405478432.jpg',
      content: '不错不错，这一章讲的是人类认知革命，很精彩的部分',
      timestamp: new Date(Date.now() - 50 * 60000),
      status: 'read',
      type: 'text',
      isMine: false,
    },
    {
      id: '10',
      senderId: 'system',
      senderName: '系统',
      content: '你们已经是好友关系，开始聊天吧',
      timestamp: new Date(Date.now() - 90 * 60000),
      status: 'read',
      type: 'system',
      isMine: false,
    },
  ]);

  // 加载聊天信息
  useEffect(() => {
    // 实际项目中这里应该从API获取聊天信息
    if (id === '3') {
      setChatInfo({
        id: id as string,
        name: '读书分享群',
        avatar: 'https://img.icons8.com/color/96/000000/group.png',
        isGroup: true,
        isOnline: true,
        members: [
          { id: 'user1', name: '哈基米', avatar: 'https://sunote.s3.cn-south-1.jdcloud-oss.com/avatar/-405478432.jpg' },
          { id: 'user3', name: '张伟', avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
          { id: 'user4', name: '刘洋', avatar: 'https://randomuser.me/api/portraits/men/37.jpg' },
          { id: 'user5', name: '赵燕', avatar: 'https://randomuser.me/api/portraits/women/11.jpg' },
        ] as Array<{id: string; name: string; avatar: string}>
      });
    }
  }, [id]);

  // 自动滚动到底部
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 200);
  }, []);

  // 发送消息
  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'currentUser',
      senderName: username || '我',
      content: inputMessage,
      timestamp: new Date(),
      status: 'sending',
      type: 'text',
      isMine: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    
    // 模拟消息发送状态变化
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
      
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
          )
        );
        
        setTimeout(() => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
            )
          );
        }, 1000);
      }, 1000);
    }, 1000);

    // 模拟回复
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const replyMessage: Message = {
          id: (Date.now() + 1).toString(),
          senderId: 'user1',
          senderName: '哈基米',
          senderAvatar: 'https://sunote.s3.cn-south-1.jdcloud-oss.com/avatar/-405478432.jpg',
          content: getRandomReply(),
          timestamp: new Date(),
          status: 'delivered',
          type: 'text',
          isMine: false,
        };
        
        setMessages(prev => [...prev, replyMessage]);
      }, 3000);
    }

    // 自动滚动到底部
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // 随机回复内容
  const getRandomReply = () => {
    const replies = [
      '好的，明白了',
      '嗯，我知道了',
      '有道理！',
      '我同意你的观点',
      '这个想法很棒',
      '我们之后再讨论这个问题',
      '哈哈，是的',
      '我正好也在思考这个问题',
      '学到了新知识',
      '谢谢分享'
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  // 格式化消息时间
  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const oneDay = 86400000; // 毫秒
    
    if (diff < oneDay && now.getDate() === date.getDate()) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diff < oneDay * 7) {
      const days = ['日', '一', '二', '三', '四', '五', '六'];
      return `周${days[date.getDay()]} ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  // 获取消息状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return 'clock-outline';
      case 'sent':
        return 'check';
      case 'delivered':
        return 'check-all';
      case 'read':
        return 'check-all';
      case 'failed':
        return 'alert-circle-outline';
      default:
        return '';
    }
  };

  // 渲染日期分隔线
  const renderDateSeparator = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const oneDay = 86400000; // 毫秒
    
    let dateLabel = '';
    if (diff < oneDay && now.getDate() === date.getDate()) {
      dateLabel = '今天';
    } else if (diff < oneDay * 2 && now.getDate() - 1 === date.getDate()) {
      dateLabel = '昨天';
    } else if (diff < oneDay * 7) {
      const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      dateLabel = days[date.getDay()];
    } else {
      dateLabel = date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    
    return (
      <View style={styles.dateSeparator}>
        <Text style={styles.dateSeparatorText}>{dateLabel}</Text>
      </View>
    );
  };

  // 渲染消息气泡
  const renderMessageItem = ({ item, index }: { item: Message, index: number }) => {
    // 判断是否需要显示日期分隔线
    const showDateSeparator = index === 0 || 
      new Date(item.timestamp).getDate() !== new Date(messages[index - 1].timestamp).getDate();
    
    // 判断是否需要显示头像（连续消息只显示最后一条的头像）
    const showAvatar = item.isMine ? 
      (index === messages.length - 1 || messages[index + 1].senderId !== item.senderId) :
      (index === messages.length - 1 || messages[index + 1].senderId !== item.senderId);
    
    if (item.type === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          {showDateSeparator && renderDateSeparator(item.timestamp)}
          <View style={styles.systemMessage}>
            <Text style={styles.systemMessageText}>{item.content}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={{ marginBottom: 16 }}>
        {showDateSeparator && renderDateSeparator(item.timestamp)}
        
        <View style={[
          styles.messageRow,
          item.isMine ? styles.myMessageRow : styles.theirMessageRow
        ]}>
          {!item.isMine && (
            <View style={styles.avatarContainer}>
              {showAvatar ? (
                <Avatar.Image 
                  size={36} 
                  source={{ uri: item.senderAvatar }}
                  style={{ marginRight: 8 }}
                />
              ) : (
                <View style={{ width: 36, marginRight: 8 }} />
              )}
            </View>
          )}
          
          <View style={[
            styles.messageBubble,
            item.isMine ? 
              [styles.myMessageBubble, { backgroundColor: theme.colors.primary }] : 
              [styles.theirMessageBubble, { backgroundColor: theme.colors.surfaceVariant }]
          ]}>
            {chatInfo.isGroup && !item.isMine && showAvatar && (
              <Text style={styles.senderName}>{item.senderName}</Text>
            )}
            
            {item.type === 'image' ? (
              <TouchableOpacity onPress={() => console.log('查看大图')}>
                <Image 
                  source={{ uri: item.mediaUrl }} 
                  style={styles.messageImage} 
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              <Text style={[
                styles.messageText,
                item.isMine ? { color: theme.colors.onPrimary } : { color: theme.colors.onSurface }
              ]}>
                {item.content}
              </Text>
            )}
            
            <View style={styles.messageFooter}>
              <Text style={[
                styles.messageTime,
                item.isMine ? { color: 'rgba(255, 255, 255, 0.7)' } : { color: 'rgba(0, 0, 0, 0.5)' }
              ]}>
                {formatMessageTime(item.timestamp)}
              </Text>
              
              {item.isMine && (
                <IconButton 
                  icon={getStatusIcon(item.status)} 
                  size={14} 
                  style={{ margin: 0, padding: 0, marginLeft: 4 }}
                  iconColor={item.status === 'read' ? '#4CAF50' : 'rgba(255, 255, 255, 0.7)'}
                />
              )}
            </View>
          </View>

          {item.isMine && (
            <View style={styles.avatarContainer}>
              {showAvatar ? (
                <Avatar.Image 
                  size={36} 
                  source={{ uri: 'https://sunote.s3.cn-south-1.jdcloud-oss.com/userData/aoi/avatar_1748072313672.jpg' }}
                  style={{ marginLeft: 8 }}
                />
              ) : (
                <View style={{ width: 36, marginLeft: 8 }} />
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  // 渲染底部输入框
  const renderInputBar = () => {
    return (
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
        <IconButton 
          icon={showEmoji ? 'keyboard' : 'emoticon-outline'} 
          size={24} 
          onPress={() => setShowEmoji(!showEmoji)} 
        />
        
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="输入消息..."
          placeholderTextColor="#999"
          multiline
        />
        
        {inputMessage.trim() ? (
          <IconButton 
            icon="send" 
            size={24} 
            onPress={sendMessage}
            iconColor={theme.colors.primary}
          />
        ) : (
          <IconButton 
            icon={showMore ? 'close' : 'plus-circle-outline'} 
            size={24} 
            onPress={() => setShowMore(!showMore)}
          />
        )}
      </View>
    );
  };

  // 扩展功能面板
  const renderMorePanel = () => {
    if (!showMore) return null;
    
    const features = [
      { icon: 'image', label: '照片', action: () => console.log('选择图片') },
      { icon: 'camera', label: '拍摄', action: () => console.log('打开相机') },
      { icon: 'microphone', label: '语音', action: () => console.log('录制语音') },
      { icon: 'file-document-outline', label: '文件', action: () => console.log('发送文件') },
      { icon: 'map-marker', label: '位置', action: () => console.log('发送位置') },
      { icon: 'account-group', label: '群组', action: () => console.log('群组聊天') },
    ];
    
    return (
      <View style={[styles.morePanel, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.featureGrid}>
          {features.map((feature, index) => (
            <TouchableOpacity key={index} style={styles.featureItem} onPress={feature.action}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                <IconButton icon={feature.icon} size={24} iconColor={theme.colors.primary} />
              </View>
              <Text style={{ color: theme.colors.onSurface, fontSize: 12 }}>{feature.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{chatInfo.name}</Text>
              {chatInfo.isOnline && (
                <Text style={{ fontSize: 12, color: '#999' }}>在线</Text>
              )}
            </View>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <IconButton icon="phone" size={20} onPress={() => console.log('语音通话')} />
              <IconButton icon="video" size={20} onPress={() => console.log('视频通话')} />
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <IconButton 
                    icon="dots-vertical" 
                    size={20} 
                    onPress={() => setMenuVisible(true)} 
                  />
                }
              >
                <Menu.Item onPress={() => console.log('查看资料')} title="查看资料" />
                <Menu.Item onPress={() => console.log('清除聊天记录')} title="清除聊天记录" />
                {chatInfo.isGroup && <Menu.Item onPress={() => console.log('群设置')} title="群设置" />}
                <Menu.Item onPress={() => console.log('搜索消息')} title="搜索消息" />
              </Menu>
            </View>
          ),
        }}
      />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
        
        {renderInputBar()}
        {renderMorePanel()}
      </KeyboardAvoidingView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    alignItems: 'center',
  },
  messageList: {
    padding: 16,
    paddingBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-end',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  theirMessageRow: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 16,
    padding: 12,
    paddingVertical: 8,
  },
  myMessageBubble: {
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#999',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  systemMessage: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  systemMessageText: {
    fontSize: 12,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
  },
  morePanel: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
}); 