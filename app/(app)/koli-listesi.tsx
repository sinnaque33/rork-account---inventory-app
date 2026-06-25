import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  Package,
  Search,
  Plus,
  ScanBarcode,
  CheckCircle2,
  X,
  FileText,
} from "lucide-react-native";
import { useMemo, useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Vibration,
} from "react-native";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { Theme } from "@/constants/theme";
import { KoliItem } from "@/services/types";
import ReceiptConfirmModal from "../components/ReceiptConfirmModal";
import ResultModal from "../components/ResultModal";

const PAGE_LEN = 7 as const;

export default function KoliListesiScreen() {
  const { t } = useTranslation();
  const { push } = useSafeNavigation();
  const { credentials } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");

  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<KoliItem[]>([]);
  const [showReceiptConfirm, setShowReceiptConfirm] = useState<boolean>(false);

  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultData, setResultData] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error" | "warning",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const koliQuery = useInfiniteQuery({
    queryKey: ["koli-listesi", credentials, debouncedSearchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      if (!credentials) {
        throw new Error("No credentials available");
      }
      const items = await api.koliListesi.getList(
        credentials.userCode,
        credentials.password,
        pageParam,
        PAGE_LEN,
        debouncedSearchQuery || undefined,
      );
      console.log(" itemler ",items);
      return items;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_LEN) {
        return undefined;
      }
      return allPages.length * PAGE_LEN;
    },
    enabled: !!credentials,
  });

  const allItems = useMemo(() => {
    return koliQuery.data?.pages.flat() || [];
  }, [koliQuery.data]);

  const onRefresh = async () => {
    setRefreshing(true);
    await koliQuery.refetch();
    setRefreshing(false);
  };

  const filteredItems = allItems;

  const loadMore = useCallback(() => {
    if (koliQuery.hasNextPage && !koliQuery.isFetchingNextPage) {
      koliQuery.fetchNextPage();
    }
  }, [koliQuery]);

  const bulkCreateReceiptMutation = useMutation({
    mutationFn: async (selectedIds: number[]) => {
      if (!credentials) throw new Error("Giriş bilgileri eksik.");

      const data = await api.koliListesi.createReceipts(
        credentials.userCode,
        credentials.password,
        selectedIds,
      );

      console.log("Toplu İşlem Yanıtı:", JSON.stringify(data, null, 2));

      const isError =
        String(data.success) !== "true" ||
        (data.err !== undefined && data.err !== 0);

      if (isError) {
        throw new Error(
          data.msg || "Toplu irsaliye oluşturulurken bir hata oluştu.",
        );
      }

      return data;
    },
    onSuccess: (data) => {
      setResultData({
        title: t("common.success"),
        message: t("koliListesi.bulkReceiptSuccess", { receiptNo: data.resultReceiptNo }),
        type: "success",
      });
      setResultModalVisible(true);

      cancelSelectionMode();
      queryClient.invalidateQueries({ queryKey: ["koli-listesi"] });
    },
    onError: (error) => {
      setResultData({
        title: t("common.error"),
        message: error instanceof Error ? error.message : t("common.defaultError"),
        type: "error",
      });
      setResultModalVisible(true);
    },
  });

  const toggleSelection = (item: KoliItem) => {
    setSelectedItems((prev) => {
      const isAlreadySelected = prev.some(
        (selected) => selected.id === item.id,
      );
      let newSelection;

      if (isAlreadySelected) {
        newSelection = prev.filter((selected) => selected.id !== item.id);
      } else {
        newSelection = [...prev, item];
      }

      if (newSelection.length === 0) {
        setIsSelectionMode(false);
      }
      return newSelection;
    });
  };

  const handleLongPress = (item: KoliItem) => {
    if (!isSelectionMode) {
      Vibration.vibrate(50);
      setIsSelectionMode(true);
      setSelectedItems([item]);
    }
  };

  const handlePress = (item: KoliItem) => {
    
    if (isSelectionMode) {
      toggleSelection(item);
    } else { //todo recId gönder
      push(
        `/(app)/koli-detay?id=${item.id}&packageNo=${item.PackageNo || ""}&receiptNo=${item.ReceiptNo || ""}&recId=${item.id || ""}&sipExp=${encodeURIComponent(item.SipExp || "")}` as any,
      );
    }
  };

  const cancelSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedItems([]);
    setShowReceiptConfirm(false);
  };

  if (koliQuery.isLoading && allItems.length === 0 && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t("koliListesi.loading")}</Text>
      </View>
    );
  }

  if (koliQuery.isError) {
    return (
      <View style={styles.centerContainer}>
        <AlertCircle size={48} color={theme.colors.error} />
        <Text style={styles.errorTitle}>{t("koliListesi.errorTitle")}</Text>
        <Text style={styles.errorText}>
          {koliQuery.error instanceof Error
            ? koliQuery.error.message
            : t("koliListesi.defaultError")}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: KoliItem }) => {
    const isSelected = selectedItems.some(
      (selected) => selected.id === item.id,
    );

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        activeOpacity={0.7}
        onLongPress={() => handleLongPress(item)}
        onPress={() => handlePress(item)}
        testID={`koli-item-${item.id}`}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconContainer,
              isSelected && { backgroundColor: theme.colors.primary },
            ]}
          >
            {isSelected ? (
              <CheckCircle2 size={24} color={theme.colors.onPrimary} />
            ) : (
              <Package size={24} color={theme.colors.primary} />
            )}
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.packageNo}>{item.PackageNo}</Text>
            {item.ReceiptNo ? (
              <Text style={styles.receiptNo}>
                {t("koliListesi.receiptNoPrefix")}
                {item.ReceiptNo}
              </Text>
            ) : null}
            {item.SipExp ? (
              <Text style={styles.sipExp}>{item.SipExp}</Text>
            ) : null}
            {item.Explanation ? (
              <Text style={styles.explanation}>{item.Explanation}</Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (koliQuery.isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      );
    }
    if (!koliQuery.hasNextPage && allItems.length > 0) {
      return (
        <View style={styles.footerLoader}>
          <Text style={styles.footerText}>{t("koliListesi.allLoaded")}</Text>
        </View>
      );
    }
    return <View style={{ height: isSelectionMode ? 80 : 0 }} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={theme.colors.inkSubtle} />
          <TextInput
            style={styles.searchInput}
            placeholder={t("koliListesi.searchPlaceholder")}
            placeholderTextColor={theme.colors.inkSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-input"
          />
        </View>
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.PackageNo}-${item.id}-${index}`}
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
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={48} color={theme.colors.inkSubtle} />
            <Text style={styles.emptyText}>
              {searchQuery
                ? t("koliListesi.emptySearch")
                : t("koliListesi.emptyList")}
            </Text>
          </View>
        }
      />

      {!isSelectionMode && (
        <>
          <TouchableOpacity
            style={styles.fabSecondary}
            onPress={() => {
              push({
                pathname: "/(app)/barcode-scanner",
                params: { mode: "search" },
              });
            }}
            activeOpacity={0.8}
            testID="barcode-scanner-button"
          >
            <ScanBarcode size={26} color={theme.colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fab}
            onPress={() => push("/(app)/create-koli")}
            activeOpacity={0.8}
            testID="create-koli-button"
          >
            <Plus size={28} color={theme.colors.onPrimary} />
          </TouchableOpacity>
        </>
      )}

      {isSelectionMode && (
        <View style={styles.selectionBar}>
          <TouchableOpacity
            onPress={cancelSelectionMode}
            style={styles.cancelSelectionBtn}
          >
            <X size={24} color={theme.colors.onError} />
          </TouchableOpacity>

          <Text style={styles.selectionCountText}>
            {t("koliListesi.selectedCount", { count: selectedItems.length })}
          </Text>

          <TouchableOpacity
            style={[
              styles.bulkActionButton,
              bulkCreateReceiptMutation.isPending && { opacity: 0.7 },
            ]}
            onPress={() => setShowReceiptConfirm(true)}
            disabled={bulkCreateReceiptMutation.isPending}
          >
            {bulkCreateReceiptMutation.isPending ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <FileText size={18} color={theme.colors.primary} />
            )}
            <Text style={styles.bulkActionText}>{t("koliListesi.createReceipt")}</Text>
          </TouchableOpacity>
        </View>
      )}
      <ReceiptConfirmModal
        visible={showReceiptConfirm}
        onClose={() => setShowReceiptConfirm(false)}
        isLoading={bulkCreateReceiptMutation.isPending}
        itemCount={selectedItems.length}
        onConfirm={() => {
          setShowReceiptConfirm(false);
          const selectedIds = selectedItems.map((item) => item.id);
          bulkCreateReceiptMutation.mutate(selectedIds);
        }}
      />
      <ResultModal
        visible={resultModalVisible}
        onClose={() => setResultModalVisible(false)}
        title={resultData.title}
        message={resultData.message}
        type={resultData.type as "success" | "error" | "warning"}
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
      flexDirection: "row",
      alignItems: "center",
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
      alignItems: "center",
      justifyContent: "center",
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
      textAlign: "center",
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.xxxl,
      gap: spacing.sm,
    },
    emptyText: {
      ...type.body,
      color: colors.inkMuted,
      textAlign: "center",
    },
    card: {
      backgroundColor: colors.surface1,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.hairline,
    },
    cardSelected: {
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: colors.primaryTint,
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
    itemInfo: {
      flex: 1,
      gap: spacing.xxs,
    },
    packageNo: {
      ...type.cardTitle,
      color: colors.ink,
    },
    explanation: {
      ...type.bodySm,
      color: colors.inkMuted,
    },
    receiptNo: {
      ...type.mono,
      color: colors.primary,
    },
    sipExp: {
      ...type.bodySm,
      color: colors.success,
      fontWeight: "500" as const,
    },
    footerLoader: {
      paddingVertical: spacing.lg,
      alignItems: "center",
    },
    footerText: {
      ...type.bodySm,
      color: colors.inkSubtle,
    },
    fab: {
      position: "absolute",
      right: spacing.lg,
      bottom: spacing.xxl,
      width: 56,
      height: 56,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      elevation: 6,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    fabSecondary: {
      position: "absolute",
      right: spacing.lg,
      bottom: 100,
      width: 52,
      height: 52,
      borderRadius: radius.pill,
      backgroundColor: colors.surface1,
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
    },
    selectionBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface1,
      borderTopWidth: 1,
      borderTopColor: colors.hairline,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxxl,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      elevation: 20,
    },
    cancelSelectionBtn: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      backgroundColor: colors.error,
      alignItems: "center",
      justifyContent: "center",
    },
    selectionCountText: {
      ...type.cardTitle,
      flex: 1,
      color: colors.ink,
      marginLeft: spacing.sm,
    },
    bulkActionButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primaryTint,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: colors.primary,
      gap: spacing.xs,
    },
    bulkActionText: {
      ...type.button,
      color: colors.primary,
    },
  });
};
