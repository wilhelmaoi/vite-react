好的，我来详细描述每个表和字段的作用，让你对数据库结构一目了然。  

---

# 📌 **MySQL 数据库设计 - 详细字段描述**

---

## **1. 用户系统（Users & Friends & Roles）**
### **📂 `users` (用户表)**
| 字段名       | 类型              | 描述 |
|-------------|-----------------|------------------------------|
| `id`        | BIGINT (PK)      | 用户唯一 ID，自增主键 |
| `username`  | VARCHAR(50) UNIQUE NOT NULL | 用户名，唯一，不可为空 |
| `email`     | VARCHAR(100) UNIQUE NOT NULL | 电子邮件，唯一，不可为空 |
| `password_hash` | VARCHAR(255) NOT NULL | 用户密码的哈希值 |
| `avatar_url` | VARCHAR(255)  | 用户头像 URL |
| `bio`       | TEXT           | 个人简介 |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | 账号创建时间 |
| `updated_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 账号更新时间 |

---

### **📂 `friends` (好友关系表)**
| 字段名       | 类型              | 描述 |
|-------------|-----------------|------------------------------|
| `user_id`   | BIGINT (FK)      | 发起好友请求的用户 ID |
| `friend_id` | BIGINT (FK)      | 被添加为好友的用户 ID |
| `status`    | ENUM('pending', 'accepted', 'blocked') DEFAULT 'pending' | 好友状态（待确认/已接受/已拉黑） |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | 添加时间 |

---

### **📂 `roles` (角色表)**
| 字段名       | 类型         | 描述 |
|-------------|------------|------------------------------|
| `id`        | INT (PK)   | 角色 ID，自增主键 |
| `name`      | VARCHAR(50) UNIQUE NOT NULL | 角色名称，如 '管理员'、'用户' |

---

### **📂 `user_roles` (用户角色关联表)**
| 字段名   | 类型  | 描述 |
|----------|------|------------------------------|
| `user_id` | BIGINT (FK) | 用户 ID |
| `role_id` | INT (FK) | 角色 ID |

---

## **2. 社群/服务器**
### **📂 `servers` (服务器表)**
| 字段名       | 类型              | 描述 |
|-------------|-----------------|------------------------------|
| `id`        | BIGINT (PK)      | 服务器唯一 ID |
| `name`      | VARCHAR(100) NOT NULL | 服务器名称 |
| `description` | TEXT          | 服务器介绍 |
| `owner_id`  | BIGINT (FK)     | 服务器创建者 ID |
| `icon_url`  | VARCHAR(255)    | 服务器头像 URL |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

### **📂 `server_members` (服务器成员表)**
| 字段名       | 类型               | 描述 |
|-------------|------------------|------------------------------|
| `server_id` | BIGINT (FK)      | 所属服务器 ID |
| `user_id`   | BIGINT (FK)      | 用户 ID |
| `role`      | ENUM('owner', 'admin', 'member') DEFAULT 'member' | 服务器角色 |
| `joined_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | 加入时间 |

---

## **3. 频道 & 聊天**
### **📂 `channels` (频道表)**
| 字段名       | 类型              | 描述 |
|-------------|-----------------|------------------------------|
| `id`        | BIGINT (PK)      | 频道唯一 ID |
| `server_id` | BIGINT (FK)      | 所属服务器 ID |
| `name`      | VARCHAR(100) NOT NULL | 频道名称 |
| `type`      | ENUM('text', 'voice') NOT NULL DEFAULT 'text' | 频道类型 |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | 创建时间 |

---

### **📂 `messages` (频道消息表)**
| 字段名       | 类型              | 描述 |
|-------------|-----------------|------------------------------|
| `id`        | BIGINT (PK)      | 消息唯一 ID |
| `channel_id` | BIGINT (FK)     | 所属频道 ID |
| `user_id`   | BIGINT (FK)     | 发送者 ID |
| `content`   | TEXT NOT NULL   | 消息内容 |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | 发送时间 |
| `updated_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 编辑时间 |

---

### **📂 `private_messages` (私信表)**
| 字段名       | 类型              | 描述 |
|-------------|-----------------|------------------------------|
| `id`        | BIGINT (PK)      | 私信唯一 ID |
| `sender_id` | BIGINT (FK)     | 发送者 ID |
| `receiver_id` | BIGINT (FK)    | 接收者 ID |
| `content`   | TEXT NOT NULL   | 消息内容 |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | 发送时间 |

---

## **4. 帖子 & 评论**
### **📂 `posts` (帖子表)**
| 字段名       | 类型              | 描述 |
|-------------|-----------------|------------------------------|
| `id`        | BIGINT (PK)      | 帖子 ID |
| `user_id`   | BIGINT (FK)     | 作者 ID |
| `content`   | TEXT NOT NULL   | 帖子内容 |
| `image_url` | VARCHAR(255)    | 附带图片 URL |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | 发表时间 |
| `updated_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

---

### **📂 `comments` (评论表)**
| 字段名       | 类型              | 描述 |
|-------------|-----------------|------------------------------|
| `id`        | BIGINT (PK)      | 评论 ID |
| `post_id`   | BIGINT (FK)     | 所属帖子 ID |
| `user_id`   | BIGINT (FK)     | 评论者 ID |
| `content`   | TEXT NOT NULL   | 评论内容 |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | 评论时间 |

---

## **5. 互动 & 点赞**
### **📂 `likes` (点赞表)**
| 字段名       | 类型              | 描述 |
|-------------|-----------------|------------------------------|
| `id`        | BIGINT (PK)      | 点赞 ID |
| `user_id`   | BIGINT (FK)     | 点赞者 ID |
| `post_id`   | BIGINT (FK)     | 被点赞的帖子 ID |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | 点赞时间 |

---

### **📂 `notifications` (通知表)**
| 字段名       | 类型              | 描述 |
|-------------|-----------------|------------------------------|
| `id`        | BIGINT (PK)      | 通知 ID |
| `user_id`   | BIGINT (FK)     | 接收通知的用户 ID |
| `type`      | ENUM('like', 'comment', 'friend_request', 'message') NOT NULL | 通知类型 |
| `related_id` | BIGINT NOT NULL | 关联的内容 ID（帖子、评论等） |
| `is_read`   | BOOLEAN DEFAULT FALSE | 是否已读 |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | 生成时间 |

---

表结构涵盖了**社交、社区、聊天、帖子、互动、管理**等核心功能。😊

