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
  useQueryClient,
} from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Package,
  Search,
  Truck,
  X,
  CheckSquare,
  Square,
} from "lucide-react-native";
import { TextInput } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { useTheme } from "@/contexts/ThemeContext";
import type { Theme } from "@/constants/theme";
import ReceiptConfirmModal from "../components/ReceiptConfirmModal";
import ResultModal from "../components/ResultModal"; // SENİN HAZIR MODALIN

export default function IrsKoliListesiScreen() {
  const { t } = useTranslation();
  const router = useRouter();
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

  const handleLongPress = (id: number) => {
    if (!isSelectionMode) {
      toggleSelection(id);
    }
  };

  // Bu ekranda dokunma her durumda seçimi değiştirir (detay ekranı yok).
  const handlePress = (id: number) => {
    toggleSelection(id);
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
  const renderItem = ({ item }: { item: any }) => {
    const itemId = item.RecId || item.id || item.boxId;
    const isSelected = selectedIds.has(itemId);

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => handlePress(itemId)}
        onLongPress={() => handleLongPress(itemId)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Package
              size={24}
              color={isSelected ? theme.colors.primary : theme.colors.inkSubtle}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.cardTitle}>
                  {item.PackageNo || item.boxCode || t("irsKoli.boxPrefix", { id: itemId })}
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
          </View>

          <View>
            {isSelected ? (
              <CheckSquare size={24} color={theme.colors.primary} />
            ) : (
              <Square size={24} color={theme.colors.inkSubtle} opacity={0.5} />
            )}
          </View>
        </View>
      </TouchableOpacity>
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
          data={flatData}
          // TypeScript hatasını önlemek için item'ı any yapıyoruz
          keyExtractor={(item: any, index) =>
            `${item.RecId || item.id || index}`
          }
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
            { paddingBottom: insets.bottom + theme.spacing.md },
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
                <Truck size={24} color={theme.colors.onInfo} />
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
      ...type.body,
      marginTop: spacing.sm,
      color: colors.inkMuted,
    },
    errorText: {
      ...type.body,
      color: colors.error,
      textAlign: "center",
    },
    emptyText: {
      ...type.body,
      marginTop: spacing.sm,
      color: colors.inkMuted,
    },
    searchContainer: {
      padding: spacing.md,
      backgroundColor: colors.canvas,
      borderBottomWidth: 1,
      borderBottomColor: colors.hairline,
    },
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface2,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      height: 46,
      borderWidth: 1,
      borderColor: colors.hairlineStrong,
    },
    searchInput: {
      ...type.body,
      flex: 1,
      marginLeft: spacing.xs,
      color: colors.ink,
    },
    listContent: {
      padding: spacing.md,
      paddingBottom: 100,
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
      justifyContent: "space-between",
    },
    cardTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    cardTitle: {
      ...type.cardTitle,
      color: colors.ink,
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
      padding: spacing.md,
      backgroundColor: colors.surface1,
      borderTopWidth: 1,
      borderTopColor: colors.hairline,
    },
    submitButton: {
      backgroundColor: colors.info,
      borderRadius: radius.md,
      height: 54,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      ...type.button,
      color: colors.onInfo,
    },
  });
};
