// src/database/userDB.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('user.db');


export interface User {
    id?: number;           // 可选，数据库自增
    username: string;
    password: string;
    nickname: string;
    email?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    address?: string;
    birthday?: string;     // 用 string 存储日期，格式如 'YYYY-MM-DD'
    avatarUpdatedAt?: number; // 头像更新时间戳
}

// 检查用户表是否存在
export function checkUserTableExists(): boolean {
  try {
    const result = db.getFirstSync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='user'"
    );
    return result ? true : false;
  } catch (error) {
    console.error("检查用户表是否存在时出错:", error);
    return false;
  }
}

// 初始化数据库
export function initDatabase() {
  try {
    // 检查表是否存在，不存在则创建
    if (!checkUserTableExists()) {
      console.log("用户表不存在，正在创建...");
      createUserTable();
    } else {
      console.log("用户表已存在");
      // 检查并添加新列
      updateUserTable();
    }
  } catch (error) {
    console.error("初始化数据库时出错:", error);
  }
}

// 更新用户表（添加新列）
export function updateUserTable() {
  try {
    // 检查avatar_updated_at列是否存在
    const tableInfo = db.getFirstSync("PRAGMA table_info(user)");
    const columns = tableInfo || [];
    // 判断columns是否是数组，然后再调用some方法
    const hasColumn = Array.isArray(columns) ? 
      columns.some((col: any) => col.name === 'avatar_updated_at') : 
      false;
    
    if (!hasColumn) {
      // 如果列不存在，添加该列
      db.execSync(`ALTER TABLE user ADD COLUMN avatar_updated_at INTEGER`);
      console.log('用户表已更新：添加了avatar_updated_at列');
    }
  } catch (error) {
    console.error("更新用户表结构失败:", error);
  }
}

// 创建用户表（同步）
export function createUserTable() {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT,
        email TEXT,
        phone TEXT,
        avatar TEXT,
        bio TEXT,
        address TEXT,
        birthday TEXT,
        avatar_updated_at INTEGER
      );
    `);
    console.log('用户表已创建');
  } catch (error) {
    console.error("创建用户表失败:", error);
  }
}
  
// 保存用户信息（同步）
export function saveUser(user: User) {
  try {
    db.execSync(
      `INSERT OR REPLACE INTO user (id, username, password, email, phone, avatar, bio, address, birthday, avatar_updated_at) VALUES (
        ${user.id ?? 'NULL'},
        '${user.username}',
        '${user.password}',
        '${user.email ?? ''}',
        '${user.phone ?? ''}',
        '${user.avatar ?? ''}',
        '${user.bio ?? ''}',
        '${user.address ?? ''}',
        '${user.birthday ?? ''}',
        ${user.avatarUpdatedAt ?? 'NULL'}
      )`
    );
  } catch (error) {
    console.error("保存用户信息失败:", error);
  }
}

// 获取用户信息
export function getUser() {
  try {
    const result = db.getFirstSync(`SELECT * FROM user LIMIT 1`);
    if (result) {
      // 确保返回的对象符合User接口
      const user = result as any;
      // 将avatar_updated_at映射到avatarUpdatedAt
      if (user.avatar_updated_at !== undefined) {
        user.avatarUpdatedAt = user.avatar_updated_at;
      }
      return user as User;
    }
    return null;
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return null;
  }
}

// 删除用户信息
export function deleteUser() {
  try {
    db.execSync(`DELETE FROM user`);
  } catch (error) {
    console.error("删除用户信息失败:", error);
  }
}