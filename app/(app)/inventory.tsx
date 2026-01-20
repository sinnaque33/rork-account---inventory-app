import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Package, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api, InventoryItem } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function InventoryScreen() {
  const { credentials } = useAuth();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [allItems, setAllItems] = useState<InventoryItem[]>([]);
  const ITEMS_PER_PAGE = 20 as const;

  const inventoryQuery = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      console.log('InventoryScreen: Fetching inventory');
      if (!credentials) {
        throw new Error('No credentials available');
      }
      const items = await api.inventory.getList(credentials.userCode, credentials.password);
      setAllItems(items);
      setPage(1);
      return items;
    },
    enabled: !!credentials,
  });

  const onRefresh = async () => {
    console.log('InventoryScreen: Manual refresh triggered');
    setRefreshing(true);
    const result = await inventoryQuery.refetch();
    if (result.data) {
      setAllItems(result.data);
      setPage(1);
    }
    setRefreshing(false);
  };

  const filteredItems = useMemo(() => {
    const items = allItems || [];
    if (!searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        (item.InventoryName?.toLowerCase() || '').includes(query) ||
        (item.InventoryCode?.toLowerCase() || '').includes(query)
    );
  }, [allItems, searchQuery]);

  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, page * ITEMS_PER_PAGE);
  }, [filteredItems, page]);

  const loadMore = () => {
    if (displayedItems.length < filteredItems.length) {
      console.log('InventoryScreen: Loading more items');
      setPage(prev => prev + 1);
    }
  };



  if (inventoryQuery.isLoading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  if (inventoryQuery.isError) {
    return (
      <View style={styles.centerContainer}>
        <AlertCircle size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Error Loading Inventory</Text>
        <Text style={styles.errorText}>
          {inventoryQuery.error instanceof Error
            ? inventoryQuery.error.message
            : 'An error occurred'}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {item.Thumbnail ? (
          <Image
            source={{ uri: item.Thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.iconContainer}>
            <Package size={32} color="#3b82f6" />
          </View>
        )}
        <View style={styles.itemInfo}>
          <Text style={styles.itemCode}>{item.InventoryCode || '-'}</Text>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.InventoryName || '-'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (displayedItems.length >= filteredItems.length) {
      return null;
    }
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or code"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-input"
          />
        </View>
      </View>

      <FlatList
        data={displayedItems}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.InventoryCode}-${index}`}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No items match your search' : 'No inventory items found'}
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
    backgroundColor: '#f8fafc',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    gap: 12,
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1e293b',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#64748b',
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
    color: '#64748b',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    gap: 6,
  },
  itemCode: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#3b82f6',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1e293b',
    lineHeight: 22,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
