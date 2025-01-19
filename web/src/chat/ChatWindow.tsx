// ChatWindow.tsx
import React from 'react';
import { Message } from './types';

interface ChatWindowProps {
  messages: Message[];  // 消息列表
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  return (
    <div style={{ border: '1px solid #ddd', padding: '10px', height: '400px', overflowY: 'scroll' }}>
      {messages.map((message) => (
        <div key={message.id} style={{ marginBottom: '10px' }}>
          <strong>{message.sender}</strong>: <span>{message.content}</span>
          <small style={{ marginLeft: '10px', color: '#888' }}>{message.timestamp}</small>
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;
