import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface,Text, Button  } from 'react-native-paper';

export default function greyMask() {
    const router = useRouter();

      // 初次进入页面时，自动读取账号密码
  useEffect(() => {
    router.push('/modal/sign-up'); 
  }, []);
  return (
   <View style={styles.container}/>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
   backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
});
