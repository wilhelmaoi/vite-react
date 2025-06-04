import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Dimensions,
  Platform
} from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useVideoPlayer, VideoView } from 'expo-video';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type VideoPlayerProps = {
  visible: boolean;
  videoUrl: string;
  onClose: () => void;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  visible, 
  videoUrl, 
  onClose 
}) => {
  // 跟踪组件是否已挂载
  const isMounted = useRef(true);
  
  // 跟踪播放器是否初始化
  const [playerReady, setPlayerReady] = useState(false);
  
  // 只在可见时创建播放器实例
  const player = useVideoPlayer(visible ? videoUrl : null, player => {
    if (isMounted.current && visible) {
      // 播放器初始化配置
      player.loop = true;
      
      // 播放器已准备好
      setPlayerReady(true);
      
      // 设置延迟，确保视图已完全准备好
      setTimeout(() => {
        if (isMounted.current && visible) {
          player.play();
        }
      }, 300);
    }
  });
  
  // 监听播放状态变化
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 处理可见性变化
  useEffect(() => {
    if (!visible) {
      // 当对话框关闭时，将播放状态重置
      setIsPlaying(false);
      setPlayerReady(false);
      
      // 安全地暂停播放
      if (player) {
        try {
          player.pause();
        } catch (e) {
          console.log('暂停播放器时出错:', e);
        }
      }
    } else if (visible && player && playerReady) {
      // 设置延迟，确保视图已完全准备好
      setTimeout(() => {
        if (isMounted.current && player) {
          try {
            player.play();
            setIsPlaying(true);
          } catch (e) {
            console.log('播放视频时出错:', e);
          }
        }
      }, 500);
    }
    
    // 组件卸载时的清理
    return () => {
      if (player && visible) {
        try {
          player.pause();
        } catch (e) {
          console.log('清理时暂停播放器出错:', e);
        }
      }
    };
  }, [visible, player, playerReady]);
  
  // 组件挂载/卸载生命周期
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // 切换播放/暂停状态
  const togglePlayPause = () => {
    if (!player || !playerReady) return;
    
    try {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.play();
        setIsPlaying(true);
      }
    } catch (e) {
      console.log('切换播放状态时出错:', e);
    }
  };
  
  // 处理用户点击关闭按钮
  const handleClose = () => {
    // 先暂停播放，然后关闭模态框
    if (player && playerReady) {
      try {
        player.pause();
      } catch (e) {
        console.log('关闭时暂停播放器出错:', e);
      }
    }
    
    // 重置状态
    setIsPlaying(false);
    setPlayerReady(false);
    
    // 通知父组件关闭
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <IconButton
            icon="close"
            size={24}
            iconColor="white"
            onPress={handleClose}
          />
        </View>
        
        <View style={styles.videoContainer}>
          {player && visible && (
            <VideoView
              player={player}
              style={styles.video}
              nativeControls={true}
              contentFit="contain"
            />
          )}
        </View>
        
        {playerReady && (
          <TouchableOpacity 
            // style={styles.playPauseButton}
            onPress={togglePlayPause}
          >
            {/* <IconButton
              icon={isPlaying ? 'pause' : 'play'}
              size={48}
              iconColor="white"
            /> */}
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    zIndex: 10,
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playPauseButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 40,
    width: 80,
    height: 80,
  },
});

export default VideoPlayer; 