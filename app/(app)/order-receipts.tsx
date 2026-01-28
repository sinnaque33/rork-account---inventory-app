import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, FileText, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { api, OrderReceipt } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import colors from '@/constants/colors';

export default function OrderReceiptsScreen() {
  const router = useRouter();
  const { credentials } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const orderReceiptsQuery = useQuery({
    queryKey: ['order-receipts', credentials],
    queryFn: async () => {
      console.log('OrderReceiptsScreen: Fetching order receipts');
      if (!credentials) {
        throw new Error('No credentials available');
      }
      return api.koliListesi.getOrderReceipts(credentials.userCode, credentials.password);
    },
    enabled: !!credentials,
  });

  const createKoliMutation = useMutation({
    mutationFn: async (orderReceiptId: number) => {
      if (!credentials) {
        throw new Error('No credentials available');
      }
      return api.koliListesi.createKoliFromOrderReceipt(
        credentials.userCode,
        credentials.password,
        orderReceiptId
      );
    },
    onSuccess: (data) => {
      console.log('OrderReceiptsScreen: Koli created successfully', data);
      Alert.alert('Result', data.msg || 'Operation completed');
      queryClient.invalidateQueries({ queryKey: ['koli-listesi'] });
      
      if (data.resultBoxId) {
        console.log('OrderReceiptsScreen: Navigating to koli detail with resultBoxId:', data.resultBoxId);
        router.replace({
          pathname: '/(app)/koli-detay',
          params: { id: data.resultBoxId.toString() }
        });
      } else {
        console.log('OrderReceiptsScreen: No resultBoxId returned, going back');
        router.back();
      }
    },
    onError: (error) => {
      console.error('OrderReceiptsScreen: Failed to create koli', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create koli');
    },
  });

  const handleReceiptSelect = (item: OrderReceipt) => {
    console.log('OrderReceiptsScreen: Receipt selected', item.RecId);
    createKoliMutation.mutate(item.RecId);
  };

  const onRefresh = async () => {
    console.log('OrderReceiptsScreen: Manual refresh triggered');
    setRefreshing(true);
    await orderReceiptsQuery.refetch();
    setRefreshing(false);
  };

  const filteredItems = useMemo(() => {
    const items = orderReceiptsQuery.data || [];
    if (!searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        (item.ReceiptNo?.toLowerCase().includes(query)) ||
        (item.CurrentAccountName?.toLowerCase().includes(query)) ||
        (item.RecId?.toString().includes(query))
    );
  }, [orderReceiptsQuery.data, searchQuery]);

  if (orderReceiptsQuery.isLoading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Order Receipts' }} />
        <ActivityIndicator size="large" color={colors.button.primary} />
        <Text style={styles.loadingText}>Siparişler yükleniyor...</Text>
      </View>
    );
  }

  if (orderReceiptsQuery.isError) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Order Receipts' }} />
        <AlertCircle size={48} color={colors.border.error} />
        <Text style={styles.errorTitle}>Sipariş Yükleme hatası</Text>
        <Text style={styles.errorText}>
          {orderReceiptsQuery.error instanceof Error
            ? orderReceiptsQuery.error.message
            : 'An error occurred'}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: OrderReceipt }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => handleReceiptSelect(item)}
      disabled={createKoliMutation.isPending}
      testID={`order-receipt-${item.RecId}`}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <FileText size={24} color={colors.button.primary} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.receiptNo}>{item.ReceiptNo}</Text>
          <Text style={styles.accountName}>{item.CurrentAccountName}</Text>
          <Text style={styles.recId}>ID: {item.RecId}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Order Receipts' }} />
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search receipts"
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-input"
          />
        </View>
      </View>

      {createKoliMutation.isPending && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.button.primary} />
          <Text style={styles.loadingOverlayText}>Koli oluşturuluyor...</Text>
        </View>
      )}

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.RecId}-${index}`}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.button.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FileText size={48} color={colors.text.secondary} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No receipts match your search' : 'No order receipts found'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  searchContainer: {
    backgroundColor: colors.background.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.darker,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text.primary,
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
  cardHeader: {
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
    gap: 4,
  },
  receiptNo: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.primary,
    lineHeight: 22,
  },
  accountName: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  recId: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingOverlayText: {
    fontSize: 16,
    color: colors.text.primary,
    marginTop: 12,
  },
});
