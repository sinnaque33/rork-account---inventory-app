import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Package, ShoppingCart, Save, FileText } from 'lucide-react-native';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { api, KoliDetailItem } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import colors from '@/constants/colors';

export default function KoliDetayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { credentials } = useAuth();
  const [showBarcodeInput, setShowBarcodeInput] = useState(false);
  const [barcodeType, setBarcodeType] = useState<'order' | 'item' | null>(null);
  const [barcodeValue, setBarcodeValue] = useState('');

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

  const renderItem = ({ item }: { item: KoliDetailItem }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Package size={24} color={colors.button.primary} />
        </View>
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
            setBarcodeType('order');
            setShowBarcodeInput(true);
          }}
        >
          <ShoppingCart size={20} color="#000" />
          <Text style={styles.buttonText}>Add by{"\n"}Order Receipt</Text>
        </TouchableOpacity>
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
        <TouchableOpacity style={styles.actionButton}>
          <FileText size={20} color="#000" />
          <Text style={styles.buttonText}>Create{"\n"}Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton}>
          <Save size={20} color="#000" />
          <Text style={styles.buttonText}>Save</Text>
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
              {barcodeType === 'order' ? 'Order Receipt Barcode' : 'Item Barcode'}
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
                style={styles.modalSubmitButton}
                onPress={() => {
                  console.log(`${barcodeType === 'order' ? 'Order' : 'Item'} barcode:`, barcodeValue);
                  setShowBarcodeInput(false);
                  setBarcodeValue('');
                  setBarcodeType(null);
                }}
              >
                <Text style={styles.modalSubmitText}>Submit</Text>
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
  saveButton: {
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
});
