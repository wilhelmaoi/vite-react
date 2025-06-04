import React, { useState, useRef, useMemo, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Modal, Animated, PanResponder, Alert, ActivityIndicator } from 'react-native';
import { Surface, Text, TextInput, Button, IconButton, Card, Chip, Dialog, Portal } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useAuthStore } from '../../src/context/store';
import request from '../../src/database/request';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import * as FileSystem from 'expo-file-system';

// 定义文本片段的类型
interface TextSegment {
  text: string;
  isTag: boolean;
}

export default function Post() {
  const theme = useTheme();
  const { initialContent } = useLocalSearchParams();
  const [content, setContent] = useState(initialContent as string || '');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const { username, user } = useAuthStore();
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [tempImagePaths, setTempImagePaths] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [mood, setMood] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [formattedContent, setFormattedContent] = useState<TextSegment[]>([]);
  // 文本输入框引用
  const contentInputRef = useRef<any>(null);
  
  // 文本输入光标位置
  const [selectionStart, setSelectionStart] = useState(0);
  const router = useRouter();
  
  // 获取格式化内容的函数
  const getFormattedContent = (text: string): TextSegment[] => {
    // 正则匹配以 # 开头、后跟字母数字或中文的标签
    const regex = /(#[\w\u4e00-\u9fa5]+)/g;
    const parts = text.split(regex);
    
    return parts.map((part) => ({
      text: part,
      isTag: part.startsWith('#') && regex.test(part),
    }));
  };
  
  // 提取当前内容中的所有标签
  const extractTags = (text: string): string[] => {
    const tagRegex = /#([^\s#]+)/g;
    const tags: string[] = [];
    let match;
    
    while ((match = tagRegex.exec(text)) !== null) {
      tags.push(match[0]);
    }
    
    return tags;
  };
  
  // 处理标签添加
  const handleAddTag = () => {
    if (!contentInputRef.current) return;
    
    // 在当前光标位置插入#符号
    const newContent = 
      content.substring(0, selectionStart) + 
      '#' + 
      content.substring(selectionStart);
    
    setContent(newContent);
    
    // 更新标签列表
    setCurrentTags(extractTags(newContent));
    
    // 聚焦输入框
    setTimeout(() => {
      if (contentInputRef.current) {
        contentInputRef.current.focus();
      }
    }, 50);
  };
  
  // 监听内容变化，提取标签
  const handleContentChange = (text: string) => {
    setContent(text);
    setFormattedContent(getFormattedContent(text));
    setCurrentTags(extractTags(text));
  };
  
  // 监听光标位置变化
  const handleSelectionChange = (event) => {
    setSelectionStart(event.nativeEvent.selection.start);
  };
  
  // 动画值
  const pan = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0) { // 仅允许向下拖动
          pan.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy > 80) { // 下拉超过80像素时关闭
          setShowAllImages(false);
        } else {
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // 获取当前位置信息
  const getLocationAsync = async () => {
    let currentLocation: Location.LocationObject | null = null;
   
    try {
      setIsLocationLoading(true);
      console.log('开始获取位置权限...');
      // 检查位置权限
      const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
      console.log('当前位置权限状态:', foregroundStatus);
      
      // 如果没有权限，请求权限
      if (foregroundStatus !== 'granted') {
        console.log('请求位置权限...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('权限请求结果:', status);
        
        if (status !== 'granted') {
          Alert.alert('无法获取位置', '请允许应用访问位置信息');
          setIsLocationLoading(false);
          return;
        }
      }

      // 检查位置服务是否启用
      const enabled = await Location.hasServicesEnabledAsync();
      console.log('位置服务是否启用:', enabled);
      
      if (!enabled) {
        Alert.alert(
          '位置服务未启用', 
          '请在设备设置中启用位置服务',
          [{ text: '确定', onPress: () => setIsLocationLoading(false) }]
        );
        return;
      }
       // 如果在模拟器或无法获取位置，使用桂林作为默认位置
    // currentLocation = {
    //   coords: {
    //     latitude: 25.2736,
    //     longitude: 110.2907,
    //     altitude: null,
    //     accuracy: 800,
    //     altitudeAccuracy: null,
    //     heading: null,
    //     speed: null
    //   },
    //   timestamp: Date.now()
    // };
    // setLocation(currentLocation);


      // console.log('获取当前位置...');
      // 获取当前位置（添加超时和更高精度选项）
      // try {
      //   const loc = await Location.getCurrentPositionAsync({
      //     accuracy: Location.Accuracy.Highest,
      //     timeInterval: 1000,
      //     mayShowUserSettingsDialog: true
      //   });
      //   currentLocation = loc;
      //   setLocation(loc);
      //   console.log('成功获取位置:', loc);
      // } catch (locError) {
      //   console.error('获取当前位置失败:', locError);
        
        // 尝试获取最后已知位置作为后备
        console.log('尝试获取最后已知位置...');
        try {
          const lastLocation = await Location.getLastKnownPositionAsync();
          if (lastLocation) {
            currentLocation = lastLocation;
            setLocation(lastLocation);
            console.log('成功获取最后已知位置:', lastLocation);
          } else {
            console.log('没有最后已知位置，使用默认位置');
            

          }
        } catch (lastLocationError) {
          console.error('获取最后已知位置失败:', lastLocationError);
          
        }
     
      
      // 从这里开始使用获取到的位置
      const { latitude, longitude } = currentLocation?.coords || { latitude: 25.2736, longitude: 110.2907 };
      console.log(`使用坐标进行地理编码: lat=${latitude}, lng=${longitude}`);
      
      // try {
      //   // 优先使用高德地图API进行反向地理编码
      //   const amapKey = 'fdc59e296bdc1805c29b9c8a2a8993bc';
      //   const geocodeUrl = `https://restapi.amap.com/v3/geocode/regeo?key=${amapKey}&location=${longitude},${latitude}&poitype=&radius=1000&extensions=all&batch=false&roadlevel=0`;
        
      //   console.log('请求高德地图API:', geocodeUrl);
      //   const response = await fetch(geocodeUrl);
      //   const data = await response.json();
      //   console.log('高德地图响应:', data);
        
      //   if (data.status === '1' && data.regeocode) {
      //     // 提取城市信息
      //     const addressComponent = data.regeocode.addressComponent;
      //     const city = addressComponent.city || addressComponent.district || addressComponent.province || '未知位置';
      //     console.log('解析到的城市:', city);
      //     setLocationName(city);
      //   } else {
      //     console.log('高德地图API返回错误，尝试Expo地理编码');
      //     throw new Error('高德地图API返回错误');
      //   }
      // } catch (aMapError) {
      //   console.error('高德地图API调用失败:', aMapError);
        
        // 高德API调用失败，回退到Expo的反向地理编码（国外可用）
        try {
          console.log('尝试使用Expo的地理编码...');
          const geoResults = await Location.reverseGeocodeAsync({
            latitude,
            longitude
          });
          console.log('Expo地理编码结果:', geoResults);
          
          if (geoResults.length > 0) {
            const { city, region, district, postalCode, country } = geoResults[0];
            console.log('Expo解析地址组件:', { city, region, district, postalCode, country });
            // 使用城市名，如果没有则使用区域名
            const placeName = city || district || region || '未知位置';
            console.log('最终使用地点名称:', placeName);
            setLocationName(placeName);
          } else {
            console.log('Expo地理编码没有返回结果');
            setLocationName('未知位置');
          }
        } catch (expoGeoError) {
          console.error('Expo地理编码失败:', expoGeoError);
          
          // 使用备用方案 - 在 Geocoder 服务不可用时直接使用预设位置名
          setLocationName('桂林');
        }
      } finally {
        setIsLocationLoading(false);
      }
    };
  
  // 处理位置标签点击
  const handleLocationPress = () => {
    if (!locationName) {
      getLocationAsync();
    } else {
      // 如果已经有位置，点击可以重置
      setLocationName(null);
    }
  };

  // 顶部栏取消
  const handleCancel = () => {
    router.back();
  };

  // 选择并上传图片或视频
  const pickImage = async () => {
    try {
      // 选择媒体文件
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // 降低质量以减小文件大小
        videoMaxDuration: 60, // 限制视频最大时长为60秒
      });
      
      if (result.canceled) {
        return;
      }
      
      // 显示本地预览
      const localUri = result.assets[0].uri;
      const assetType = result.assets[0].type || 'image'; // 获取媒体类型
      
      // 检查文件大小
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      console.log('选择的文件大小: ', fileInfo.exists ? (fileInfo.size || 0) / (1024 * 1024) : 0, 'MB');
      
      // 如果文件超过8MB，提示用户
      if (fileInfo.exists && fileInfo.size && fileInfo.size > 8 * 1024 * 1024) {
        if (assetType === 'video') {
          Alert.alert(
            '文件过大', 
            '视频文件大小超过8MB，可能导致上传失败。建议选择更短或更小的视频。',
            [
              {text: '取消', style: 'cancel'},
              {text: '继续上传', onPress: () => uploadMedia(localUri, assetType)}
            ]
          );
        } else {
          Alert.alert(
            '文件过大', 
            '图片文件大小超过8MB，可能导致上传失败。是否继续?',
            [
              {text: '取消', style: 'cancel'},
              {text: '继续上传', onPress: () => uploadMedia(localUri, assetType)}
            ]
          );
        }
      } else {
        // 文件大小合适，直接上传
        uploadMedia(localUri, assetType);
      }
    } catch (error) {
      console.error('选择媒体文件失败:', error);
      Alert.alert('上传失败', '请检查网络连接后重试');
    }
  };
  
  // 上传媒体文件到服务器
  const uploadMedia = async (localUri, assetType) => {
    try {
      setImages([...images, localUri]);
      
      // 准备contentType
      let contentType;
      let fileName;
      
      if (assetType === 'video') {
        contentType = 'video/mp4'; // 默认视频格式
        fileName = 'video.mp4';
      } else {
        // 根据文件扩展名判断图片类型
        if (localUri.endsWith('.jpg') || localUri.endsWith('.jpeg')) {
          contentType = 'image/jpeg';
          fileName = 'image.jpg';
        } else if (localUri.endsWith('.png')) {
          contentType = 'image/png';
          fileName = 'image.png';
        } else if (localUri.endsWith('.gif')) {
          contentType = 'image/gif';
          fileName = 'image.gif';
        } else if (localUri.endsWith('.webp')) {
          contentType = 'image/webp';
          fileName = 'image.webp';
        } else {
          contentType = 'image/jpeg'; // 默认格式
          fileName = 'image.jpg';
        }
      }
      
      // 上传到服务器临时存储
      const formData = new FormData();
      formData.append('image', {
        uri: localUri,
        type: contentType,
        name: fileName,
      } as any);
      
      // 显示上传进度
      setUploadProgress(0);
      
      // 上传媒体文件
      const response = await request({
        method: 'POST',
        url: '/post/upload-temp-image',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });
      
      setUploadProgress(0);
      
      if (response.data.code === 200) {
        // 保存临时路径，用于最终发帖时传给后端
        setTempImagePaths([...tempImagePaths, response.data.data.tempPath]);
        console.log('媒体文件已上传到临时存储:', response.data.data);
      } else {
        Alert.alert('上传失败', response.data.msg || '媒体文件上传失败');
        // 移除本地预览
        setImages(images.filter(img => img !== localUri));
      }
    } catch (error) {
      console.error('上传媒体文件失败:', error);
      // 移除本地预览
      setImages(images.filter(img => img !== localUri));
      
      // 检查是否是文件大小超出限制错误
      if (error.response && error.response.status === 413) {
        Alert.alert('上传失败', '文件大小超出服务器限制');
      } else {
        Alert.alert('上传失败', '请检查网络连接后重试');
      }
    }
  };

  // 发表帖子
  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('内容不能为空', '请输入帖子内容');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 提取标签
      const tags = extractTags(content);
      
      // 准备请求数据
      const postData = {
        content: content,
        username: username,
        nickname: user?.nickname || username,
        tempImagePaths: tempImagePaths,
        location: locationName || undefined,
        mood: mood || undefined,
        tags: tags.length > 0 ? tags : undefined
      };
      
      console.log('发送帖子数据:', postData);
      
      // 发送请求创建帖子
      const response = await request({
        method: 'POST',
        url: '/post/create-with-temp',
        data: postData
      });
      
      console.log('发帖响应:', response.data);
      
      if (response.data.code === 200) {
        Alert.alert('发布成功', '帖子已成功发布');
        // 发布成功后跳转到首页
        router.push('/(tabs)/home');
      } else if (response.data.code === 403) {
        // 特殊处理内容审核失败的情况
        Alert.alert('发布被拒绝', response.data.msg || '内容审核未通过，请调整后重试');
      } else {
        throw new Error(response.data.msg || '发布失败');
      }
    } catch (error) {
      console.error('发帖失败:', error);
      Alert.alert('发布失败', error.message || '请检查网络连接后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 打开图片查看模态框
  const openImageViewer = () => {
    pan.setValue(0); // 重置拖动位置
    setShowAllImages(true);
  };

  // 渲染图片预览
  const renderImagePreviews = () => {
    // 只显示前两张图片
    const visibleImages = images.slice(0, 2);
    const remainingCount = images.length - 2;

    return (
      <>
        {visibleImages.map((uri, idx) => (
          <View key={idx} style={styles.imagePreview}>
            <Image source={{ uri }} style={styles.image} />
            <IconButton
              icon="close"
              size={18}
              style={styles.removeImage}
              iconColor={"#fff"}
              onPress={() => {
                // 同时移除本地预览和临时路径
                setImages(images.filter((_, i) => i !== idx));
                setTempImagePaths(tempImagePaths.filter((_, i) => i !== idx));
              }}
            />
          </View>
        ))}
        
        {remainingCount > 0 && (
          <TouchableOpacity 
            style={styles.imagePreview} 
            onPress={openImageViewer}
          >
            <Image 
              source={{ uri: images[2] }} 
              style={[styles.image, { opacity: 0.7 }]} 
            />
            <View style={styles.remainingOverlay}>
              <Text style={styles.remainingText}>+{remainingCount}</Text>
            </View>
          </TouchableOpacity>
        )}
      </>
    );
  };

  // 处理AI配文
  const handleAICaption = async () => {
    if (images.length === 0) {
      Alert.alert('提示', '请先选择一张图片');
      return;
    }
    
    if (!mood.trim()) {
      Alert.alert('提示', '请输入心情描述');
      return;
    }
    
    try {
      setIsAILoading(true);
      
      // 准备第一张图片的FormData
      const formData = new FormData();
      
      // 获取第一张图的信息
      const imageUri = images[0];
      
      // 添加图片
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);
      
      // 添加心情参数
      formData.append('mood', mood);
      
      // 发送请求
      const response = await request({
        method: 'POST',
        url: '/post/ai-caption',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.code === 200) {
        console.log('AI配文成功:', response.data.data);
        // 用AI生成的文案更新内容
        setContent(response.data.data.caption);
        // 关闭对话框
        setShowAIDialog(false);
      } else {
        throw new Error(response.data.msg || 'AI配文生成失败');
      }
    } catch (error) {
      console.error('AI配文失败:', error);
      Alert.alert('生成失败', error.message || '请检查网络连接后重试');
    } finally {
      setIsAILoading(false);
    }
  };
  
  // 打开AI配文对话框
  const openAIDialog = () => {
    if (images.length === 0) {
      Alert.alert('提示', '请先选择一张图片');
      return;
    }
    setShowAIDialog(true);
  };

  // 初始化时处理标签
  useEffect(() => {
    if (initialContent) {
      setFormattedContent(getFormattedContent(initialContent as string));
      setCurrentTags(extractTags(initialContent as string));
    }
  }, [initialContent]);

  return (
    <Surface style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {/* 顶部栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={[styles.headerBtn, { color: theme.colors.primary }]}>取消</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>发贴</Text>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={!content}
          style={[styles.publishBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold', fontSize: 16 }}>发表</Text>
        </Button>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* 内容输入区 */}
        <Card style={[styles.card, { backgroundColor: theme.colors.onSecondary }]}>
          <Card.Content>
            {/* 使用嵌套的普通TextInput和格式化显示View，让用户输入保持原样 */}
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="分享新鲜事..."
                value={content}
                onChangeText={handleContentChange}
                multiline
                numberOfLines={6}
                style={[styles.hiddenInput, { 
                  backgroundColor: theme.colors.onSecondary,
                  color: 'transparent' // 使文字透明
                }]}
                mode="flat"
                placeholderTextColor={theme.colors.outline}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                contentStyle={{ paddingTop: 0, paddingLeft: 0 }}
                cursorColor={theme.colors.primary}
                ref={contentInputRef}
                onSelectionChange={handleSelectionChange}
              />
              
              {/* 格式化显示层，用于高亮标签 */}
              <View style={styles.formattedTextOverlay} pointerEvents="none">
                {content.length === 0 ? (
                  <Text style={{ color: theme.colors.outline, fontSize: 16 }}>
                    分享新鲜事...
                  </Text>
                ) : (
                  formattedContent.map((segment, index) => (
                    <Text
                      key={index}
                      style={[
                        styles.formattedText,
                        segment.isTag && { color: theme.colors.primary }
                      ]}
                    >
                      {segment.text}
                    </Text>
                  ))
                )}
              </View>
            </View>
    
            {/* 显示当前添加的标签 */}
            {currentTags.length > 0 && (
              <View style={styles.currentTagsContainer}>
                {currentTags.map((tag, index) => (
                  <Chip
                    key={index}
                    style={[styles.currentTag, { backgroundColor: theme.colors.primaryContainer }]}
                    textStyle={{ color: theme.colors.primary }}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            )}
            
            {/* 功能Chips */}
            <View style={styles.chipsContainer}>
              <Chip 
                icon="at" 
                onPress={() => console.log('@ 好友')}
                style={styles.chip}
                textStyle={{ color: theme.colors.onSurfaceVariant }}
              >
                好友
              </Chip>
              <Chip 
                icon="tag" 
                onPress={handleAddTag}
                style={styles.chip}
                textStyle={{ color: theme.colors.onSurfaceVariant }}
              >
                添加标签
              </Chip>
              <Chip 
                icon={isLocationLoading ? "progress-clock" : locationName ? "map-marker-check" : "map-marker"} 
                onPress={handleLocationPress}
                style={styles.chip}
                textStyle={{ color: theme.colors.onSurfaceVariant }}
              >
                {isLocationLoading ? '获取中...' : locationName || '添加地点'}
              </Chip>
              <Chip 
                icon="robot" 
                onPress={openAIDialog}
                style={styles.chip}
                textStyle={{ color: theme.colors.onSurfaceVariant }}
              >
                AI配文
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* 图片选择区 */}
        <View style={[styles.card, styles.mediaCard]}>
          <Card.Content>
            <View style={styles.mediaContainer}>
              <TouchableOpacity 
                style={[styles.mediaBtn, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={pickImage}
              >
                <IconButton icon="image" size={40} iconColor={theme.colors.onSurfaceVariant} />
                <Text style={[styles.mediaText, { color: theme.colors.onSurfaceVariant }]}>照片/视频</Text>
              </TouchableOpacity>
              
              {/* 已选图片预览 */}
              {images.length > 0 && renderImagePreviews()}

              {/* 上传进度显示 */}
              {uploadProgress > 0 && (
                <View style={styles.progressContainer}>
                  <Text style={{ marginBottom: 8 }}>上传中: {uploadProgress}%</Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${uploadProgress}%`,
                          backgroundColor: theme.colors.primary 
                        }
                      ]} 
                    />
                  </View>
                </View>
              )}
            </View>
          </Card.Content>
        </View> 
      </ScrollView>

      {/* 图片查看模态框 */}
      <Modal
        visible={showAllImages}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAllImages(false)}
      >
        <View style={styles.modalBackground}>
          <Animated.View 
            style={[
              styles.modalContainer, 
              { 
                backgroundColor: theme.colors.background,
                transform: [{ translateY: pan }] 
              }
            ]}
            {...panResponder.panHandlers}
          >
            {/* 下拉指示器 */}
            <View style={styles.dragIndicator} />
            
            <View style={styles.modalHeader}>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowAllImages(false)}
                iconColor={theme.colors.onBackground}
              />
              <Text style={[styles.modalTitle, { color: theme.colors.onBackground }]}>
                所有图片 ({images.length})
              </Text>
              <View style={{ width: 40 }} />
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.allImagesContainer}>
                {images.map((uri, idx) => (
                  <View key={idx} style={styles.modalImageContainer}>
                    <Image source={{ uri }} style={styles.modalImage} />
                    <IconButton
                      icon="delete"
                      size={20}
                      style={styles.modalRemoveImage}
                      iconColor={theme.colors.onPrimary}
                      onPress={() => {
                        // 同时从两个数组中移除
                        setImages(images.filter((_, i) => i !== idx));
                        setTempImagePaths(tempImagePaths.filter((_, i) => i !== idx));
                        if (images.length <= 1) setShowAllImages(false);
                      }}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
      
      {/* AI配文对话框 */}
      <Portal>
        <Dialog visible={showAIDialog} onDismiss={() => setShowAIDialog(false)}>
          <Dialog.Title>AI配文</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="请描述你的心情"
              value={mood}
              onChangeText={setMood}
              mode="outlined"
              placeholder="例如：今天心情很好、感到放松、充满活力..."
              style={{ marginBottom: 16 }}
            />
            {images.length > 0 && (
              <View style={styles.aiImagePreview}>
                <Image source={{ uri: images[0] }} style={styles.aiImage} />
                {/* <Text style={{ marginTop: 8, color: theme.colors.outline }}>
                  将使用第一张图片生成配文
                </Text> */}
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAIDialog(false)}>取消</Button>
            <Button 
              mode="contained" 
              onPress={handleAICaption}
              loading={isAILoading}
              disabled={isAILoading || !mood.trim()}
            >
              生成
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Surface>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 36,
  },
  scrollContainer: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaCard: {
    minHeight: 180,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 80,
    paddingBottom: 8,
    position: 'relative',
  },
  headerBtn: {
    fontSize: 16,
    zIndex: 1,
    left: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: 0,
  },
  publishBtn: {
    borderRadius: 6,
    minWidth: 56,
    height: 40,
    zIndex: 1,
  },
  inputContainer: {
    position: 'relative',
    minHeight: 170,
  },
  hiddenInput: {
    fontSize: 16,
    padding: 8, 
    paddingTop: 4,
    minHeight: 170,
    textAlignVertical: 'top',
    borderWidth: 0,
    zIndex: 1, // 确保输入在上层
  },
  formattedTextOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    paddingTop: 4,
    zIndex: 0, // 确保在输入下层显示
  },
  formattedText: {
    fontSize: 16,
    lineHeight: 24,
  },
  currentTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  currentTag: {
    marginRight: 8,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  chip: {
    fontSize: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  mediaBtn: {
    width: 120,
    height: 120,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginBottom: 16,
  },
  mediaText: {
    fontSize: 15,
    marginTop: -8,
    fontWeight: '500',
  },
  imagePreview: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeImage: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 2,
  },
  remainingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remainingText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalScrollView: {
    flex: 1,
  },
  allImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  modalImageContainer: {
    position: 'relative',
    width: '48%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalRemoveImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bottomBtnText: {
    fontSize: 14,
  },
  aiImagePreview: {
    alignItems: 'center',
    marginTop: 16,
  },
  aiImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  progressContainer: {
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
