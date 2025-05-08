import React from 'react';
import { Button, Text } from '@react-navigation/elements';
import { StyleSheet, View } from 'react-native';

export default function Community() {
  return (
    <View style={styles.container}>
      <Text>Community Screen</Text>
      {/* <Button screen="Profile" onPress={() => console.log('Go to Profile')}>
        Go to Profile
      </Button>
      <Button screen="Settings">Go to Settings</Button> */}
    </View>
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
