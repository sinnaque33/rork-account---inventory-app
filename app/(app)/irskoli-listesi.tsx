import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Package,
  Search,
  Truck,
  X,
  Check,
  ChevronRight,
} from "lucide-react-native";
import { TextInput } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { useAuth } from "@/contexts/AuthContext";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { api } from "@/services/api";
import { useTheme } from "@/contexts/ThemeContext";
import type { Theme } from "@/constants/theme";
import ReceiptConfirmModal from "../components/ReceiptConfirmModal";
import ResultModal from "../components/ResultModal"; // SENİN HAZIR MODALIN

export default function IrsKoliListesiScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { push } = useSafeNavigation();
  const { credentials } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const queryClient = useQueryClient();

  // --- STATE'LER ---
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Onay Modalı state'i
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // --- BİLDİRİM VE HATA MODAL STATE'LERİ ---
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultData, setResultData] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error" | "warning",
  });

  // Çoklu seçim modunda mıyız? (En az 1 koli seçiliyse true)
  const isSelectionMode = selectedIds.size > 0;

  // Koli detayında silinen, yeniden açılan ya da irsaliyesi kesilen koli seçimde
  // kalmamalı;
  // kalırsa toplu irsaliyeye yeniden gönderilirdi. Detay ekranı bu kolileri
  // bu anahtara yazar; liste filtresi aramaya bağlı olduğu için seçim listeden
  // değil buradan temizlenir.
  const { data: removedBoxes } = useQuery<string[]>({
    queryKey: ["irs-removed-boxes"],
    queryFn: async () => [],
    enabled: false,
    staleTime: Infinity,
  });

  React.useEffect(() => {
    if (!removedBoxes?.length) return;
    setSelectedIds((prev) => {
      const next = new Set(
        [...prev].filter((id) => !removedBoxes.includes(String(id))),
      );
      return next.size === prev.size ? prev : next;
    });
    queryClient.setQueryData<string[]>(["irs-removed-boxes"], []);
  }, [removedBoxes, queryClient]);

  // --- ARAMA DEBOUNCE (Yazmayı bitirince arama yapsın) ---
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // --- API: LİSTE GETİRME (Infinite Scroll) ---
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    // credentials objesi şifre içerir; cache anahtarına yalnızca kullanıcı
    // kodu girmeli (kullanıcı değişince cache ayrışması için yeterli).
    queryKey: ["irs-koli-listesi", debouncedSearch, credentials?.userCode],
    queryFn: async ({ pageParam = 0 }) => {
      if (!credentials) throw new Error("Giriş bilgileri bulunamadı.");
      return api.koliListesi.irsKoliListesi(
        credentials.userCode,
        credentials.password,
        pageParam,
        15, // Sayfa başına 15 koli
        debouncedSearch,
      );
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 15) return undefined;
      return allPages.length * 15;
    },
    initialPageParam: 0,
    enabled: !!credentials,
  });

  const flatData = useMemo(() => {
    return data?.pages.flatMap((page) => page) || [];
  }, [data]);

  // Koliler siparişe göre gruplanır; sıra servisin sırasıdır, sonraki sayfalardan
  // gelen koliler aynı siparişin grubuna eklenir.
  const groups = useMemo(() => {
    const byOrder = new Map<
      string,
      { key: string; receiptNo: string; sipExp: string; items: any[] }
    >();
    for (const item of flatData as any[]) {
      const receiptNo = String(item.ReceiptNo ?? "").trim();
      let group = byOrder.get(receiptNo);
      if (!group) {
        group = {
          key: receiptNo || "no-order",
          receiptNo,
          sipExp: item.SipExp || "",
          items: [],
        };
        byOrder.set(receiptNo, group);
      }
      group.items.push(item);
    }
    return Array.from(byOrder.values());
  }, [flatData]);

  // --- API: İRSALİYE OLUŞTURMA (Toplu) ---
  const createReceiptsMutation = useMutation({
    mutationFn: async (boxIds: number[]) => {
      if (!credentials) throw new Error("Giriş bilgileri bulunamadı.");
      return api.koliListesi.createReceipts(
        credentials.userCode,
        credentials.password,
        boxIds,
      );
    },
    onSuccess: (res) => {
      // Onay Modal'ını kapat
      setShowConfirmModal(false);

      // TypeScript hatasını önlemek için (res as any) kullanıyoruz
      let parsedData: any = {};
      const responseData = (res as any).data;

      if (responseData) {
        try {
          parsedData =
            typeof responseData === "string"
              ? JSON.parse(responseData)
              : responseData;
        } catch (e) {
          console.warn("API data parse edilemedi", e);
        }
      }

      // Kapsamlı Hata Kontrolü
      const isError =
        String(res.success) !== "true" ||
        (res.err !== undefined && res.err !== 0) ||
        parsedData.resultError === true ||
        (parsedData.err !== undefined && parsedData.err !== 0);

      if (isError) {
        // HATA DURUMU
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }

        const errorMessage =
          parsedData.resultExplanation || res.msg || t("irsKoli.receiptCreateFail");

        setResultData({
          title: t("common.error"),
          message: errorMessage,
          type: "error",
        });
        setResultModalVisible(true);
      } else {
        // BAŞARI DURUMU
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        handleClearSelection(); // Başarılı olunca seçimi temizle

        setResultData({
          title: t("common.success"),
          message: res.msg || t("irsKoli.receiptCreateSuccess"),
          type: "success",
        });
        setResultModalVisible(true);

        queryClient.invalidateQueries({ queryKey: ["irs-koli-listesi"] });
        queryClient.invalidateQueries({ queryKey: ["koli-listesi"] });
      }
    },
    onError: (err: Error) => {
      setShowConfirmModal(false);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      setResultData({
        title: t("common.error"),
        message: err.message,
        type: "error",
      });
      setResultModalVisible(true);
    },
  });

  // --- SEÇİM İŞLEMLERİ ---
  const toggleSelection = useCallback((id: number) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();

    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // "Tümünü seç": grubun yüklenmiş bütün kolileri. Hepsi seçiliyse seçim kalkar.
  // Durumu "açık" (0) gelen koliler toplu seçime girmez.
  const toggleGroup = useCallback((ids: number[]) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (ids.every((id) => next.has(id))) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  }, []);

  const handleLongPress = (id: number) => {
    if (!isSelectionMode) {
      toggleSelection(id);
    }
  };

  // Satıra dokunma her durumda seçimi değiştirir; detay sağdaki oktan açılır.
  const handlePress = (id: number) => {
    toggleSelection(id);
  };

  // Koli listesiyle aynı parametreler; ekran yığında kaldığı için geri dönünce
  // seçim, arama ve kaydırma yeri korunur.
  const handleOpenBox = (item: any, itemId: number) => {
    push(
      `/(app)/koli-detay?id=${itemId}&packageNo=${encodeURIComponent(item.PackageNo || "")}&receiptNo=${encodeURIComponent(item.ReceiptNo || "")}&recId=${itemId}&sipExp=${encodeURIComponent(item.SipExp || "")}` as any,
    );
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleOpenModal = () => {
    if (selectedIds.size === 0) return;
    setShowConfirmModal(true);
  };

  const handleConfirmReceipt = () => {
    const idsArray = Array.from(selectedIds);
    createReceiptsMutation.mutate(idsArray);
  };

  // --- RENDER ITEM ---
  const renderBox = (item: any) => {
    const itemId = item.RecId || item.id || item.boxId;
    const isSelected = selectedIds.has(itemId);
    const boxNo =
      item.PackageNo || item.boxCode || t("irsKoli.boxPrefix", { id: itemId });
    const cut = String(boxNo).lastIndexOf("-") + 1;

    return (
      <View key={itemId} style={[styles.row, isSelected && styles.rowSelected]}>
        <TouchableOpacity
          style={styles.pick}
          onPress={() => handlePress(itemId)}
          onLongPress={() => handleLongPress(itemId)}
          activeOpacity={0.8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isSelected }}
        >
          <View style={[styles.check, isSelected && styles.checkOn]}>
            {isSelected ? (
              <Check size={16} color={theme.colors.onInfo} strokeWidth={3} />
            ) : null}
          </View>
          <View style={styles.pickText}>
            <Text style={styles.boxNo}>
              <Text style={styles.boxNoOrder}>
                {String(boxNo).slice(0, cut)}
              </Text>
              {String(boxNo).slice(cut)}
            </Text>
            {item.Status !== undefined && (
              <Text style={styles.cardSubtitle}>
                {t("irsKoli.statusLabel")}
                {item.Status === 0
                  ? t("irsKoli.statusOpen")
                  : item.Status === 2
                    ? t("irsKoli.statusClosed")
                    : item.Status}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.openBox, isSelected && styles.openBoxSelected]}
          onPress={() => handleOpenBox(item, itemId)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t("irsKoli.openBox", { no: boxNo })}
          testID={`irs-box-open-${itemId}`}
        >
          <ChevronRight
            size={20}
            color={isSelected ? theme.colors.irsInk : theme.colors.inkSubtle}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item: group }: { item: (typeof groups)[number] }) => {
    const groupIds = group.items
      .filter((box) => box.Status !== 0)
      .map((box) => box.RecId || box.id || box.boxId);
    const selectedCount = group.items.filter((box) =>
      selectedIds.has(box.RecId || box.id || box.boxId),
    ).length;
    const allSelected =
      groupIds.length > 0 && groupIds.every((id) => selectedIds.has(id));

    return (
      <View style={styles.group}>
        <View style={styles.groupHead}>
          <View style={styles.groupText}>
            <Text style={styles.groupTitle}>
              {group.receiptNo || t("irsKoli.noOrderGroup")}
            </Text>
            {group.sipExp ? (
              <Text style={styles.groupMeta} numberOfLines={1}>
                {group.sipExp}
              </Text>
            ) : null}
            <Text style={styles.groupMeta}>
              {t("irsKoli.groupBoxes", { count: group.items.length })}
              {selectedCount > 0 ? (
                <>
                  {" · "}
                  <Text style={styles.groupSelected}>
                    {t("irsKoli.groupSelected", { count: selectedCount })}
                  </Text>
                </>
              ) : null}
            </Text>
          </View>
          {groupIds.length > 0 ? (
            <TouchableOpacity
              style={styles.groupAll}
              onPress={() => toggleGroup(groupIds)}
              accessibilityRole="button"
              testID={`irs-group-all-${group.key}`}
            >
              <Text style={styles.groupAllText}>
                {allSelected ? t("irsKoli.clearGroup") : t("irsKoli.selectAll")}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {group.items.map(renderBox)}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Stack.Screen
        options={{
          title: isSelectionMode
              ? t("irsKoli.selectedCount", { count: selectedIds.size })
              : t("irsKoli.headerTitle"),
          headerRight: () =>
            isSelectionMode ? (
              <TouchableOpacity
                onPress={handleClearSelection}
                style={{ marginRight: 16 }}
              >
                <X size={24} color={theme.colors.ink} />
              </TouchableOpacity>
            ) : null,
        }}
      />

      <View style={styles.searchContainer}>
        <View style={styles.hintRow}>
          <Truck size={20} color={theme.colors.irsInk} />
          <Text style={styles.hintText}>{t("irsKoli.hint")}</Text>
        </View>
        <View style={styles.searchBox}>
          <Search size={20} color={theme.colors.inkSubtle} />
          <TextInput
            style={styles.searchInput}
            placeholder={t("irsKoli.searchPlaceholder")}
            placeholderTextColor={theme.colors.inkSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={20} color={theme.colors.inkSubtle} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading && !isRefetching ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>{t("irsKoli.loading")}</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {error instanceof Error ? error.message : t("common.defaultError")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(group) => group.key}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                style={{ margin: 16 }}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Package size={48} color={theme.colors.inkSubtle} opacity={0.5} />
              <Text style={styles.emptyText}>{t("irsKoli.emptyList")}</Text>
            </View>
          }
        />
      )}

      {isSelectionMode && (
        <View
          style={[
            styles.bottomPanel,
            { paddingBottom: insets.bottom + theme.spacing.xs },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.submitButton,
              createReceiptsMutation.isPending && styles.submitButtonDisabled,
            ]}
            onPress={handleOpenModal}
            disabled={createReceiptsMutation.isPending}
          >
            {createReceiptsMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Truck size={20} color={theme.colors.onInfo} />
                <Text style={styles.submitButtonText}>
                  {t("irsKoli.submitButton", { count: selectedIds.size })}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ONAY MODALI */}
      <ReceiptConfirmModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmReceipt}
        isLoading={createReceiptsMutation.isPending}
        itemCount={selectedIds.size}
      />

      {/* SONUÇ (BAŞARI/HATA) MODALI (Senin Modalın) */}
      <ResultModal
        visible={resultModalVisible}
        onClose={() => setResultModalVisible(false)}
        title={resultData.title}
        message={resultData.message}
        type={resultData.type}
      />
    </KeyboardAvoidingView>
  );
}

const makeStyles = (theme: Theme) => {
  const { colors, spacing, radius, type } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    centerContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },
    loadingText: {
      ...type.hint,
      marginTop: spacing.sm,
      color: colors.inkMuted,
    },
    errorText: {
      ...type.hint,
      color: colors.error,
      textAlign: "center",
    },
    emptyText: {
      ...type.hint,
      marginTop: spacing.sm,
      color: colors.inkMuted,
    },
    searchContainer: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
      backgroundColor: colors.canvas,
    },
    hintRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    hintText: {
      ...type.labelMd,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "400",
      color: colors.readMuted,
    },
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.lg,
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.controlLine,
      ...theme.cardShadow,
    },
    searchInput: {
      ...type.body,
      flex: 1,
      marginLeft: spacing.sm,
      color: colors.ink,
    },
    listContent: {
      paddingTop: spacing.xxs,
      paddingHorizontal: spacing.md,
      paddingBottom: 100,
    },
    group: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.cardLine,
      overflow: "hidden",
      ...theme.cardShadow,
    },
    groupHead: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.band,
      borderBottomWidth: 1,
      borderBottomColor: colors.bandLine,
    },
    groupText: {
      flex: 1,
      minWidth: 0,
    },
    groupTitle: {
      ...type.codeMd,
      fontSize: 15,
      lineHeight: 21,
      fontWeight: "700",
      color: colors.ink,
    },
    groupMeta: {
      ...type.labelMd,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "400",
      color: colors.readMuted,
      marginTop: spacing.xxs,
    },
    groupSelected: {
      fontWeight: "700",
      color: colors.irsInk,
    },
    groupAll: {
      minHeight: 48,
      justifyContent: "center",
      marginVertical: -spacing.xs,
      marginRight: -spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    groupAllText: {
      ...type.labelStrong,
      fontSize: 13,
      lineHeight: 19,
      color: colors.irsInk,
    },
    row: {
      flexDirection: "row",
      alignItems: "stretch",
      borderTopWidth: 1,
      borderTopColor: colors.bandLine,
    },
    rowSelected: {
      backgroundColor: colors.irsTile,
    },
    pick: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      minHeight: 56,
      paddingVertical: spacing.xs,
      paddingLeft: spacing.md,
      paddingRight: spacing.xs,
    },
    openBox: {
      width: 56,
      alignItems: "center",
      justifyContent: "center",
      borderLeftWidth: 1,
      borderLeftColor: colors.bandLine,
    },
    openBoxSelected: {
      borderLeftColor: colors.irs,
    },
    check: {
      width: 24,
      height: 24,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: colors.controlLine,
      alignItems: "center",
      justifyContent: "center",
    },
    checkOn: {
      backgroundColor: colors.irs,
      borderColor: colors.irs,
    },
    pickText: {
      flex: 1,
      minWidth: 0,
    },
    boxNo: {
      ...type.codeLg,
      fontSize: 17,
      lineHeight: 23,
      color: colors.ink,
    },
    boxNoOrder: {
      fontWeight: "500",
      color: colors.readMuted,
    },
    cardSubtitle: {
      ...type.bodySm,
      color: colors.inkMuted,
      marginTop: spacing.xxs,
    },
    bottomPanel: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingTop: spacing.xs,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.canvas,
      borderTopWidth: 1,
      borderTopColor: colors.cardLine,
    },
    submitButton: {
      backgroundColor: colors.irs,
      borderRadius: radius.control,
      minHeight: 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      ...type.body,
      fontWeight: "600",
      color: colors.onInfo,
    },
  });
};
