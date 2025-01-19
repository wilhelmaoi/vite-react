import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// 获取根元素时，需要显式声明类型
const rootElement = document.getElementById('root');

// 检查根元素是否存在，避免潜在的空值错误
if (!rootElement) {
  throw new Error('Root element not found. Please check your HTML file.');
}

// 渲染应用程序
createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
