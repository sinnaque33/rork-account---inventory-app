import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { X, Flashlight, FlashlightOff } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import colors from '@/constants/colors';

export default function BarcodeScannerScreen() {
  const router = useRouter();
  const { credentials } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState<boolean>(false);
  const [torch, setTorch] = useState<boolean>(false);

  const barcodeMutation = useMutation({
    mutationFn: async (barcode: string) => {
      if (!credentials) {
        throw new Error('No credentials available');
      }
      console.log('BarcodeScannerScreen: Calling getKoliDetailByBarcode with barcode:', barcode);
      
      // First get the RecId from koliDetayWithBarcode
      const barcodeResult = await api.koliListesi.getKoliDetailByBarcode(
        credentials.userCode,
        credentials.password,
        barcode
      );
      
      console.log('BarcodeScannerScreen: koliDetayWithBarcode result:', barcodeResult);
      
      // Check for error 99
      if (barcodeResult.err === 99) {
        return { err: 99, msg: barcodeResult.msg, recId: 0 };
      }
      
      if (!barcodeResult.recId) {
        throw new Error('Koli not found for this barcode');
      }
      
      // Now fetch the full koli detail using the RecId
      console.log('BarcodeScannerScreen: Fetching koliDetay with RecId:', barcodeResult.recId);
      const koliDetail = await api.koliListesi.getDetail(
        credentials.userCode,
        credentials.password,
        barcodeResult.recId
      );
      
      console.log('BarcodeScannerScreen: koliDetay result:', koliDetail);
      
      return { recId: barcodeResult.recId, items: koliDetail };
    },
    onSuccess: (data) => {
      console.log('BarcodeScannerScreen: Received koli detail:', data);
      if (data.err === 99) {
        console.log('BarcodeScannerScreen: Error 99 received, showing message:', data.msg);
        Alert.alert('Error', data.msg || 'An error occurred');
        setScanned(false);
        return;
      }
      if (data.recId) {
        router.replace(`/(app)/koli-detay?id=${data.recId}` as any);
      } else {
        Alert.alert('Error', 'Koli not found for this barcode');
        setScanned(false);
      }
    },
    onError: (error: Error) => {
      console.error('BarcodeScannerScreen: Error fetching koli detail:', error);
      Alert.alert('Error', error.message || 'Failed to fetch koli details');
      setScanned(false);
    },
  });

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanned || barcodeMutation.isPending) return;
    
    console.log('BarcodeScannerScreen: Barcode scanned:', result.data, 'Type:', result.type);
    setScanned(true);
    barcodeMutation.mutate(result.data);
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.button.primary} />
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          We need camera access to scan barcodes
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionTitle}>Barcode Scanner</Text>
        <Text style={styles.permissionText}>
          Barcode scanning works best on mobile devices. Please use the mobile app via QR code.
        </Text>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39', 'code93', 'upc_a', 'upc_e', 'codabar', 'itf14', 'datamatrix', 'aztec', 'pdf417'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
            testID="close-scanner-button"
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Barkod</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setTorch(!torch)}
            testID="torch-button"
          >
            {torch ? (
              <FlashlightOff size={24} color="#fff" />
            ) : (
              <Flashlight size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        <View style={styles.footer}>
          {barcodeMutation.isPending ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.footerText}>Koli aranıyor...</Text>
            </View>
          ) : (
            <Text style={styles.footerText}>
              Position the barcode within the frame
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
  },
  scanArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.button.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  footer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.dark,
    padding: 24,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 8,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text.primary,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionButton: {
    backgroundColor: colors.button.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
});
