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
import * as Haptics from "expo-haptics";

import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import colors from "@/constants/colors";
import ReceiptConfirmModal from "../components/ReceiptConfirmModal";
import ResultModal from "../components/ResultModal"; // SENİN HAZIR MODALIN

export default function IrsKoliListesiScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { credentials } = useAuth();
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
    queryKey: ["irs-koli-listesi", debouncedSearch, credentials],
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
          parsedData.resultExplanation || res.msg || "İrsaliye oluşturulamadı.";

        setResultData({
          title: t("common.error", "Hata"),
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
          title: t("common.success", "Başarılı"),
          message: res.msg || "İrsaliye başarıyla oluşturuldu.",
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
        title: t("common.error", "Hata"),
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

  const handlePress = (id: number) => {
    if (isSelectionMode) {
      toggleSelection(id);
    } else {
      toggleSelection(id);
    }
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
              color={isSelected ? colors.button.primary : colors.text.secondary}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.cardTitle}>
                {item.PackageNo || item.boxCode || `Koli #${itemId}`}
              </Text>
              {item.Status !== undefined && (
                <Text style={styles.cardSubtitle}>
                  Durum:{" "}
                  {item.Status === 0
                    ? "Açık"
                    : item.Status === 2
                      ? "Kapalı"
                      : item.Status}
                </Text>
              )}
            </View>
          </View>

          <View>
            {isSelected ? (
              <CheckSquare size={24} color={colors.button.primary} />
            ) : (
              <Square size={24} color={colors.text.secondary} opacity={0.5} />
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
            ? `${selectedIds.size} Koli Seçildi`
            : "İrsaliye Oluştur",
          headerRight: () =>
            isSelectionMode ? (
              <TouchableOpacity
                onPress={handleClearSelection}
                style={{ marginRight: 16 }}
              >
                <X size={24} color={colors.text.primary} />
              </TouchableOpacity>
            ) : null,
        }}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Koli No ile ara..."
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading && !isRefetching ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.button.primary} />
          <Text style={styles.loadingText}>Koliler Yükleniyor...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {error instanceof Error ? error.message : "Bir hata oluştu"}
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
              tintColor={colors.button.primary}
              colors={[colors.button.primary]}
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
                color={colors.button.primary}
                style={{ margin: 16 }}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Package size={48} color={colors.text.secondary} opacity={0.5} />
              <Text style={styles.emptyText}>Hiç koli bulunamadı.</Text>
            </View>
          }
        />
      )}

      {isSelectionMode && (
        <View style={styles.bottomPanel}>
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
                <Truck size={24} color="#fff" />
                <Text style={styles.submitButtonText}>
                  Seçilenleri İrsaliye Yap ({selectedIds.size})
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: colors.text.secondary,
    fontSize: 16,
  },
  errorText: {
    color: colors.border.error,
    fontSize: 16,
    textAlign: "center",
  },
  emptyText: {
    marginTop: 12,
    color: colors.text.secondary,
    fontSize: 16,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.darker,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: colors.text.primary,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border.default,
  },
  cardSelected: {
    borderColor: colors.button.primary,
    backgroundColor: "rgba(220, 20, 60, 0.05)",
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
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
  },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  submitButton: {
    backgroundColor: "#1976D2",
    borderRadius: 12,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
