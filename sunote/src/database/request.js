// database/request.ts
import axios from 'axios';
// 假设你zustand的authStore这么导出
import { useAuthStore } from '../context/store';
import { useNavigation } from '@react-navigation/native'

const request = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL, // 你的后端API地址
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器（加 token）
request.interceptors.request.use(
    async (config) => {
      const token = useAuthStore.getState().token;
  
      if (config.url !== '/login') {
        if (token && config.headers) {
            // 统一使用token作为请求头名称，确保与后端匹配
            config.headers['token'] = token;
            
            // 保留Authorization Bearer方式以支持其他后端格式
            if (config.headers['Authorization'] === undefined) {
              config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
      }
  
      return config;
    },
    (error) => Promise.reject(error)
  );
  


// request.interceptors.response.use(
//   response => response,
//   async error => {
//     // 通常后端没权限会返回401
//     if (error.response && error.response.status === 401) {
//       // 清空token （推荐这样保护安全）
//       useAuthStore.getState().logout(); // 你要有logout方法，清空store和相关缓存
//       // 跳转到登录页面
//       //router.replace('/login');   expo-router推荐
//       navigation.replace('Login');
//     }
//     return Promise.reject(error);
//   }
// );

// 响应拦截器（处理错误）
request.interceptors.response.use(
  response => response,
  (error) => {
    console.log('请求错误：', error);
    return Promise.reject(error);
  }
);

export default request;
