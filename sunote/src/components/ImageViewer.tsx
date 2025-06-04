import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Dimensions,
  Alert,
  Platform,
  ActivityIndicator,
  Image as RNImage
} from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ImageViewerProps = {
  visible: boolean;
  imageUrls: string[];
  initialIndex: number;
  onClose: () => void;
};

const ImageViewer: React.FC<ImageViewerProps> = ({ 
  visible, 
  imageUrls, 
  initialIndex, 
  onClose 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(false);
  
  // 处理长按下载图片
  const handleLongPress = async () => {
    try {
      if (!imageUrls[currentIndex]) return;
      
      // 请求权限
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限错误', '需要访问存储权限才能保存图片');
        return;
      }
      
      Alert.alert(
        '图片操作',
        '请选择操作',
        [
          {
            text: '取消',
            style: 'cancel'
          },
          {
            text: '保存图片',
            onPress: async () => {
              try {
                setLoading(true);
                const imageUrl = imageUrls[currentIndex];
                
                // 从网络下载图片到本地缓存
                const fileUri = FileSystem.cacheDirectory + `temp_image_${Date.now()}.jpg`;
                const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
                
                if (downloadResult.status !== 200) {
                  throw new Error('下载图片失败');
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
            }
          },
          {
            text: '分享图片',
            onPress: async () => {
              try {
                setLoading(true);
                const imageUrl = imageUrls[currentIndex];
                
                // 从网络下载图片到本地缓存
                const fileUri = FileSystem.cacheDirectory + `temp_image_${Date.now()}.jpg`;
                await FileSystem.downloadAsync(imageUrl, fileUri);
                
                // 分享图片
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(fileUri);
                } else {
                  Alert.alert('错误', '分享功能不可用');
                }
                
                // 清理缓存
                await FileSystem.deleteAsync(fileUri, { idempotent: true });
              } catch (error) {
                console.error('分享图片失败:', error);
                Alert.alert('错误', '分享图片失败');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('图片操作出错:', error);
      Alert.alert('错误', '操作失败');
    }
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
        </View>
        
        <TouchableOpacity
          activeOpacity={1}
          style={styles.imageContainer}
          onLongPress={handleLongPress}
          delayLongPress={800}
        >
          <RNImage
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
          <Text style={styles.footerText}>长按图片可保存或分享</Text>
        </View>
        
        {/* 加载指示器 */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
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
    marginRight: 20,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 20,
  },
});

export default ImageViewer; 