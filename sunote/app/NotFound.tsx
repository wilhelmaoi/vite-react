import React from 'react';
import { StyleSheet } from 'react-native';
import { Surface,Text, Button  } from 'react-native-paper';

export default function NotFound() {
  return (
    <Surface style={styles.container}>
      <Text>404</Text>
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
