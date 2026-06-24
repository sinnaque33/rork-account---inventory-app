import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/services/api";
import { AlertCircle, Building2 } from "lucide-react-native";
import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { Theme } from "@/constants/theme";
import { CurrentAccount } from "@/services/types";

export default function AccountsScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  const accountsQuery = useQuery({
    queryKey: ["accounts", user?.userName, user?.password],
    queryFn: async () => {
      if (!user?.userName || !user?.password) {
        throw new Error(t("accounts.credentialsMissing"));
      }
      console.log("AccountsScreen: Fetching accounts");
      return api.accounts.getList(user.userName, user.password);
    },
    enabled: !!user?.userName && !!user?.password,
  });

  const { refetch } = accountsQuery;

  const onRefresh = useCallback(async () => {
    console.log("AccountsScreen: Manual refresh triggered");
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = useCallback(
    ({ item }: { item: CurrentAccount }) => (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Building2 size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.accountName}>{item.CurrentAccountName}</Text>
            <Text style={styles.accountCode}>{item.CurrentAccountCode}</Text>
          </View>
        </View>
      </View>
    ),
    [styles, theme.colors.primary],
  );

  const renderFooter = () => {
    if (!accountsQuery.isFetching || refreshing) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (accountsQuery.isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>{t("accounts.loading")}</Text>
        </View>
      );
    }

    if (accountsQuery.isError) {
      return (
        <View style={styles.centerContainer}>
          <AlertCircle size={48} color={theme.colors.error} />
          <Text style={styles.errorTitle}>{t("accounts.errorTitle")}</Text>
          <Text style={styles.errorText}>
            {accountsQuery.error instanceof Error
              ? accountsQuery.error.message
              : t("accounts.defaultError")}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>{t("accounts.emptyList")}</Text>
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

const makeStyles = (theme: Theme) => {
  const { colors, spacing, radius, type } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    listContent: {
      padding: spacing.gutter,
      paddingBottom: spacing.xxl,
    },
    emptyListContent: {
      flexGrow: 1,
    },
    centerContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.xxxl,
      gap: spacing.sm,
      padding: spacing.xl,
    },
    loadingText: {
      ...type.body,
      color: colors.inkMuted,
      marginTop: spacing.sm,
    },
    errorTitle: {
      ...type.cardTitle,
      color: colors.ink,
      marginTop: spacing.xs,
    },
    errorText: {
      ...type.bodySm,
      color: colors.inkMuted,
      textAlign: "center",
    },
    emptyText: {
      ...type.body,
      color: colors.inkMuted,
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
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: radius.md,
      backgroundColor: colors.primaryTint,
      alignItems: "center",
      justifyContent: "center",
    },
    cardContent: {
      flex: 1,
      gap: spacing.xxs,
    },
    accountName: {
      ...type.cardTitle,
      color: colors.ink,
    },
    accountCode: {
      ...type.mono,
      color: colors.inkMuted,
    },
    footerLoader: {
      paddingVertical: spacing.lg,
      alignItems: "center",
    },
  });
};