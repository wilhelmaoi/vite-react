import { Avatar, Button, Text, List } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

export function Mine() {
  return (
    <View style={styles.container}>
      {/* 用户头像 */}
      <Avatar.Image 
        size={80} 
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2111/2111370.png' }} 
      />
      <View style={styles.statusIndicator} />

      {/* 用户名 & 标识符 */}
      <Text style={styles.username}>wilhelmaoi</Text>
      <Text style={styles.tag}>wilhelmaoi#1234</Text>

      {/* 编辑个人资料 */}
      <Button mode="contained" style={styles.button}>
        编辑个人资料
      </Button>

      {/* 信息列表 */}
      <List.Section style={styles.list}>
        <List.Item
          title="成员加入时间"
          description="2017年8月27日"
          left={() => <List.Icon icon="calendar" />}
        />
        <List.Item
          title="您的好友"
          description="点击查看好友列表"
          left={() => <List.Icon icon="account-group" />}
        />
        <List.Item
          title="备注"
          description="添加备注信息"
          left={() => <List.Icon icon="note-outline" />}
          right={() => <List.Icon icon="plus-circle-outline" />}
        />
      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    gap: 10,
  },
  username: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  tag: {
    color: '#aaa',
    fontSize: 14,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#43b581',
    position: 'absolute',
    bottom: 10,
    right: 15,
    borderWidth: 3,
    borderColor: '#18191c',
  },
  button: {
    marginTop: 10,
    width: '80%',
  },
  list: {
    width: '100%',
    marginTop: 10,
  },
});

export default Mine;
