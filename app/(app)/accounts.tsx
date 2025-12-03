import { useQuery } from '@tanstack/react-query';
import { FlatList, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, CurrentAccount } from '@/services/api';
import { AlertCircle, Building2 } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import colors from '@/constants/colors';

export default function AccountsScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  const accountsQuery = useQuery({
    queryKey: ['accounts', user?.userName, user?.password],
    queryFn: async () => {
      if (!user?.userName || !user?.password) {
        throw new Error('User credentials not available');
      }
      console.log('AccountsScreen: Fetching accounts');
      return api.accounts.getList(user.userName, user.password);
    },
    enabled: !!user?.userName && !!user?.password,
  });

  const { refetch } = accountsQuery;

  const onRefresh = useCallback(async () => {
    console.log('AccountsScreen: Manual refresh triggered');
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = useCallback(({ item }: { item: CurrentAccount }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Building2 size={24} color={colors.button.primary} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.accountName}>{item.CurrentAccountName}</Text>
          <Text style={styles.accountCode}>{item.CurrentAccountCode}</Text>
        </View>
      </View>
    </View>
  ), []);

  const renderFooter = () => {
    if (!accountsQuery.isFetching || refreshing) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.button.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (accountsQuery.isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.button.primary} />
          <Text style={styles.loadingText}>Loading accounts...</Text>
        </View>
      );
    }

    if (accountsQuery.isError) {
      return (
        <View style={styles.centerContainer}>
          <AlertCircle size={48} color={colors.border.error} />
          <Text style={styles.errorTitle}>Error Loading Accounts</Text>
          <Text style={styles.errorText}>
            {accountsQuery.error instanceof Error
              ? accountsQuery.error.message
              : 'An error occurred'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No accounts found</Text>
      </View>
    );
  };

  const accounts = accountsQuery.data || [];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <FlatList
        data={accounts}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.CurrentAccountCode}-${index}`}
        contentContainerStyle={[
          styles.listContent,
          accounts.length === 0 && styles.emptyListContent,
        ]}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 12,
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
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
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
  cardContent: {
    flex: 1,
    gap: 4,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.primary,
    lineHeight: 22,
  },
  accountCode: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
