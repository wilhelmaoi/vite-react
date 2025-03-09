import { Platform } from 'react-native'
import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

import schema from '../model/schema'
import migrations from '../model/migrations'
// import Post from '../model/Post' // 你后续可以添加 Model

// 创建 WatermelonDB 适配器
const adapter = new SQLiteAdapter({
schema,
  // （你可能想在开发过程中将其注释掉 -- 参见迁移文档）
  migrations,
  // （可选的数据库名称或文件系统路径）

  // dbName: 'myapp',
  
  // （推荐选项，应该在 iOS 上开箱即用。在 Android 上，
  // 需要采取额外的安装步骤 - 如果遇到问题请禁用...）
  // iOS 推荐使用 JSI，提高性能
  jsi: Platform.OS === 'ios', 

 // 数据库加载失败 -- 提供用户重新加载应用或注销的选项
  onSetUpError: error => {  
    console.error('Database setup failed:', error)
  }
})

// 创建 WatermelonDB 实例
const database = new Database({
  adapter,
  modelClasses: [
    // Post, // 你后续可以添加 Model
  ],
})

export default database
