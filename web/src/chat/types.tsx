// types.ts
export interface Message {
  id: string;       // 消息的唯一标识符
  sender: string;   // 发送者
  content: string;  // 消息内容
  timestamp: string; // 消息时间
}
