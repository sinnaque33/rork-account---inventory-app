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
import { useRouter } from "expo-router";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import colors from "@/constants/colors";
import { KoliItem } from "@/services/types";
import ReceiptConfirmModal from "../components/ReceiptConfirmModal";
import ResultModal from "../components/ResultModal";

const PAGE_LEN = 7 as const;

export default function KoliListesiScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { credentials } = useAuth();
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
        title: "Başarılı",
        message: `Seçilen koliler için ${data.resultReceiptNo} nolu irsaliye başarıyla oluşturuldu.`,
        type: "success",
      });
      setResultModalVisible(true);

      cancelSelectionMode();
      queryClient.invalidateQueries({ queryKey: ["koli-listesi"] });
    },
    onError: (error) => {
      setResultData({
        title: "Hata",
        message: error instanceof Error ? error.message : "Bir hata oluştu.",
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
    } else {
      router.push(
        `/(app)/koli-detay?id=${item.id}&packageNo=${item.PackageNo || ""}&receiptNo=${item.ReceiptNo || ""}&sipExp=${encodeURIComponent(item.SipExp || "")}` as any,
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
        <ActivityIndicator size="large" color={colors.button.primary} />
        <Text style={styles.loadingText}>{t("koliListesi.loading")}</Text>
      </View>
    );
  }

  if (koliQuery.isError) {
    return (
      <View style={styles.centerContainer}>
        <AlertCircle size={48} color={colors.border.error} />
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
              isSelected && { backgroundColor: colors.button.primary },
            ]}
          >
            {isSelected ? (
              <CheckCircle2 size={24} color="#fff" />
            ) : (
              <Package size={24} color={colors.button.primary} />
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
          <ActivityIndicator size="small" color={colors.button.primary} />
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
          <Search size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t("koliListesi.searchPlaceholder")}
            placeholderTextColor={colors.text.secondary}
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
            colors={[colors.button.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={48} color={colors.text.secondary} />
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
              router.push({
                pathname: "/(app)/barcode-scanner",
                params: { mode: "search" },
              });
            }}
            activeOpacity={0.8}
            testID="barcode-scanner-button"
          >
            <ScanBarcode size={26} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push("/(app)/create-koli")}
            activeOpacity={0.8}
            testID="create-koli-button"
          >
            <Plus size={28} color="#fff" />
          </TouchableOpacity>
        </>
      )}

      {isSelectionMode && (
        <View style={styles.selectionBar}>
          <TouchableOpacity
            onPress={cancelSelectionMode}
            style={styles.cancelSelectionBtn}
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.selectionCountText}>
            {selectedItems.length} Koli Seçildi
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
              <ActivityIndicator size="small" color={colors.button.primary} />
            ) : (
              <FileText size={18} color={colors.button.primary} />
            )}
            <Text style={styles.bulkActionText}>İrsaliye Oluştur</Text>
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
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  cardSelected: {
    borderColor: colors.button.primary,
    backgroundColor: "rgba(220, 20, 60, 0.05)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(220, 20, 60, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  packageNo: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
    lineHeight: 22,
  },
  explanation: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  receiptNo: {
    fontSize: 13,
    color: colors.button.primary,
    fontWeight: "500" as const,
    lineHeight: 18,
  },
  sipExp: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "500" as const,
    lineHeight: 18,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.button.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabSecondary: {
    position: "absolute",
    right: 20,
    bottom: 88,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.background.card,
    borderWidth: 2,
    borderColor: colors.button.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  selectionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.darker,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  cancelSelectionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F44336",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#F44336",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  selectionCountText: {
    flex: 1,
    fontSize: 17,
    fontFamily: "Segoe UI",
    fontWeight: "700",
    color: "#fff",
    marginLeft: 14,
  },
  bulkActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(220, 20, 60, 0.15)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.button.primary,
    gap: 8,
  },
  bulkActionText: {
    color: colors.button.primary,
    fontSize: 15,
    fontFamily: "Segoe UI",
    fontWeight: "700",
  },
});
