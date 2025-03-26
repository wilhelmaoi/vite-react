import { appSchema, tableSchema } from '@nozbe/watermelondb';

const Schema = appSchema({
  version: 1, // 数据库版本
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'username', type: 'string', isIndexed: true },
        { name: 'email', type: 'string', isIndexed: true },
        { name: 'password_hash', type: 'string' },
        { name: 'avatar_url', type: 'string', isOptional: true },
        { name: 'bio', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' }, // WatermelonDB 处理时间戳时通常使用 number
        { name: 'updated_at', type: 'number' }
      ]
    })
  ]
});
export default Schema;
