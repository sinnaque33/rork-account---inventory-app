import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Package, FileText } from 'lucide-react-native';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { api, KoliDetailItem } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import colors from '@/constants/colors';

function byteArrayToBase64(byteArray: number[] | Uint8Array | string | null | undefined): string | null {
  if (!byteArray) return null;
  
  // If it's already a string (base64), return it
  if (typeof byteArray === 'string') {
    return byteArray.trim().length > 0 ? byteArray : null;
  }
  
  // If it's an array or Uint8Array, convert to base64
  if (Array.isArray(byteArray) || byteArray instanceof Uint8Array) {
    try {
      const bytes = Array.isArray(byteArray) ? new Uint8Array(byteArray) : byteArray;
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (e) {
      console.log('byteArrayToBase64: Error converting byte array', e);
      return null;
    }
  }
  
  return null;
}

export default function KoliDetayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { credentials } = useAuth();
  const router = useRouter();

  const queryClient = useQueryClient();
  const [showBarcodeInput, setShowBarcodeInput] = useState(false);
  const [, setBarcodeType] = useState<'item' | null>(null);
  const [barcodeValue, setBarcodeValue] = useState('');
  const [showReceiptConfirm, setShowReceiptConfirm] = useState(false);

  const createReceiptMutation = useMutation({
    mutationFn: async () => {
      if (!credentials || !id) {
        throw new Error('No credentials or id available');
      }
      console.log('KoliDetayScreen: Creating receipt for box', id);
      return api.koliListesi.createReceipt(
        credentials.userCode,
        credentials.password,
        parseInt(id, 10)
      );
    },
    onSuccess: (data) => {
      console.log('KoliDetayScreen: Create receipt success', data);
      Alert.alert('Result', data.msg || 'Operation completed', [
        {
          text: 'OK',
          onPress: () => {
            if (data.resultBoxId) {
              router.replace(`/koli-detay?id=${data.resultBoxId}`);
            } else {
              queryClient.invalidateQueries({ queryKey: ['koli-detay', id] });
            }
          }
        }
      ]);
    },
    onError: (error) => {
      console.error('KoliDetayScreen: Create receipt error', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create receipt');
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (barcode: string) => {
      if (!credentials || !id) {
        throw new Error('No credentials or id available');
      }
      console.log('KoliDetayScreen: Adding item by barcode', barcode, 'to box', id);
      return api.koliListesi.addItemByBarcode(
        credentials.userCode,
        credentials.password,
        parseInt(id, 10),
        barcode
      );
    },
    onSuccess: (data) => {
      console.log('KoliDetayScreen: Add item success', data);
      Alert.alert('Result', data.msg || 'Operation completed');
      setShowBarcodeInput(false);
      setBarcodeValue('');
      setBarcodeType(null);
      queryClient.invalidateQueries({ queryKey: ['koli-detay', id] });
    },
    onError: (error) => {
      console.error('KoliDetayScreen: Add item error', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add item');
    },
  });

  const koliDetailQuery = useQuery({
    queryKey: ['koli-detay', id, credentials],
    queryFn: async () => {
      console.log('KoliDetayScreen: Fetching koli detail for id', id);
      if (!credentials || !id) {
        throw new Error('No credentials or id available');
      }
      return api.koliListesi.getDetail(credentials.userCode, credentials.password, parseInt(id, 10));
    },
    enabled: !!credentials && !!id,
  });

  if (koliDetailQuery.isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Koli Details' }} />
        <ActivityIndicator size="large" color={colors.button.primary} />
        <Text style={styles.loadingText}>Loading koli details...</Text>
      </View>
    );
  }

  if (koliDetailQuery.isError) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Koli Details' }} />
        <AlertCircle size={48} color={colors.border.error} />
        <Text style={styles.errorTitle}>Error Loading Koli Details</Text>
        <Text style={styles.errorText}>
          {koliDetailQuery.error instanceof Error
            ? koliDetailQuery.error.message
            : 'An error occurred'}
        </Text>
      </View>
    );
  }

  const items = koliDetailQuery.data || [];

  const renderItem = ({ item }: { item: KoliDetailItem }) => {
    const base64Thumbnail = byteArrayToBase64(item.Thumbnail as unknown as number[] | Uint8Array | string | null);
    const hasValidThumbnail = !!base64Thumbnail;
    
    console.log('KoliDetayScreen: Item thumbnail check', { 
      itemName: item.InventoryName, 
      hasThumbnail: !!item.Thumbnail,
      thumbnailType: typeof item.Thumbnail,
      isArray: Array.isArray(item.Thumbnail),
      hasValidThumbnail 
    });
    
    return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        {hasValidThumbnail ? (
          <Image 
            source={{ uri: `data:image/png;base64,${base64Thumbnail}` }}
            style={styles.thumbnailImage}
            resizeMode="cover"
            onError={(e) => console.log('KoliDetayScreen: Image load error', e.nativeEvent.error)}
          />
        ) : (
          <View style={styles.iconContainer}>
            <Package size={24} color={colors.button.primary} />
          </View>
        )}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.InventoryName}</Text>
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity: </Text>
            <Text style={styles.quantityValue}>{item.Quantity}</Text>
          </View>
        </View>
      </View>
    </View>
  );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Koli #${id}` }} />
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.InventoryName}-${index}`}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={48} color={colors.text.secondary} />
            <Text style={styles.emptyText}>No items found in this koli</Text>
          </View>
        }
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            setBarcodeType('item');
            setShowBarcodeInput(true);
          }}
        >
          <Package size={20} color="#000" />
          <Text style={styles.buttonText}>Add by{"\n"}Item Barcode</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, createReceiptMutation.isPending && styles.disabledButton]}
          onPress={() => setShowReceiptConfirm(true)}
          disabled={createReceiptMutation.isPending}
        >
          {createReceiptMutation.isPending ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <FileText size={20} color="#000" />
          )}
          <Text style={styles.buttonText}>Create{"\n"}Receipt</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showBarcodeInput}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowBarcodeInput(false);
          setBarcodeValue('');
          setBarcodeType(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Item Barcode
            </Text>
            <Text style={styles.modalSubtitle}>
              Enter or scan barcode
            </Text>
            <TextInput
              style={styles.barcodeInput}
              placeholder="Enter barcode"
              placeholderTextColor={colors.text.secondary}
              value={barcodeValue}
              onChangeText={setBarcodeValue}
              autoFocus
              keyboardType="default"
              returnKeyType="done"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowBarcodeInput(false);
                  setBarcodeValue('');
                  setBarcodeType(null);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalSubmitButton, addItemMutation.isPending && styles.disabledButton]}
                onPress={() => {
                  if (barcodeValue.trim()) {
                    addItemMutation.mutate(barcodeValue.trim());
                  } else {
                    Alert.alert('Error', 'Please enter a barcode');
                  }
                }}
                disabled={addItemMutation.isPending}
              >
                {addItemMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showReceiptConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReceiptConfirm(false)}
      >
        <View style={styles.receiptModalOverlay}>
          <View style={styles.receiptModalContent}>
            <View style={styles.receiptIconContainer}>
              <FileText size={48} color="#DC143C" />
            </View>
            <Text style={styles.receiptModalTitle}>Create Receipt</Text>
            <Text style={styles.receiptModalSubtitle}>
              Are you sure you want to create a receipt for this koli?
            </Text>
            <View style={styles.receiptModalButtons}>
              <TouchableOpacity 
                style={styles.receiptCancelButton}
                onPress={() => setShowReceiptConfirm(false)}
              >
                <Text style={styles.receiptCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.receiptConfirmButton, createReceiptMutation.isPending && styles.disabledButton]}
                onPress={() => {
                  setShowReceiptConfirm(false);
                  createReceiptMutation.mutate();
                }}
                disabled={createReceiptMutation.isPending}
              >
                {createReceiptMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.receiptConfirmText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.dark,
    gap: 12,
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(220, 20, 60, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.background.dark,
  },
  itemInfo: {
    flex: 1,
    gap: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.primary,
    lineHeight: 22,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.button.primary,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    gap: 12,
    backgroundColor: colors.background.dark,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: colors.border.default,
  },

  buttonText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#000',
    textAlign: 'center',
    lineHeight: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text.primary,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  barcodeInput: {
    backgroundColor: colors.background.dark,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: colors.background.dark,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: colors.button.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.6,
  },
  receiptModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  receiptModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DC143C',
  },
  receiptIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(220, 20, 60, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  receiptModalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  receiptModalSubtitle: {
    fontSize: 15,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  receiptModalButtons: {
    flexDirection: 'row' as const,
    gap: 12,
    width: '100%',
  },
  receiptCancelButton: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#444',
  },
  receiptCancelText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  receiptConfirmButton: {
    flex: 1,
    backgroundColor: '#DC143C',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center' as const,
  },
  receiptConfirmText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
