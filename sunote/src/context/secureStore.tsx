// /context/secureStore.tsx
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function deleteToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
// 保存账号
export async function saveAccount(account: string) {
  await SecureStore.setItemAsync('user_account', account);
}

// 保存密码
export async function savePassword(password: string) {
  await SecureStore.setItemAsync('user_password', password);
}

// 获取账号
export async function getAccount() {
  return await SecureStore.getItemAsync('user_account');
}

// 获取密码
export async function getPassword() {
  return await SecureStore.getItemAsync('user_password');
}