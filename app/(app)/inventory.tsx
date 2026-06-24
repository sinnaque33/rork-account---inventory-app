import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { Theme } from '@/constants/theme';
import { InventoryItem } from '@/services/types';

export default function InventoryScreen() {
  const { t } = useTranslation();
  const { credentials } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [allItems, setAllItems] = useState<InventoryItem[]>([]);
  const ITEMS_PER_PAGE = 20 as const;

  const inventoryQuery = useQuery({
    queryKey: ['inventory', credentials],
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
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t('inventory.loading')}</Text>
      </View>
    );
  }

  if (inventoryQuery.isError) {
    return (
      <View style={styles.centerContainer}>
        <AlertCircle size={48} color={theme.colors.error} />
        <Text style={styles.errorTitle}>{t('inventory.errorTitle')}</Text>
        <Text style={styles.errorText}>
          {inventoryQuery.error instanceof Error
            ? inventoryQuery.error.message
            : t('inventory.defaultError')}
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
            <Package size={32} color={theme.colors.primary} />
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
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={theme.colors.inkSubtle} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('inventory.searchPlaceholder')}
            placeholderTextColor={theme.colors.inkSubtle}
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={48} color={theme.colors.inkTertiary} />
            <Text style={styles.emptyText}>
              {searchQuery ? t('inventory.emptySearch') : t('inventory.emptyList')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const makeStyles = (theme: Theme) => {
  const { colors, spacing, radius, type } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    searchContainer: {
      backgroundColor: colors.canvas,
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.hairline,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface2,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    searchInput: {
      ...type.body,
      flex: 1,
      paddingVertical: spacing.sm,
      color: colors.ink,
    },
    content: {
      padding: spacing.md,
    },
    centerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.canvas,
      gap: spacing.sm,
      padding: spacing.xl,
    },
    loadingText: {
      ...type.body,
      color: colors.inkMuted,
      marginTop: spacing.xs,
    },
    errorTitle: {
      ...type.cardTitle,
      color: colors.ink,
      marginTop: spacing.xs,
    },
    errorText: {
      ...type.bodySm,
      color: colors.inkMuted,
      textAlign: 'center',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxxl,
      gap: spacing.sm,
    },
    emptyText: {
      ...type.body,
      color: colors.inkMuted,
      textAlign: 'center',
    },
    card: {
      backgroundColor: colors.surface1,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.hairline,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    thumbnail: {
      width: 80,
      height: 80,
      borderRadius: radius.md,
      backgroundColor: colors.surface2,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: radius.md,
      backgroundColor: colors.primaryTint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemInfo: {
      flex: 1,
      gap: spacing.xxs,
    },
    itemCode: {
      ...type.mono,
      color: colors.primary,
    },
    itemName: {
      ...type.cardTitle,
      color: colors.ink,
    },
    footerLoader: {
      paddingVertical: spacing.lg,
      alignItems: 'center',
    },
  });
};