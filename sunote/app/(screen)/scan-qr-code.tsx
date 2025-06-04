import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { IconButton } from 'react-native-paper';

export default function ScanQRCode() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [checkedPermission, setCheckedPermission] = useState(false); // 控制渲染时机
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    const checkAndRequestPermission = async () => {
      if (!permission?.granted) {
        const response = await requestPermission();
        if (!response.granted) {
          router.back(); // 返回上一页
        } else {
          setCheckedPermission(true);
        }
      } else {
        setCheckedPermission(true);
      }
    };

    checkAndRequestPermission();
  }, [permission]);

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (scanned) return;

    setScanned(true);
    alert(`扫描到二维码: ${data}`);

    setTimeout(() => {
      setScanned(false);
    }, 2000);
  };

  // 如果权限尚未处理完成，不渲染 Camera
  if (!checkedPermission) {
    return <View style={styles.container}><Text style={styles.hint}>请求相机权限中...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'code128', 'code39'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          <Text style={styles.hint}>将二维码放入框内即可自动扫描</Text>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <IconButton icon="close" iconColor="white" size={30} />
        </TouchableOpacity>

        {scanned && (
          <View style={styles.scanAgainContainer}>
            <Button
              title="点击再次扫描"
              onPress={() => setScanned(false)}
              color={theme.colors.primary}
            />
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  hint: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  scanAgainContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
