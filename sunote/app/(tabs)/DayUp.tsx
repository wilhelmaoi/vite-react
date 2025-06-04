import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Surface, Text, Card, Button, Avatar, Badge, Divider, ProgressBar, Chip, IconButton } from 'react-native-paper';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuthStore } from '../../src/context/store';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// 定义类型
type CalendarDay = {
  day: string | number;
  isCurrentMonth: boolean;
  isToday?: boolean;
  isCheckedIn?: boolean;
  date?: Date;
};

type Challenge = {
  id: string;
  title: string;
  description: string;
  days: number;
  completed: number;
  participants: number;
  background: string[];
  icon: string;
};

export default function DayUp() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  
  // 状态
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTab, setSelectedTab] = useState('today'); // 'today' | 'calendar' | 'challenges'
  
  // 模拟数据 - 实际应用中应从API获取
  const streakDays = 7; // 连续打卡天数
  const monthlyCheckIns = 3; // 本月打卡次数
  const monthDays = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate(); // 当月总天数
  
  // 模拟任务列表数据
  const dailyTasks = [
    { id: '1', title: '日常打卡', description: '每日发布一篇动态', completed: false, icon: 'pencil-outline' },
    { id: '2', title: '心情记录', description: '用一张图片记录今日心情', completed: false, icon: 'emoticon-outline' },
    { id: '3', title: '连续阅读', description: '阅读至少3篇好友动态', completed: false, icon: 'book-open-variant' },
    { id: '4', title: '互动交流', description: '给好友点赞或评论', completed: false, icon: 'comment-text-outline' },
  ];
  
  // 模拟主题挑战数据
  const challenges: Challenge[] = [
    { 
      id: '1', 
      title: '21天读书打卡', 
      description: '每天分享一本好书',
      days: 21,
      completed: 14,
      participants: 132,
      background: ['#4facfe', '#00f2fe'],
      icon: 'book'
    },
    { 
      id: '2', 
      title: '早起俱乐部', 
      description: '连续7天早起打卡',
      days: 7,
      completed: 5,
      participants: 234,
      background: ['#ff9a9e', '#fad0c4'],
      icon: 'weather-sunny'
    },
    { 
      id: '3', 
      title: '健身30天', 
      description: '每日运动分享',
      days: 30,
      completed: 8,
      participants: 89,
      background: ['#84fab0', '#8fd3f4'],
      icon: 'arm-flex-outline'
    },
  ];
  
  // 生成当月日历数据
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const today = new Date();
    
    // 获取当月第一天是星期几
    const firstDay = new Date(year, month, 1).getDay();
    // 当月天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // 模拟已打卡的日期 (实际应从API获取)
    const checkedInDays = [1, 2, 3];
    
    const days: CalendarDay[] = [];
    
    // 填充月初空白
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: '', isCurrentMonth: false });
    }
    
    // 填充当月日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isToday = date.toDateString() === today.toDateString();
      const isCheckedIn = checkedInDays.includes(i);
      
      days.push({
        day: i,
        isCurrentMonth: true,
        isToday,
        isCheckedIn,
        date
      });
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  // 日历日期点击处理函数
  const handleDateSelect = (day: CalendarDay) => {
    if (day.isCurrentMonth && day.date) {
      setSelectedDate(day.date);
    }
  };
  
  // 渲染日历头部 (周一至周日)
  const renderCalendarHeader = () => {
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    
    return (
      <View style={styles.calendarHeader}>
        {weekDays.map(day => (
          <View key={day} style={styles.weekDay}>
            <Text style={[styles.weekDayText, { color: theme.colors.onSurface }]}>{day}</Text>
          </View>
        ))}
      </View>
    );
  };
  
  // 渲染日历
  const renderCalendar = () => {
    return (
      <View style={styles.calendarContainer}>
        {renderCalendarHeader()}
        
        <View style={styles.calendarGrid}>
          {calendarDays.map((item, index) => {
            if (!item.isCurrentMonth) {
              return <View key={index} style={styles.emptyDay} />;
            }
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  item.isToday && { borderColor: theme.colors.primary, borderWidth: 2 }
                ]}
                onPress={() => handleDateSelect(item)}
              >
                <View style={[
                  styles.dayCircle,
                  item.isCheckedIn && { backgroundColor: theme.colors.primary }
                ]}>
                  <Text style={[
                    styles.dayText,
                    item.isCheckedIn && { color: theme.colors.surface }
                  ]}>
                    {item.day}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };
  
  // 渲染每日任务列表
  const renderDailyTasks = () => {
    return (
      <View style={styles.tasksContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>今日打卡任务</Text>
        
        {dailyTasks.map(task => (
          <Card key={task.id} style={[styles.taskCard, { backgroundColor: theme.colors.surface }]} mode="outlined">
            <Card.Content style={styles.taskContent}>
              <View style={styles.taskIconContainer}>
                <Avatar.Icon 
                  size={40} 
                  icon={task.icon} 
                  style={{ backgroundColor: theme.colors.primaryContainer }}
                  color={theme.colors.primary}
                />
                {task.completed && (
                  <Badge 
                    style={[styles.completedBadge, { backgroundColor: theme.colors.primary }]} 
                    size={16}
                  >
                    ✓
                  </Badge>
                )}
              </View>
              
              <View style={styles.taskTextContainer}>
                <Text style={[styles.taskTitle, { color: theme.colors.onSurface }]}>{task.title}</Text>
                <Text style={styles.taskDescription}>{task.description}</Text>
              </View>
              
              <Button 
                mode={task.completed ? "outlined" : "contained"}
                onPress={() => {
                  if (task.title === '日常打卡') {
                    router.push({
                      pathname: '/(tabs)/Post',
                      params: { initialContent: '#日常打卡' }
                    });
                  } else {
                    console.log('打卡:', task.title);
                  }
                }}
                style={{ borderRadius: 20 }}
                disabled={task.completed}
              >
                {task.completed ? '已打卡' : '打卡'}
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>
    );
  };
  
  // 渲染主题挑战
  const renderChallenges = () => {
    return (
      <View style={styles.challengesContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>主题打卡</Text>
        
        {challenges.map(challenge => (
          <Card key={challenge.id} style={styles.challengeCard} mode="outlined">
            <LinearGradient
              colors={challenge.background as any}
              style={styles.challengeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.challengeHeader}>
                <Avatar.Icon 
                  size={40} 
                  icon={challenge.icon} 
                  style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  color="white"
                />
                <View style={styles.challengeTextContainer}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                </View>
                <Chip icon="account-group" style={styles.participantsChip}>
                  {challenge.participants}
                </Chip>
              </View>
              
              <View style={styles.challengeProgress}>
                <ProgressBar 
                  progress={challenge.completed / challenge.days} 
                  style={styles.progressBar}
                  color="white"
                />
                <Text style={styles.progressText}>
                  {challenge.completed}/{challenge.days}天
                </Text>
              </View>
            </LinearGradient>
          </Card>
        ))}
        
        <Button 
          mode="contained" 
          icon="plus" 
          style={[styles.addChallengeButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => console.log('创建新挑战')}
        >
          创建主题打卡
        </Button>
      </View>
    );
  };
  
  // 渲染顶部统计信息
  const renderStatistics = () => {
    return (
      <Card style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.statsContent}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{streakDays}</Text>
            <Text style={styles.statLabel}>连续打卡</Text>
          </View>
          
          <Divider style={{ height: '70%', width: 1 }} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{monthlyCheckIns}</Text>
            <Text style={styles.statLabel}>本月打卡</Text>
          </View>
          
          <Divider style={{ height: '70%', width: 1 }} />
          
          <View style={styles.statItem}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressPercent}>
                {Math.round((monthlyCheckIns / monthDays) * 100)}%
              </Text>
              <ProgressBar 
                progress={monthlyCheckIns / monthDays} 
                style={styles.monthProgress}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.statLabel}>月度完成度</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };
  
  // 渲染页面顶部标签栏
  const renderTabs = () => {
    return (
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            selectedTab === 'today' && [styles.selectedTab, { borderBottomColor: theme.colors.primary }]
          ]}
          onPress={() => setSelectedTab('today')}
        >
          <Text style={[
            styles.tabText, 
            selectedTab === 'today' && { color: theme.colors.primary, fontWeight: 'bold' }
          ]}>
            今日打卡
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            selectedTab === 'calendar' && [styles.selectedTab, { borderBottomColor: theme.colors.primary }]
          ]}
          onPress={() => setSelectedTab('calendar')}
        >
          <Text style={[
            styles.tabText, 
            selectedTab === 'calendar' && { color: theme.colors.primary, fontWeight: 'bold' }
          ]}>
            打卡日历
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            selectedTab === 'challenges' && [styles.selectedTab, { borderBottomColor: theme.colors.primary }]
          ]}
          onPress={() => setSelectedTab('challenges')}
        >
          <Text style={[
            styles.tabText, 
            selectedTab === 'challenges' && { color: theme.colors.primary, fontWeight: 'bold' }
          ]}>
            主题打卡
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>每日打卡</Text>
        <IconButton icon="bell-outline" size={24} onPress={() => console.log('打卡提醒')} />
      </View>
      
      {renderStatistics()}
      {renderTabs()}
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {selectedTab === 'today' && renderDailyTasks()}
        {selectedTab === 'calendar' && renderCalendar()}
        {selectedTab === 'challenges' && renderChallenges()}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.newTaskButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/contacts')}
      >
        <IconButton icon="alarm-plus" size={24} iconColor={theme.colors.onPrimary} />
        {/* <IconButton icon="plus-circle-outline" size={24} iconColor={theme.colors.onPrimary} /> */}
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
    paddingVertical: 10,
    marginTop:20
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statsCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 16,
    elevation: 2,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    padding: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  monthProgress: {
    height: 6,
    width: 60,
    borderRadius: 3,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectedTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
  },
  // 任务列表样式
  tasksContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  taskCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  completedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  taskTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  // 日历样式
  calendarContainer: {
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    padding: 5,
  },
  weekDayText: {
    fontSize: 14,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDay: {
    width: `${100/7}%`,
    aspectRatio: 1,
  },
  calendarDay: {
    width: `${100/7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    borderRadius: 4,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
  },
  // 主题挑战样式
  challengesContainer: {
    padding: 16,
  },
  challengeCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  challengeGradient: {
    padding: 16,
    borderRadius: 12,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  challengeTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  challengeDescription: {
    color: 'white',
    opacity: 0.8,
    fontSize: 12,
  },
  participantsChip: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressText: {
    color: 'white',
    marginLeft: 12,
    fontSize: 12,
  },
  addChallengeButton: {
    marginTop: 16,
    borderRadius: 24,
  },
  newTaskButton: {
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
