// import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home.tsx';
import About from './pages/about/about';
// import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      {/* 默认跳转到 Home 页面 */}
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      {/* 404 页面 */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}
export default App
