import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useTheme } from '../theme/ThemeContext';
import { IconButton, Text } from 'react-native-paper';
import VideoPlayer from './VideoPlayer';

interface VideoThumbnailProps {
  videoUrl: string;
  width?: number;
  height?: number;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ 
  videoUrl, 
  width = 160, 
  height = 160 
}) => {
  const theme = useTheme();
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(false);
  
  // 使用useCallback确保generateThumbnail不会在每次渲染时重新创建
  const generateThumbnail = useCallback(async () => {
    if (!videoUrl) {
      setError(true);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(false);
      
      const { uri } = await VideoThumbnails.getThumbnailAsync(
        videoUrl,
        {
          time: 0, // 获取视频开始处的帧
          quality: 0.5, // 缩略图质量
        }
      );
      
      if (uri) {
        setThumbnailUri(uri);
      } else {
        throw new Error('生成缩略图失败');
      }
    } catch (e) {
      console.error('获取视频缩略图失败:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [videoUrl]);
  
  // 视频URL变化时重新生成缩略图
  useEffect(() => {
    generateThumbnail();
  }, [generateThumbnail]);
  
  // 安全地打开播放器
  const handlePress = () => {
    setPlayerVisible(true);
  };
  
  // 安全地关闭播放器
  const handleClosePlayer = () => {
    setPlayerVisible(false);
  };
  
  if (loading) {
    return (
      <View style={[styles.container, { width, height }]}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={{ fontSize: 10, marginTop: 5 }}>加载缩略图...</Text>
      </View>
    );
  }
  
  if (error || !thumbnailUri) {
    return (
      <View style={[styles.container, { width, height, backgroundColor: theme.colors.surfaceVariant }]}>
        <IconButton icon="video-off" size={36} iconColor={theme.colors.error} />
        <Text style={{ fontSize: 10 }}>无法加载视频</Text>
      </View>
    );
  }
  
  return (
    <>
      <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={[styles.container, { width, height }]}>
          <Image 
            source={{ uri: thumbnailUri }} 
            style={styles.thumbnail} 
            resizeMode="cover"
          />
          <View style={styles.playIconContainer}>
            <IconButton 
              icon="play-circle" 
              size={40} 
              iconColor="rgba(255, 255, 255, 0.9)" 
            />
          </View>
        </View>
      </TouchableOpacity>
      
      {/* 
        确保只有在playerVisible为true时才渲染VideoPlayer组件
        这可以避免创建太多播放器实例
      */}
      {playerVisible && (
        <VideoPlayer
          visible={playerVisible}
          videoUrl={videoUrl}
          onClose={handleClosePlayer}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  playIconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    width: '100%',
    height: '100%',
  },
});

export default VideoThumbnail; 