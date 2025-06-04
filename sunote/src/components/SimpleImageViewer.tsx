import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Dimensions,
  Platform,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type SimpleImageViewerProps = {
  visible: boolean;
  imageUrls: string[];
  initialIndex: number;
  onClose: () => void;
};

const SimpleImageViewer: React.FC<SimpleImageViewerProps> = ({ 
  visible, 
  imageUrls, 
  initialIndex, 
  onClose 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(false);
  
  // 下载图片
  const handleDownload = async () => {
    try {
      setLoading(true);
      
      // 请求存储权限
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限错误', '需要存储权限才能保存图片');
        setLoading(false);
        return;
      }
      
      const imageUrl = imageUrls[currentIndex];
      
      // 下载图片到缓存
      const fileUri = FileSystem.cacheDirectory + `temp_image_${Date.now()}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
      
      if (downloadResult.status !== 200) {
        Alert.alert('错误', '下载图片失败');
        setLoading(false);
        return;
      }
      
      // 保存到相册
      const asset = await MediaLibrary.saveToLibraryAsync(fileUri);
      
      // 清理缓存
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
      
      Alert.alert('成功', '图片已保存到相册');
    } catch (error) {
      console.error('保存图片失败:', error);
      Alert.alert('错误', '保存图片失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 长按处理
  const handleLongPress = () => {
    Alert.alert(
      '图片操作',
      '长按图片可进行下载或分享',
      [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: '下载图片',
          onPress: handleDownload
        }
      ]
    );
  };
  
  // 切换到下一张图片
  const goToNextImage = () => {
    if (currentIndex < imageUrls.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  // 切换到上一张图片
  const goToPreviousImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <IconButton
            icon="close"
            size={24}
            iconColor="white"
            onPress={onClose}
          />
          <Text style={styles.pageIndicator}>
            {currentIndex + 1} / {imageUrls.length}
          </Text>
          
          {/* 右上角下载按钮 */}
          <IconButton
            icon="download"
            size={24}
            iconColor="white"
            onPress={handleDownload}
            style={styles.downloadButton}
          />
        </View>
        
        <TouchableOpacity
          activeOpacity={1}
          style={styles.imageContainer}
          onLongPress={handleLongPress}
          delayLongPress={800}
        >
          <Image
            source={{ uri: imageUrls[currentIndex] }}
            style={styles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        {/* 左右导航区域 */}
        {imageUrls.length > 1 && (
          <>
            <TouchableOpacity
              style={[styles.navButton, styles.leftNavButton]}
              onPress={goToPreviousImage}
              disabled={currentIndex === 0}
            >
              <IconButton
                icon="chevron-left"
                size={36}
                iconColor={currentIndex === 0 ? 'rgba(255,255,255,0.3)' : 'white'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.navButton, styles.rightNavButton]}
              onPress={goToNextImage}
              disabled={currentIndex === imageUrls.length - 1}
            >
              <IconButton
                icon="chevron-right"
                size={36}
                iconColor={currentIndex === imageUrls.length - 1 ? 'rgba(255,255,255,0.3)' : 'white'}
              />
            </TouchableOpacity>
          </>
        )}
        
        {/* 长按提示 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>长按图片可查看更多选项</Text>
        </View>
        
        {/* 加载指示器 */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>正在下载图片...</Text>
          </View>
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
  pageIndicator: {
    color: 'white',
    fontSize: 16,
  },
  downloadButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    zIndex: 10,
  },
  leftNavButton: {
    left: 0,
  },
  rightNavButton: {
    right: 0,
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 20,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  }
});

export default SimpleImageViewer; 