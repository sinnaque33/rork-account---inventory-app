import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  FileText,
  Search,
  ChevronRight,
} from "lucide-react-native";
import { useMemo, useState } from "react";
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
import { Stack, useLocalSearchParams } from "expo-router";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { Theme } from "@/constants/theme";
import { OrderReceipt } from "@/services/types";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useErrorSignal } from "@/hooks/useErrorSignal";
import ResultModal from "../components/ResultModal";

export default function OrderReceiptsScreen() {
  const { t } = useTranslation();
  const { push } = useSafeNavigation();
  const { credentials } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // mode=create_empty: sipariş seçilince barkod ekranına gidilmez, malzemesiz
  // koli doğrudan burada oluşturulur.
  const params = useLocalSearchParams<{ mode?: string }>();
  const isCreateEmpty = params.mode === "create_empty";

  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const playErrorSignal = useErrorSignal();
  const [resultModalVisible, setResultModalVisible] = useState<boolean>(false);
  const [resultData, setResultData] = useState({ title: "", message: "" });

  const orderReceiptsQuery = useQuery({
    // credentials objesi şifre içerir; cache anahtarına yalnızca kullanıcı
    // kodu girmeli (kullanıcı değişince cache ayrışması için yeterli).
    queryKey: ["order-receipts", credentials?.userCode],
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

  const showError = (message: string) => {
    playErrorSignal();
    setResultData({
      title: t("orderReceipts.createErrorTitle"),
      message: message || t("orderReceipts.createErrorMsg"),
    });
    setResultModalVisible(true);
  };

  const createEmptyBoxMutation = useMutation({
    mutationFn: async (item: OrderReceipt) => {
      if (!credentials) {
        throw new Error("No credentials available");
      }
      const result = await api.koliListesi.createEmptyKoliFromOrderReceipt(
        credentials.userCode,
        credentials.password,
        item.RecId,
      );
      return { ...result, item };
    },
    onSuccess: (data: any) => {
      // Bu serviste success:"true" gelirken de iş kuralı hatası dönebiliyor;
      // barcode-scanner ile aynı hata tespiti uygulanır.
      const explanation = data.resultExplanation || data.msg || "";
      const isError =
        String(data.success) !== "true" ||
        (data.err !== 0 && data.err !== undefined) ||
        data.resultError === true ||
        !data.resultBoxId;

      if (isError) {
        showError(explanation);
        return;
      }

      const boxCode =
        data.resultBoxCode || data.boxCode || String(data.resultBoxId);

      queryClient.invalidateQueries({ queryKey: ["koli-listesi"] });

      // Geri tuşu create-koli/order-receipts'e değil koli listesine dönmeli.
      const detailParams = {
        id: data.resultBoxId?.toString(),
        recId: data.item.RecId?.toString(),
        packageNo: boxCode,
        boxCode,
        receiptNo: data.item.ReceiptNo,
      };

      navigation.dispatch((state) => {
        const koliListesiIndex = state.routes.findIndex(
          (r) => r.name === "koli-listesi",
        );

        if (koliListesiIndex !== -1) {
          const newRoutes = state.routes.slice(0, koliListesiIndex + 1);
          newRoutes.push({
            name: "koli-detay",
            params: detailParams,
          } as any);

          return CommonActions.reset({
            index: newRoutes.length - 1,
            routes: newRoutes,
          } as any);
        }

        return CommonActions.reset({
          index: 2,
          routes: [
            { name: "dashboard" },
            { name: "koli-listesi" },
            { name: "koli-detay", params: detailParams },
          ],
        } as any);
      });
    },
    onError: (error: unknown) => {
      showError(error instanceof Error ? error.message : "");
    },
  });

  const handleReceiptSelect = (item: OrderReceipt) => {
    if (isCreateEmpty) {
      if (createEmptyBoxMutation.isPending) return;
      createEmptyBoxMutation.mutate(item);
      return;
    }

    push({
      pathname: "/(app)/barcode-scanner",
      params: {
        mode: "create_from_order",
        orderReceiptId: item.RecId.toString(),
        accountName: item.CurrentAccountName,
        receiptNo: item.ReceiptNo,
      },
    });
  };

  const handleNoOrderSelect = () => {
    push({
      pathname: "/(app)/barcode-scanner",
      params: {
        mode: "create_standalone",
      },
    });
  };

  const onRefresh = async () => {
    console.log("OrderReceiptsScreen: Manual refresh triggered");
    setRefreshing(true);
    await orderReceiptsQuery.refetch();
    setRefreshing(false);
  };

  const headerTitle = isCreateEmpty
    ? t("orderReceipts.headerTitleEmpty")
    : t("orderReceipts.headerTitle");

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
        <Stack.Screen options={{ title: headerTitle }} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t("orderReceipts.loading")}</Text>
      </View>
    );
  }

  if (orderReceiptsQuery.isError) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: headerTitle }} />
        <AlertCircle size={48} color={theme.colors.error} />
        <Text style={styles.errorTitle}>{t("orderReceipts.errorTitle")}</Text>
        <Text style={styles.errorText}>
          {orderReceiptsQuery.error instanceof Error
            ? orderReceiptsQuery.error.message
            : t("orderReceipts.defaultErrorMsg")}
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
          <FileText size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.receiptNo}>
            {t("orderReceipts.receiptPrefix")}
            {item.ReceiptNo}
          </Text>
          <Text style={styles.accountName} numberOfLines={2}>
            {item.CurrentAccountName}
          </Text>
        </View>
        <ChevronRight size={20} color={theme.colors.inkSubtle} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: headerTitle }} />
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={theme.colors.inkSubtle} />
          <TextInput
            style={styles.searchInput}
            placeholder={t("orderReceipts.searchPlaceholder")}
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
        keyExtractor={(item, index) => `${item.RecId}-${index}`}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          // Boş koli akışının amacı siparişe istinaden koli açmak; "sipariş
          // bağlantısı yok" kartı bu modda anlamsız olduğu için gizlenir.
          isCreateEmpty ? (
            <Text style={styles.modeHint}>
              {t("orderReceipts.selectForEmpty")}
            </Text>
          ) : (
            <TouchableOpacity
              style={[
                styles.card,
                {
                  borderColor: theme.colors.primary,
                  borderWidth: 2,
                  marginBottom: 20,
                },
              ]}
              activeOpacity={0.7}
              onPress={handleNoOrderSelect}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <FileText size={22} color={theme.colors.onPrimary} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.receiptNo}>
                    {t(
                      "orderReceipts.noOrderLink",
                      "Sipariş bağlantısı yapılmayacak",
                    )}
                  </Text>
                  <Text style={styles.accountName}>
                    {t(
                      "orderReceipts.noOrderDesc",
                      "Siparişten bağımsız koli oluştur",
                    )}
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.colors.primary} />
              </View>
            </TouchableOpacity>
          )
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FileText size={48} color={theme.colors.inkSubtle} />
            <Text style={styles.emptyText}>
              {searchQuery
                ? t("orderReceipts.emptySearch")
                : t("orderReceipts.emptyList")}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {createEmptyBoxMutation.isPending && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingOverlayText}>
            {t("orderReceipts.creating")}
          </Text>
        </View>
      )}

      <ResultModal
        visible={resultModalVisible}
        onClose={() => setResultModalVisible(false)}
        title={resultData.title}
        message={resultData.message}
        type="error"
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
      paddingBottom: spacing.xxl,
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
      paddingVertical: 64,
      gap: spacing.md,
    },
    emptyText: {
      ...type.body,
      color: colors.inkMuted,
      textAlign: "center",
    },
    modeHint: {
      ...type.bodySm,
      color: colors.inkMuted,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.xxs,
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
      width: 46,
      height: 46,
      borderRadius: radius.md,
      backgroundColor: colors.primaryTint,
      alignItems: "center",
      justifyContent: "center",
    },
    itemInfo: {
      flex: 1,
      gap: spacing.xxs,
    },
    receiptNo: {
      ...type.cardTitle,
      color: colors.ink,
    },
    accountName: {
      ...type.bodySm,
      color: colors.inkMuted,
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.scrim,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    loadingOverlayText: {
      ...type.body,
      fontWeight: "600" as const,
      color: "#fff",
      marginTop: spacing.sm,
    },
  });
};
