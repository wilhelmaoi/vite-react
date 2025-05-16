// src/database/userDB.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('user.db');


export interface User {
    id?: number;           // 可选，数据库自增
    username: string;
    password: string;
    email?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    address?: string;
    birthday?: string;     // 用 string 存储日期，格式如 'YYYY-MM-DD'
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
    }
  } catch (error) {
    console.error("初始化数据库时出错:", error);
  }
}

// 创建用户表（同步）
export function createUserTable() {
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
        birthday TEXT
      );
    `);
  }
  
  // 保存用户信息（同步）
  export function saveUser(user: User) {
    db.execSync(
      `INSERT OR REPLACE INTO user (id, username, password, email, phone, avatar, bio, address, birthday) VALUES (
        ${user.id ?? 'NULL'},
        '${user.username}',
        '${user.password}',
        '${user.email ?? ''}',
        '${user.phone ?? ''}',
        '${user.avatar ?? ''}',
        '${user.bio ?? ''}',
        '${user.address ?? ''}',
        '${user.birthday ?? ''}'
      )`
    );
  }
  
  // 查询用户信息（同步）
  export function getUser(): User | null {
    const result = db.getFirstSync(
      `SELECT * FROM user LIMIT 1`
    );
    return result as User | null;
  }
  
  // 清空用户信息（同步）
  export function clearUser() {
    db.execSync(`DELETE FROM user`);
  }