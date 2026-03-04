import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Package,
  FileText,
  Lock,
  Unlock,
  Trash2,
  CheckCircle,
} from "lucide-react-native";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Alert,
  Image,
  Animated,
  Easing,
  Keyboard
} from "react-native";
import { useState, useRef } from "react";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { api, KoliDetailItem } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

import colors from "@/constants/colors";

function byteArrayToBase64(
  byteArray: number[] | Uint8Array | string | null | undefined,
): string | null {
  if (!byteArray) return null;

  // If it's already a string (base64), return it
  if (typeof byteArray === "string") {
    return byteArray.trim().length > 0 ? byteArray : null;
  }

  // If it's an array or Uint8Array, convert to base64
  if (Array.isArray(byteArray) || byteArray instanceof Uint8Array) {
    try {
      const bytes = Array.isArray(byteArray)
        ? new Uint8Array(byteArray)
        : byteArray;
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (e) {
      console.log("byteArrayToBase64: Error converting byte array", e);
      return null;
    }
  }

  return null;
}

export default function KoliDetayScreen() {
  const { id, receiptNo, sipExp } = useLocalSearchParams<{
    id: string;
    receiptNo?: string;
    sipExp?: string;
  }>();

  const { credentials } = useAuth();
  const router = useRouter();

  const queryClient = useQueryClient();
  const [showReceiptConfirm, setShowReceiptConfirm] = useState(false);
  const [showCloseBoxModal, setShowCloseBoxModal] = useState(false);
  const [grossWeight, setGrossWeight] = useState("");
  const [netWeight, setNetWeight] = useState("");
  const [weightError, setWeightError] = useState<string | null>(null);
  const [showOpenBoxConfirm, setShowOpenBoxConfirm] = useState(false);

  // --- Toast İçeriği ve Animasyonu ---
  const [toastContent, setToastContent] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(50)).current;

  const showToast = (
    title: string,
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToastContent({ title, message, type });

    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);
  };

  const closeBoxMutation = useMutation({
    mutationFn: async ({
      grossWeight,
      netWeight,
    }: {
      grossWeight: string;
      netWeight: string;
    }) => {
      if (!credentials || !id) {
        throw new Error("No credentials or id available");
      }
      console.log("KoliDetayScreen: Closing box", id, "with weights", {
        grossWeight,
        netWeight,
      });
      return api.koliListesi.closeBox(
        credentials.userCode,
        credentials.password,
        parseInt(id, 10),
        grossWeight,
        netWeight,
      );
    },
    onSuccess: (data) => {
      console.log("KoliDetayScreen: Close box success", data);
      showToast("Başarılı", data.msg || "Koli başarıyla açıldı", "success");
      setShowCloseBoxModal(false);
      setGrossWeight("");
      setNetWeight("");
      queryClient.invalidateQueries({ queryKey: ["koli-detay", id] });
      queryClient.invalidateQueries({ queryKey: ["koli-listesi"] });
    },
    onError: (error) => {
      console.error("KoliDetayScreen: Close box error", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to close box",
      );
    },
  });

  const openBoxMutation = useMutation({
    mutationFn: async () => {
      if (!credentials || !id) {
        throw new Error("No credentials or id available");
      }
      return api.koliListesi.openBox(
        credentials.userCode,
        credentials.password,
        parseInt(id, 10),
      );
    },
    onSuccess: (data) => {
      console.log("KoliDetayScreen: Open box success", data);
      showToast("Başarılı", data.msg || "Koli başarıyla açıldı", "success");
      setShowOpenBoxConfirm(false);
      queryClient.invalidateQueries({ queryKey: ["koli-detay", id] });
      queryClient.invalidateQueries({ queryKey: ["koli-listesi"] });
    },
    onError: (error) => {
      console.error("KoliDetayScreen: Open box error", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to open box",
      );
    },
  });

  const createReceiptMutation = useMutation({
    mutationFn: async () => {
      if (!credentials || !id) {
        throw new Error("No credentials or id available");
      }
      console.log("KoliDetayScreen: Creating receipt for box", id);
      return api.koliListesi.createReceipt(
        credentials.userCode,
        credentials.password,
        parseInt(id, 10),
      );
    },
    onSuccess: (data) => {
      console.log("KoliDetayScreen: Create receipt success", data);
      Alert.alert("Result", data.msg || "Operation completed", [
        {
          text: "OK",
          onPress: () => {
            if (data.resultBoxId) {
              router.replace(`/koli-detay?id=${data.resultBoxId}`);
            } else {
              queryClient.invalidateQueries({ queryKey: ["koli-detay", id] });
            }
          },
        },
      ]);
    },
    onError: (error) => {
      console.error("KoliDetayScreen: Create receipt error", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create receipt",
      );
    },
  });



  const koliDetailQuery = useQuery({
    queryKey: ["koli-detay", id, credentials],
    queryFn: async () => {
      console.log("KoliDetayScreen: Fetching koli detail for id", id);
      if (!credentials || !id) {
        throw new Error("No credentials or id available");
      }
      return api.koliListesi.getDetail(
        credentials.userCode,
        credentials.password,
        parseInt(id, 10),
      );
    },
    enabled: !!credentials && !!id,
  });

  if (koliDetailQuery.isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: "Koli Details" }} />
        <ActivityIndicator size="large" color={colors.button.primary} />
        <Text style={styles.loadingText}>Koli detayları yükleniyor...</Text>
      </View>
    );
  }

  if (koliDetailQuery.isError) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: "Koli Details" }} />
        <AlertCircle size={48} color={colors.border.error} />
        <Text style={styles.errorTitle}>Koli detayı yükleme hatası</Text>
        <Text style={styles.errorText}>
          {koliDetailQuery.error instanceof Error
            ? koliDetailQuery.error.message
            : "An error occurred"}
        </Text>
      </View>
    );
  }

  const items = koliDetailQuery.data || [];

  const renderItem = ({ item }: { item: KoliDetailItem }) => {
    const base64Thumbnail = byteArrayToBase64(
      item.Thumbnail as unknown as number[] | Uint8Array | string | null,
    );
    const hasValidThumbnail = !!base64Thumbnail;

    console.log("KoliDetayScreen: Item thumbnail check", {
      itemName: item.InventoryName,
      hasThumbnail: !!item.Thumbnail,
      thumbnailType: typeof item.Thumbnail,
      isArray: Array.isArray(item.Thumbnail),
      hasValidThumbnail,
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          {hasValidThumbnail ? (
            <Image
              source={{ uri: `data:image/png;base64,${base64Thumbnail}` }}
              style={styles.thumbnailImage}
              resizeMode="cover"
              onError={(e) =>
                console.log(
                  "KoliDetayScreen: Image load error",
                  e.nativeEvent.error,
                )
              }
            />
          ) : (
            <View style={styles.iconContainer}>
              <Package size={24} color={colors.button.primary} />
            </View>
          )}
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.InventoryName}</Text>
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Miktar: </Text>
              <Text style={styles.quantityValue}>{item.Quantity}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Koli #${id}` }} />
      {receiptNo || sipExp ? (
        <View style={styles.receiptBanner}>
          {receiptNo ? (
            <Text style={styles.receiptBannerText}>
              Sipariş No: {receiptNo}
            </Text>
          ) : null}
          {sipExp ? (
            <Text style={styles.sipExpBannerText}>
              {decodeURIComponent(sipExp)}
            </Text>
          ) : null}
        </View>
      ) : null}
      
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.InventoryName}-${index}`}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={48} color={colors.text.secondary} />
            <Text style={styles.emptyText}>Kolide henüz bir şey yok</Text>
          </View>
        }
      />
      
      {/* ----------------- ALT BUTONLAR ----------------- */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            router.push({
              pathname: "/barcode-scanner",
              params: { mode: "add", koliId: id, receiptNo: receiptNo },
            });
          }}
        >
          <Package size={20} color="#000" />
          <Text style={styles.buttonText}>Barkodla{"\n"}Ekleme</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            router.push({
              pathname: "/barcode-scanner",
              params: { mode: "delete", koliId: id, receiptNo: receiptNo },
            });
          }}
        >
          <Trash2 size={20} color="#000" />
          <Text style={styles.buttonText}>Barkodla{"\n"}Silme</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            createReceiptMutation.isPending && styles.disabledButton,
          ]}
          onPress={() => setShowReceiptConfirm(true)}
          disabled={createReceiptMutation.isPending}
        >
          {createReceiptMutation.isPending ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <FileText size={20} color="#000" />
          )}
          <Text style={styles.buttonText}>İrsaliye{"\n"}Oluştur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            openBoxMutation.isPending && styles.disabledButton,
          ]}
          onPress={() => setShowOpenBoxConfirm(true)}
          disabled={openBoxMutation.isPending}
        >
          {openBoxMutation.isPending ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Unlock size={20} color="#000" />
          )}
          <Text style={styles.buttonText}>Koli{"\n"}Açma</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            closeBoxMutation.isPending && styles.disabledButton,
          ]}
          onPress={() => setShowCloseBoxModal(true)}
          disabled={closeBoxMutation.isPending}
        >
          {closeBoxMutation.isPending ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Lock size={20} color="#000" />
          )}
          <Text style={styles.buttonText}>Koli{"\n"}Kapatma</Text>
        </TouchableOpacity>
      </View>

      {/* ----------------- İRSALİYE OLUŞTURMA MODALI ----------------- */}
      <Modal
        visible={showReceiptConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReceiptConfirm(false)}
      >
        <View style={styles.receiptModalOverlay}>
          <View style={styles.receiptModalContent}>
            <View style={styles.receiptIconContainer}>
              <FileText size={48} color="#DC143C" />
            </View>
            <Text style={styles.receiptModalTitle}>İrsaliye Oluştur</Text>
            <Text style={styles.receiptModalSubtitle}>
              İrsaliye oluşturmak istiyor musunuz?
            </Text>
            <View style={styles.receiptModalButtons}>
              <TouchableOpacity
                style={styles.receiptCancelButton}
                onPress={() => setShowReceiptConfirm(false)}
              >
                <Text style={styles.receiptCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.receiptConfirmButton,
                  createReceiptMutation.isPending && styles.disabledButton,
                ]}
                onPress={() => {
                  setShowReceiptConfirm(false);
                  createReceiptMutation.mutate();
                }}
                disabled={createReceiptMutation.isPending}
              >
                {createReceiptMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.receiptConfirmText}>Oluştur</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ----------------- KOLİ KAPATMA (AĞIRLIK) MODALI ----------------- */}
      <Modal
        visible={showCloseBoxModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowCloseBoxModal(false);
          setGrossWeight("");
          setNetWeight("");
          setWeightError(null);
        }}
      >
        <View style={styles.receiptModalOverlay}>
          <View style={styles.closeBoxModalContent}>
            <View style={styles.receiptIconContainer}>
              <Lock size={48} color="#DC143C" />
            </View>
            <Text style={styles.receiptModalTitle}>Koli Kapatma</Text>
            <Text style={styles.receiptModalSubtitle}>Ağırlık giriniz</Text>
            
            <View style={styles.weightInputContainer}>
              <Text style={styles.weightLabel}>Brüt Ağırlık</Text>
              <TextInput
                style={styles.weightInput}
                placeholder="0.00"
                placeholderTextColor={colors.text.secondary}
                value={grossWeight}
                onChangeText={(text) => {
                  setGrossWeight(text);
                  if (weightError) setWeightError(null);
                }}
                keyboardType="decimal-pad"
              />
            </View>
            
            <View style={styles.weightInputContainer}>
              <Text style={styles.weightLabel}>Net Ağırlık</Text>
              <TextInput
                style={styles.weightInput}
                placeholder="0.00"
                placeholderTextColor={colors.text.secondary}
                value={netWeight}
                onChangeText={(text) => {
                  setNetWeight(text);
                  if (weightError) setWeightError(null);
                }}
                keyboardType="decimal-pad"
              />
            </View>

            {/* EKSİK AĞIRLIK UYARISI (KUTU İÇİNDE) */}
            {weightError && (
              <View style={styles.errorBox}>
                <AlertCircle size={16} color="#F44336" />
                <Text style={styles.weightErrorMessage}>{weightError}</Text>
              </View>
            )}

            <View style={styles.receiptModalButtons}>
              <TouchableOpacity
                style={styles.receiptCancelButton}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowCloseBoxModal(false);
                  setGrossWeight("");
                  setNetWeight("");
                  setWeightError(null);
                }}
              >
                <Text style={styles.receiptCancelText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.receiptConfirmButton,
                  closeBoxMutation.isPending && styles.disabledButton,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  
                  if (!grossWeight.trim() || !netWeight.trim()) {
                    setWeightError("Lütfen her iki ağırlığı da giriniz.");
                    return;
                  }
                  
                  setWeightError(null);
                  closeBoxMutation.mutate({
                    grossWeight: grossWeight.trim(),
                    netWeight: netWeight.trim(),
                  });
                }}
                disabled={closeBoxMutation.isPending}
              >
                {closeBoxMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.receiptConfirmText}>Devam</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ----------------- KOLİ AÇMA ONAY MODALI ----------------- */}
      <Modal
        visible={showOpenBoxConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOpenBoxConfirm(false)}
      >
        <View style={styles.receiptModalOverlay}>
          <View style={styles.receiptModalContent}>
            <View
              style={[
                styles.receiptIconContainer,
                { backgroundColor: "rgba(76, 175, 80, 0.15)" },
              ]}
            >
              <Unlock size={48} color="#4CAF50" />
            </View>
            <Text style={styles.receiptModalTitle}>Koli Açma</Text>
            <Text style={styles.receiptModalSubtitle}>
              Koliyi açmak istiyor musunuz?
            </Text>
            <View style={styles.receiptModalButtons}>
              <TouchableOpacity
                style={styles.receiptCancelButton}
                onPress={() => setShowOpenBoxConfirm(false)}
              >
                <Text style={styles.receiptCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.receiptConfirmButton,
                  { backgroundColor: "#4CAF50" },
                  openBoxMutation.isPending && styles.disabledButton,
                ]}
                onPress={() => openBoxMutation.mutate()}
                disabled={openBoxMutation.isPending}
              >
                {openBoxMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.receiptConfirmText}>Devam</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Animated.View
        style={[
          styles.toastContainer,
          {
            opacity: toastOpacity,
            transform: [{ translateY: toastTranslateY }],
          },
        ]}
        pointerEvents="none"
      >
        <View
          style={[
            styles.toastContent,
            toastContent.type === "error" && {
              borderColor: "rgba(244, 67, 54, 0.5)",
            },
          ]}
        >
          {toastContent.type === "success" ? (
            <CheckCircle
              size={24}
              color="#4CAF50"
              fill="rgba(76, 175, 80, 0.1)"
            />
          ) : (
            <AlertCircle
              size={24}
              color="#F44336"
              fill="rgba(244, 67, 54, 0.1)"
            />
          )}

          <View style={{ flex: 1 }}>
            <Text style={styles.toastTitle}>{toastContent.title}</Text>
            <Text style={styles.toastSubtitle}>{toastContent.message}</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  content: {
    padding: 16,
  },
  receiptBanner: {
    backgroundColor: "rgba(220, 20, 60, 0.15)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  receiptBannerText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.button.primary,
    textAlign: "center",
  },
  sipExpBannerText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#4CAF50",
    textAlign: "center",
    marginTop: 4,
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
  cardContent: {
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
  thumbnailImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.background.dark,
  },
  itemInfo: {
    flex: 1,
    gap: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
    lineHeight: 22,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.button.primary,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 32,
    gap: 12,
    backgroundColor: colors.background.dark,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  buttonText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#000",
    textAlign: "center",
    lineHeight: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.text.primary,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
  },
  barcodeInput: {
    backgroundColor: colors.background.dark,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: colors.background.dark,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: colors.button.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: "#e74c3c",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  disabledButton: {
    opacity: 0.6,
  },
  receiptModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  receiptModalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DC143C",
  },
  receiptIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(220, 20, 60, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  receiptModalTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  receiptModalSubtitle: {
    fontSize: 15,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  receiptModalButtons: {
    flexDirection: "row" as const,
    gap: 12,
    width: "100%",
  },
  receiptCancelButton: {
    flex: 1,
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 14,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "#444",
  },
  receiptCancelText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  receiptConfirmButton: {
    flex: 1,
    backgroundColor: "#DC143C",
    borderRadius: 12,
    padding: 14,
    alignItems: "center" as const,
  },
  receiptConfirmText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  closeBoxModalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DC143C",
  },
  weightInputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  weightLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#aaa",
    marginBottom: 8,
  },
  weightInput: {
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#444",
    width: "100%",
  },


 toastContainer: {
    position: "absolute",
    bottom: 120,
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 999,
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.card,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    gap: 12,
  },
  toastTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: colors.text.primary,
  },
  toastSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    flexWrap: "wrap",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(244, 67, 54, 0.3)",
    gap: 8,
    width: "100%",
  },
  weightErrorMessage: {
    color: "#F44336",
    fontSize: 13,
    fontWeight: "600" as const,
    flex: 1,
  },
});