import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Package, Search, Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api, KoliItem } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import colors from '@/constants/colors';

export default function KoliListesiScreen() {
  const router = useRouter();
  const { credentials } = useAuth();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [allItems, setAllItems] = useState<KoliItem[]>([]);
  const ITEMS_PER_PAGE = 20 as const;

  const koliQuery = useQuery({
    queryKey: ['koli-listesi', credentials?.userCode, credentials?.password],
    queryFn: async () => {
      console.log('KoliListesiScreen: Fetching koli listesi');
      if (!credentials) {
        throw new Error('No credentials available');
      }
      const items = await api.koliListesi.getList(credentials.userCode, credentials.password);
      setAllItems(items);
      setPage(1);
      return items;
    },
    enabled: !!credentials,
  });

  const onRefresh = async () => {
    console.log('KoliListesiScreen: Manual refresh triggered');
    setRefreshing(true);
    const result = await koliQuery.refetch();
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
        (item.PackageNo && item.PackageNo.toLowerCase().includes(query)) ||
        (item.Explanation && item.Explanation.toLowerCase().includes(query))
    );
  }, [allItems, searchQuery]);

  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, page * ITEMS_PER_PAGE);
  }, [filteredItems, page]);

  const loadMore = () => {
    if (displayedItems.length < filteredItems.length) {
      console.log('KoliListesiScreen: Loading more items');
      setPage(prev => prev + 1);
    }
  };

  if (koliQuery.isLoading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.button.primary} />
        <Text style={styles.loadingText}>Loading koli listesi...</Text>
      </View>
    );
  }

  if (koliQuery.isError) {
    return (
      <View style={styles.centerContainer}>
        <AlertCircle size={48} color={colors.border.error} />
        <Text style={styles.errorTitle}>Error Loading Koli Listesi</Text>
        <Text style={styles.errorText}>
          {koliQuery.error instanceof Error
            ? koliQuery.error.message
            : 'An error occurred'}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: KoliItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Package size={24} color={colors.button.primary} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.packageNo}>{item.PackageNo}</Text>
          {item.Explanation ? (
            <Text style={styles.explanation}>{item.Explanation}</Text>
          ) : null}
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
        <ActivityIndicator size="small" color={colors.button.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search packages"
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-input"
          />
        </View>
      </View>

      <FlatList
        data={displayedItems}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.PackageNo}-${index}`}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.button.primary]} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={48} color={colors.text.secondary} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No items match your search' : 'No koli items found'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(app)/create-koli')}
        activeOpacity={0.8}
        testID="create-koli-button"
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>
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
  packageNo: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.primary,
    lineHeight: 22,
  },
  explanation: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.button.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
