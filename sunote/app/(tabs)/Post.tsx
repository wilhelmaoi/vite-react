import React from 'react';
import { StyleSheet } from 'react-native';
import { Surface,Text } from 'react-native-paper';


export default function Post() {
  return (
    <Surface style={styles.container}>
      <Text>投稿界面</Text>
      {/* <Button screen="Profile" onPress={() => console.log('Go to Profile')}>
        Go to Profile
      </Button>
      <Button screen="Settings">Go to Settings</Button> */}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
});
