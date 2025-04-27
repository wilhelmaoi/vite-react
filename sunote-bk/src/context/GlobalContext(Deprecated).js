// AuthContext.js
import React, { createContext, useReducer, useEffect, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';
import database from '../database(deprecated)'; // 你的 WatermelonDB 初始化对象
import { Q } from '@nozbe/watermelondb';
// import axios from 'axios'; // 用于远程请求

const apiUrl = process.env.EXPO_PUBLIC_API_URL;


// 创建 Context 对象
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            user: action.user,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
            user: action.user,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
            user: null,
          };
        default:
          return prevState;
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
      user: null,
    }
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      
      let token = null;
      let user = null;

      try {
        // 从 SecureStore 获取 token 和 userId
        token = await SecureStore.getItemAsync('userToken');
        const userId = await SecureStore.getItemAsync('userId');
        // 如果 userId 存在，从数据库中找到对应用户
        if (userId) {
          const usersCollection = database.get('users');
          user = await usersCollection.find(userId);
        }
      } catch (e) {
        console.warn('Token restore failed:', e);
      }

      dispatch({ type: 'RESTORE_TOKEN', token, user });
    };

    bootstrapAsync();
  }, []);

  const authContext = useMemo(() => ({
    signIn: async ({ username, password }) => {
      try {
        // 1. 请求远程服务器登录
        const response = await axios.post(apiUrl+"/login", {
          username,
          password,
        });
    
        const { token, user } = response.data;
    
        // 2. 存储 token 和 userId 到 SecureStore
        await SecureStore.setItemAsync('userToken', token);
        await SecureStore.setItemAsync('userId', user.id);
    
        // 3. 把用户信息写入本地 WatermelonDB
        const usersCollection = database.get('users');
    
        // 检查是否已存在
        const existing = await usersCollection.query(Q.where('id', user.id)).fetch();
    
        await database.write(async () => {
          if (existing.length === 0) {
            await usersCollection.create((u) => {
              u._raw.id = user.id; // 主键
              u.username = user.username;
              u.email = user.email;
            });
          } else {
            await existing[0].update((u) => {
              u.username = user.username;
              u.email = user.email;
            });
          }
        });
    
        // 4. 从本地数据库读取刚刚插入的 user
        const localUser = await usersCollection.find(user.id);
    
        dispatch({ type: 'SIGN_IN', token, user: localUser });
      } catch (err) {
        console.error('登录失败:', err);
        throw err;
      }
    },

    signOut: async () => {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userId');
      dispatch({ type: 'SIGN_OUT' });
    },

    signUp: async ({ username, password }) => {
      try {
        const usersCollection = database.get('users');

        const existing = await usersCollection
          .query(Q.where('username', username))
          .fetch();

        if (existing.length > 0) {
          throw new Error('用户名已存在');
        }

        const newUser = await database.write(async () => {
          return await usersCollection.create((user) => {
            user.username = username;
            user.password = password; // ⚠️ 实际开发请加密处理
          });
        });

        const token = `token-${newUser.id}-${Date.now()}`;
        await SecureStore.setItemAsync('userToken', token);
        await SecureStore.setItemAsync('userId', newUser.id);

        dispatch({ type: 'SIGN_IN', token, user: newUser });
      } catch (err) {
        throw err;
      }
    },

    user: state.user,
    userToken: state.userToken,
  }), [state.userToken, state.user]);

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};
