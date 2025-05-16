import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from "react-native";
import { Text, Card } from "react-native-paper";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { useTheme } from "../src/theme/ThemeContext";

const sponsorTiers = [
  { price: 2.88, label: "小额支持", desc: "请作者喝一杯柠檬水" },
  { price: 5.88, label: "进阶支持", desc: "请作者吃一顿拼好饭" },
  { price: 9.88, label: "超级支持", desc: "请作者喝一杯奶茶" },
];

// 支付宝收款二维码图片链接
// const alipayQRCodes = [
//   require("../src/assets/sponsor/sponsor2.88.jpg"),
//   require("../src/assets/sponsor/sponsor5.88.jpg"),
//   require("../src/assets/sponsor/sponsor9.88.jpg"),
// ];

// 支付宝收款二维码图片链接
const alipayQRCodes = [
  "https://sunote.s3.cn-south-1.jdcloud-oss.com/sponsor/sponsor2.88.jpg",
  "https://sunote.s3.cn-south-1.jdcloud-oss.com/sponsor/sponsor5.88.jpg",
  "https://sunote.s3.cn-south-1.jdcloud-oss.com/sponsor/sponsor9.88.jpg",
];

export default function SponsorScreen() {
  

  // 获取主题
  const theme = useTheme();
  // 支付宝二维码弹窗
  const [modalVisible, setModalVisible] = useState(false);
  const [currentQR, setCurrentQR] = useState(0);

  const handleSponsor = (idx: number) => {
    setCurrentQR(idx);
    setModalVisible(true);
  };
  // 长按保存图片
  const handleLongPress = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("权限不足", "请在设置中允许访问相册权限");
        return;
      }

      let localUri: string | null = null;
      const qr = alipayQRCodes[currentQR];

      if (typeof qr === "string" && qr.startsWith("http")) {
        // 网络图片，先下载
        const downloadResumable = FileSystem.createDownloadResumable(
          qr,
          FileSystem.cacheDirectory + "qr.jpg"
        );
        const downloadResult = await downloadResumable.downloadAsync();
        if (downloadResult && downloadResult.uri) {
          localUri = downloadResult.uri;
        } else {
          Alert.alert("保存失败", "图片下载失败");
          return;
        }
      } else if (typeof qr === "number") {
        // require 图片
        const asset = await Asset.fromModule(qr).downloadAsync();
        localUri = asset.localUri || asset.uri;
      }

      if (!localUri) {
        Alert.alert("保存失败", "未能获取图片本地路径");
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(localUri);
      await MediaLibrary.createAlbumAsync("Download", asset, false);
      Alert.alert("保存成功", "二维码已保存到相册");
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    MediaLibrary.requestPermissionsAsync();
  }, []);
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={styles.title}>赞助作者</Text>
      <Text style={styles.tip}>sunote可能会倒闭，但永远不会变质</Text>
      {sponsorTiers.map((tier, idx) => (
        <Card key={tier.price} style={styles.card}>
          <Card.Content>
            <Text style={styles.price}>¥{tier.price}</Text>
            <Text style={styles.label}>{tier.label}</Text>
            <Text style={styles.desc}>{tier.desc}</Text>
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => handleSponsor(idx)}
            >
              <Text style={styles.payBtnText}>支付宝支付</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      ))}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10,color:theme.colors.inverseOnSurface }}
            >
              请用支付宝扫码支付
            </Text>
            <TouchableOpacity
              activeOpacity={1}
              onLongPress={handleLongPress}
              delayLongPress={400}
            >
              <Image
                source={
                  typeof alipayQRCodes[currentQR] === "string"
                    ? { uri: alipayQRCodes[currentQR] }
                    : alipayQRCodes[currentQR]
                }
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 12,
                  marginBottom: 10,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={{ color: "#888", fontSize: 13, marginBottom: 10 }}>
              长按二维码可保存到相册
            </Text>
            <TouchableOpacity
              style={[styles.payBtn, { marginTop: 0,width:200 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.payBtnText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  tip: { fontSize: 14, color: "#888", marginBottom: 20, textAlign: "center" },
  card: { marginBottom: 18, borderRadius: 12, elevation: 2 },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#E85C8A",
    marginBottom: 6,
  },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 2 },
  desc: { fontSize: 13, color: "#666", marginBottom: 10 },
  payBtn: {
    backgroundColor: "#E85C8A",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 6,
  },
  payBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
});
