import React from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { Text, Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { useTheme } from "../theme/ThemeContext";

interface AvatarPreviewProps {
  visible: boolean;
  imageUri: string | null;
  defaultImage: any;
  onClose: () => void;
  onAvatarChange: (uri: string) => void;
}

const AvatarPreview: React.FC<AvatarPreviewProps> = ({
  visible,
  imageUri,
  defaultImage,
  onClose,
  onAvatarChange,
}) => {
  const theme = useTheme();

  console.log("图片URI类型:", typeof imageUri);
  console.log("图片URI:", imageUri);
  console.log("图片URI是否为null:", imageUri === null);
  console.log("图片URI长度:", imageUri?.length);
  console.log("默认图片:", defaultImage);

  // 保存头像到相册
  const saveAvatar = async () => {
    try {
      // 请求权限
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("需要权限", "保存头像需要访问相册权限");
        return;
      }

      // 确定要保存的URI
      let uriToSave = imageUri;
      if (!uriToSave) {
        // 如果没有imageUri，使用默认头像
        const asset = Image.resolveAssetSource(defaultImage);
        if (asset && asset.uri) {
          // 如果是本地资源，可能需要先复制到临时目录
          const tempUri = FileSystem.cacheDirectory + "temp_avatar.jpg";
          await FileSystem.copyAsync({
            from: asset.uri,
            to: tempUri,
          });
          uriToSave = tempUri;
        } else {
          Alert.alert("保存失败", "无法获取头像图片");
          return;
        }
      }

      const asset = await MediaLibrary.createAssetAsync(uriToSave);
      await MediaLibrary.createAlbumAsync("头像", asset, false);
      Alert.alert("保存成功", "头像已保存到相册");
    } catch (error) {
      console.error("保存头像失败:", error);
      Alert.alert("保存失败", "保存头像时发生错误");
    }
  };

  // 从图库选择新头像
  const pickImage = async () => {
    try {
      // 请求权限
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("需要权限", "选择头像需要访问相册权限");
        return;
      }

      // 启动图片选择器
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        // 复制到应用缓存目录
        const newAvatarUri = FileSystem.cacheDirectory + "new_avatar.jpg";
        await FileSystem.copyAsync({
          from: selectedAsset.uri,
          to: newAvatarUri,
        });

        // 回调通知父组件头像已更改
        onAvatarChange(newAvatarUri);

        // 可选：关闭预览
        // onClose();
      }
    } catch (error) {
      console.error("选择头像失败:", error);
      Alert.alert("选择失败", "选择头像时发生错误");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.header}>
            <Text
              variant="titleLarge"
              style={{ color: theme.colors.onSurface }}
            >
              头像预览
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={{ color: theme.colors.primary }}>关闭</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={imageUri ? { uri: imageUri } : defaultImage}
              style={[
                styles.avatarImage,
                { borderWidth: 2, borderColor: "red" },
              ]}
              resizeMode="cover"
              onError={(e) => {
                console.log("图片加载错误:", e.nativeEvent.error);
                console.log("尝试加载的图片URI:", imageUri);
                console.log("默认图片:", defaultImage);
                // 如果加载失败，尝试使用默认图片
                if (imageUri) {
                  Alert.alert(
                    "图片加载失败",
                    "无法加载所选图片，将使用默认头像",
                    [
                      {
                        text: "确定",
                        onPress: () => onAvatarChange(""),
                      },
                    ]
                  );
                }
              }}
              onLoad={() => {
                console.log("图片加载成功");
                console.log("成功加载的图片URI:", imageUri);
              }}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={saveAvatar}
              style={[styles.button, { borderColor: theme.colors.primary }]}
              icon="content-save"
            >
              保存到相册
            </Button>
            <Button
              mode="contained"
              onPress={pickImage}
              style={styles.button}
              icon="image-edit"
            >
              更换头像
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatarImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default AvatarPreview;
