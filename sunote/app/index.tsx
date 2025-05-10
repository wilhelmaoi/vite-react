import { Redirect, router, Slot, useRouter } from 'expo-router';
import React, { useEffect } from 'react';

export default function index() {

//     const router = useRouter();
//     useEffect(() => {
//     router.replace('/(tabs)/home'); // 直接跳转，无动画
//   }, []);

  return <Redirect href="/(tabs)/home" />;; 
}