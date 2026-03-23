import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  FileText,
  Search,
  ChevronRight,
} from "lucide-react-native";
import { useMemo, useState } from "react";
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
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { api, OrderReceipt } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import colors from "@/constants/colors";

export default function OrderReceiptsScreen() {
  const router = useRouter();
  const { credentials } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const orderReceiptsQuery = useQuery({
    queryKey: ["order-receipts", credentials],
    queryFn: async () => {
      console.log("OrderReceiptsScreen: Fetching order receipts");
      if (!credentials) {
        throw new Error("No credentials available");
      }
      return api.koliListesi.getOrderReceipts(
        credentials.userCode,
        credentials.password,
      );
    },
    enabled: !!credentials,
  });

  const handleReceiptSelect = (item: OrderReceipt) => {
    console.log(
      "OrderReceiptsScreen: Sipariş seçildi, okuyucuya gidiliyor",
      item.RecId,
    );

    // Koli oluşturmak yerine barkod okuyucuya yönlendiriyoruz
    router.push({
      pathname: "/(app)/barcode-scanner",
      params: {
        mode: "create_from_order",
        orderReceiptId: item.RecId.toString(),
        accountName: item.CurrentAccountName,
        receiptNo: item.ReceiptNo,
      },
    });
  };

  const onRefresh = async () => {
    console.log("OrderReceiptsScreen: Manual refresh triggered");
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
        item.ReceiptNo?.toLowerCase().includes(query) ||
        item.CurrentAccountName?.toLowerCase().includes(query),
    );
  }, [orderReceiptsQuery.data, searchQuery]);

  if (orderReceiptsQuery.isLoading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: "Sipariş Seçimi" }} />
        <ActivityIndicator size="large" color={colors.button.primary} />
        <Text style={styles.loadingText}>Siparişler yükleniyor...</Text>
      </View>
    );
  }

  if (orderReceiptsQuery.isError) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: "Sipariş Seçimi" }} />
        <AlertCircle size={48} color={colors.border.error} />
        <Text style={styles.errorTitle}>Yükleme Hatası</Text>
        <Text style={styles.errorText}>
          {orderReceiptsQuery.error instanceof Error
            ? orderReceiptsQuery.error.message
            : "Siparişler alınırken bir hata oluştu"}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: OrderReceipt }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => handleReceiptSelect(item)}
      testID={`order-receipt-${item.RecId}`}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <FileText size={22} color={colors.button.primary} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.receiptNo}>Fiş: {item.ReceiptNo}</Text>
          <Text style={styles.accountName} numberOfLines={2}>
            {item.CurrentAccountName}
          </Text>
        </View>
        <ChevronRight size={20} color={colors.text.secondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Sipariş Seçimi" }} />
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Sipariş No veya Cari Ara..."
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
        keyExtractor={(item, index) => `${item.RecId}-${index}`}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.button.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FileText size={48} color={colors.text.secondary} />
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Aramanıza uygun sipariş bulunamadı"
                : "Henüz bir sipariş fişi yok"}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
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
    fontSize: 15,
    fontFamily: "Segoe UI",
    color: colors.text.primary,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
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
    fontSize: 15,
    fontFamily: "Segoe UI",
    color: colors.text.secondary,
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: "Segoe UI",
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Segoe UI",
    color: colors.text.secondary,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Segoe UI",
    color: colors.text.secondary,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  receiptNo: {
    fontSize: 15,
    fontFamily: "Segoe UI",
    fontWeight: "700" as const,
    color: colors.text.primary,
    lineHeight: 20,
  },
  accountName: {
    fontSize: 13,
    fontFamily: "Segoe UI",
    color: colors.text.secondary,
    lineHeight: 18,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  loadingOverlayText: {
    fontSize: 16,
    fontFamily: "Segoe UI",
    fontWeight: "600" as const,
    color: "#fff",
    marginTop: 12,
  },
});
