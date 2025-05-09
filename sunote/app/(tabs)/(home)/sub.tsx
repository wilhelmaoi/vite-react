import React from 'react';
import { Button, Text,Surface, } from "react-native-paper";
import { StyleSheet } from 'react-native';

export default function Sub() {
  return (    
  <Surface style={styles.container}>
      <Text>关注 Screen</Text>
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
