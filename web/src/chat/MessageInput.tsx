// MessageInput.tsx
import React, { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;  // 发送消息的回调
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSendClick = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');  // 发送后清空输入框
    }
  };

  return (
    <div style={{ display: 'flex', marginTop: '10px' }}>
      <input
        type="text"
        value={message}
        onChange={handleInputChange}
        placeholder="Type a message..."
        style={{ flex: 1, padding: '10px' }}
      />
      <button
        onClick={handleSendClick}
        style={{ padding: '10px', marginLeft: '10px' }}
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
