import { useInfiniteQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Package,
  Search,
  Plus,
  ScanBarcode,
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
} from "react-native";
import { useRouter } from "expo-router";
import { api, KoliItem } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import colors from "@/constants/colors";

const PAGE_LEN = 7 as const;

export default function KoliListesiScreen() {
  const router = useRouter();
  const { credentials } = useAuth();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const koliQuery = useInfiniteQuery({
    queryKey: ["koli-listesi", credentials, debouncedSearchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      console.log(
        "KoliListesiScreen: Fetching koli listesi with offSet:",
        pageParam,
        "searchId:",
        debouncedSearchQuery,
      );
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

      if (items && items.length > 0) {
        console.log("\n📦 --- API'DEN GELEN ÖRNEK BİR KOLİ OBJESİ ---");
        console.log(JSON.stringify(items[0], null, 2));
        console.log("------------------------------------------------\n");
      }
      return items;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_LEN) {
        console.log(
          "KoliListesiScreen: No more pages, last page had",
          lastPage.length,
          "items",
        );
        return undefined;
      }
      const nextOffset = allPages.length * PAGE_LEN;
      console.log("KoliListesiScreen: Next offset will be", nextOffset);
      return nextOffset;
    },
    enabled: !!credentials,
  });

  const allItems = useMemo(() => {
    return koliQuery.data?.pages.flat() || [];
  }, [koliQuery.data]);

  const onRefresh = async () => {
    console.log("KoliListesiScreen: Manual refresh triggered");
    setRefreshing(true);
    await koliQuery.refetch();
    setRefreshing(false);
  };

  const filteredItems = allItems;

  const loadMore = useCallback(() => {
    if (koliQuery.hasNextPage && !koliQuery.isFetchingNextPage) {
      console.log("KoliListesiScreen: Loading more items from server");
      koliQuery.fetchNextPage();
    }
  }, [koliQuery.hasNextPage, koliQuery.isFetchingNextPage]);

  if (koliQuery.isLoading && allItems.length === 0 && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.button.primary} />
        <Text style={styles.loadingText}>Koli listesi yükleniyor...</Text>
      </View>
    );
  }

  if (koliQuery.isError) {
    return (
      <View style={styles.centerContainer}>
        <AlertCircle size={48} color={colors.border.error} />
        <Text style={styles.errorTitle}>Hata Koli Listesi</Text>
        <Text style={styles.errorText}>
          {koliQuery.error instanceof Error
            ? koliQuery.error.message
            : "An error occurred"}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: KoliItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => {
        console.log("KoliListesiScreen: Item clicked with id", item.id);
        router.push(
          `/(app)/koli-detay?id=${item.id}&packageNo=${item.PackageNo || ""}&receiptNo=${item.ReceiptNo || ""}&sipExp=${encodeURIComponent(item.SipExp || "")}` as any,
        );
      }}
      testID={`koli-item-${item.id}`}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Package size={24} color={colors.button.primary} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.packageNo}>{item.PackageNo}</Text>
          {item.ReceiptNo ? (
            <Text style={styles.receiptNo}>Sipariş No: {item.ReceiptNo}</Text>
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
          <Text style={styles.footerText}>Tüm koliler yüklendi</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Koli Ara..."
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
                ? "Aramanızla eşleşen koli bulunamadı"
                : "Koli bulunamadı"}
            </Text>
          </View>
        }
      />

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
});
