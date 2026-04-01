import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { CommonActions, useNavigation } from "@react-navigation/native";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  ScanBarcode,
  CheckCircle,
  AlertTriangle,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import colors from "@/constants/colors";
import { api } from "@/services/api";
import { Audio } from "expo-av";
import { Vibration } from "react-native";
import { useApiConfig } from "@/contexts/ApiConfigContext";
import { SOUND_FILES } from "@/constants/sounds";
import ResultModal from "../components/ResultModal";

export default function BarcodeScannerScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { errorSound, useExistingBox } = useApiConfig();
  const playErrorSignal = async () => {
    try {
      Vibration.vibrate(500);
      if (errorSound !== "vibration" && SOUND_FILES[errorSound]) {
        const { sound } = await Audio.Sound.createAsync(
          SOUND_FILES[errorSound],
          { shouldPlay: true },
        );
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      }
    } catch (e) {
      console.log("Ses çalma hatası:", e);
    }
  };
  const params = useLocalSearchParams<{
    mode?: string;
    koliId?: string;
    orderReceiptId?: string;
    accountName?: string;
    receiptNo?: string;
  }>();

  const { credentials } = useAuth();
  const queryClient = useQueryClient();
  const inputRef = useRef<TextInput>(null);
  const barcodeValueRef = useRef("");
  const isProcessingRef = useRef(false);

  const [barcode, setBarcode] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [displayBoxCode, setDisplayBoxCode] = useState<string | null>(
    params.receiptNo || null,
  );

  // Hata Modalı State'leri
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultData, setResultData] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });

  // --- Miktar Aşımı Onay Modalı State'leri ---
  const [showOverLimitModal, setShowOverLimitModal] = useState(false);
  const [pendingOverLimitBarcode, setPendingOverLimitBarcode] = useState("");
  const [alwaysIgnoreLimit, setAlwaysIgnoreLimit] = useState(false);

  // --- Toast İçeriği ve Animasyonu ---
  const [toastContent, setToastContent] = useState({
    title: "",
    message: "",
    type: "success",
  });
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(50)).current;

  const showSuccessToast = (
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
    }, 1500);
  };

  useEffect(() => {
    const focusInput = () => {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    };
    focusInput();
  }, [resultModalVisible]);

  // --- API İŞLEMLERİ (MUTATION) ---
  const barcodeMutation = useMutation({
    mutationFn: async ({
      scannedBarcode,
      controlType = 3,
    }: {
      scannedBarcode: string;
      controlType?: number;
    }) => {
      if (!credentials) throw new Error("No credentials available");

      // DURUM 1: SİPARİŞTEN YENİ KOLİ OLUŞTURMA VE İLK ÜRÜNÜ EKLEME (Servis 1 veya 101)
      if (params.mode === "create_from_order" && params.orderReceiptId) {
        console.log(
          `Siparişten (${params.orderReceiptId}) koli oluşturuluyor...`,
        );
        console.log("barkod scannerde gönderilen controlType: ", controlType);

        const koliResult = await api.koliListesi.createKoliFromOrderReceipt(
          credentials.userCode,
          credentials.password,
          parseInt(params.orderReceiptId, 10),
          scannedBarcode,
          useExistingBox,
          controlType,
        );

        return { ...koliResult, mode: "create_from_order", scannedBarcode };
      }
      // SİPARİŞTEN BAĞIMSIZ KOLİ OLUŞTURMA
      if (params.mode === "create_standalone") {
        console.log("Siparişten bağımsız koli oluşturuluyor...");

        const koliResult = await api.koliListesi.createKoliFromOrderReceipt(
          credentials.userCode,
          credentials.password,
          0,
          scannedBarcode,
          useExistingBox,
          controlType,
        );

        return { ...koliResult, mode: "create_from_order", scannedBarcode };
      }

      // DURUM 2: MEVCUT KOLİYE ÜRÜN EKLEME VEYA SİLME (Servis 11 veya Silme)
      if (params.mode && params.koliId) {
        const koliIdNum = parseInt(params.koliId, 10);

        if (params.mode === "add") {
          const addResult = await api.koliListesi.addItemByBarcode(
            credentials.userCode,
            credentials.password,
            koliIdNum,
            scannedBarcode,
            undefined,
            controlType,
          );
          return { ...addResult, mode: "add", scannedBarcode };
        } else if (params.mode === "delete") {
          const deleteResult = await api.koliListesi.deleteItemByBarcode(
            credentials.userCode,
            credentials.password,
            koliIdNum,
            scannedBarcode,
          );
          return { ...deleteResult, mode: "delete", scannedBarcode };
        }
      }

      // DURUM 3: VARSAYILAN (KOLİ ARAMA) MODU
      const barcodeResult = await api.koliListesi.getKoliDetailByBarcode(
        credentials.userCode,
        credentials.password,
        scannedBarcode,
      );

      return {
        ...barcodeResult,
        mode: "search",
        scannedBarcode,
        success: barcodeResult.success || "true",
        err: barcodeResult.err ?? 0,
      };
    },

    onSuccess: (data: any, variables) => {
      // --- ÖZEL DURUM: Miktar Aşımı Kontrolü ---
      if (data.resultErrorType === 2) {
        playErrorSignal();

        setBarcode("");
        barcodeValueRef.current = "";
        setPendingOverLimitBarcode(variables.scannedBarcode);
        setShowOverLimitModal(true);
        return;
      }

      // --- STANDART AKIŞ ---
      setBarcode("");
      barcodeValueRef.current = "";
      inputRef.current?.focus();

      const explanation = data.resultExplanation || data.msg || "";
      const isError =
        String(data.success) !== "true" ||
        (data.err !== 0 && data.err !== undefined) ||
        data.resultError === true;

      const extractedBoxCode =
        data.resultBoxCode ||
        data.boxCode ||
        (data.resultBoxId ? String(data.resultBoxId) : null);

      if (extractedBoxCode) {
        setDisplayBoxCode(extractedBoxCode);
      }

      if (data.mode === "create_from_order") {
        if (isError) {
          playErrorSignal();
          setResultData({
            title: t("scanner.operationFailed"),
            message: explanation || t("scanner.createBoxError"),
            type: "error",
          });
          setResultModalVisible(true);
        } else {
          queryClient.invalidateQueries({ queryKey: ["koli-listesi"] });
          navigation.dispatch((state) => {
            const koliListesiIndex = state.routes.findIndex(
              (r) => r.name === "koli-listesi",
            );

            if (koliListesiIndex !== -1) {
              const newRoutes = state.routes.slice(0, koliListesiIndex + 1);
              newRoutes.push({
                name: "koli-detay",
                params: {
                  id: data.resultBoxId?.toString(),
                  packageNo: extractedBoxCode,
                  boxCode: extractedBoxCode,
                  receiptNo: params.receiptNo,
                  initialSuccessMsg: explanation,
                  alwaysIgnoreLimit: alwaysIgnoreLimit ? "true" : "false",
                },
              } as any);

              return CommonActions.reset({
                index: newRoutes.length - 1,
                routes: newRoutes,
              } as any);
            } else {
              return CommonActions.reset({
                index: 2,
                routes: [
                  { name: "dashboard" },
                  { name: "koli-listesi" },
                  {
                    name: "koli-detay",
                    params: {
                      id: data.resultBoxId?.toString(),
                      packageNo: extractedBoxCode,
                      boxCode: extractedBoxCode,
                      receiptNo: params.receiptNo,
                      initialSuccessMsg: explanation,
                      alwaysIgnoreLimit: alwaysIgnoreLimit ? "true" : "false",
                    },
                  },
                ],
              } as any);
            }
          });
        }
        return;
      }

      if (data.mode === "add" || data.mode === "delete") {
        if (isError) {
          playErrorSignal();
          setSuccessMessage(null);
          setResultData({
            title: t("scanner.operationFailed"),
            message: explanation || t("scanner.systemError"),
            type: "error",
          });
          setResultModalVisible(true);
        } else {
          if (params.koliId) {
            queryClient.invalidateQueries({
              queryKey: ["koli-detay", params.koliId],
            });
          }
          setSuccessMessage(explanation);
          showSuccessToast(
            t("scanner.success"),
            data.mode === "add"
              ? t("scanner.itemAdded")
              : t("scanner.itemDeleted"),
            "success",
          );
        }
        return;
      }

      if (data.mode === "search") {
        if (data.err === 99 || data.err === 1 || isError) {
          playErrorSignal();
          setResultData({
            title: t("scanner.boxNotFoundTitle"),
            message: data.msg || t("scanner.boxNotFoundMsg"),
            type: "error",
          });
          setResultModalVisible(true);
        } else if (data.recId) {
          let cleanPackageNo = data.scannedBarcode || "";
          if (
            cleanPackageNo.toUpperCase().startsWith("P1") ||
            cleanPackageNo.toUpperCase().startsWith("P2")
          ) {
            cleanPackageNo = cleanPackageNo.substring(2);
          }
          navigation.dispatch((state: any) => {
            const koliListesiIndex = state.routes.findIndex(
              (r: any) => r.name === "koli-listesi",
            );

            if (koliListesiIndex !== -1) {
              const newRoutes = state.routes.slice(0, koliListesiIndex + 1);
              newRoutes.push({
                name: "koli-detay",
                params: {
                  id: data.recId,
                  packageNo: cleanPackageNo,
                  receiptNo: data.receiptNo || "",
                  sipExp: data.sipExp || "",
                },
              });

              return CommonActions.reset({
                index: newRoutes.length - 1,
                routes: newRoutes,
              });
            } else {
              return CommonActions.reset({
                index: 2,
                routes: [
                  { name: "dashboard" },
                  { name: "koli-listesi" },
                  {
                    name: "koli-detay",
                    params: {
                      id: data.recId,
                      packageNo: cleanPackageNo,
                      receiptNo: data.receiptNo || "",
                      sipExp: data.sipExp || "",
                    },
                  },
                ],
              });
            }
          });
        }
      }
    },
    onError: (error: Error) => {
      playErrorSignal();
      setResultData({
        title: t("scanner.systemError"),
        message: error.message,
        type: "error",
      });
      setResultModalVisible(true);
      setBarcode("");
      barcodeValueRef.current = "";
    },
    onSettled: (data) => {
      if (
        data &&
        (data.resultError === true || data.err !== 0) &&
        data.resultErrorType === 2
      ) {
        return;
      }
      isProcessingRef.current = false;
    },
  });

  const handleBarcodeSubmit = () => {
    const finalBarcode = barcodeValueRef.current.trim();
    if (!finalBarcode || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setSuccessMessage(null);

    barcodeMutation.mutate({
      scannedBarcode: finalBarcode,
      controlType: alwaysIgnoreLimit ? -1 : 3,
    });
  };

  const getTitles = () => {
    if (params.mode === "create_from_order") {
      const acc = params.accountName || t("scanner.titles.accountSelected");
      const rec = params.receiptNo
        ? t("scanner.titles.receiptNo", { no: params.receiptNo })
        : "";

      return {
        title: t("scanner.titles.createFromOrder"),
        subtitle: `${acc} - ${rec}\n${t("scanner.titles.firstItemPrompt")}`,
      };
    }
    if (params.mode === "create_standalone") {
      return {
        title: t("scanner.titles.createStandalone", "Bağımsız Koli Oluştur"),
        subtitle: t(
          "scanner.titles.standaloneSubtitle",
          "Koliye eklenecek ilk ürünün barkodunu okutun.",
        ),
      };
    }
    if (params.mode === "add") {
      return {
        title: t("scanner.titles.addMode"),
        subtitle: t("scanner.titles.addSubtitle", {
          id: displayBoxCode || params.koliId,
        }),
      };
    }
    if (params.mode === "delete") {
      return {
        title: t("scanner.titles.deleteMode"),
        subtitle: t("scanner.titles.deleteSubtitle", {
          id: displayBoxCode || params.koliId,
        }),
      };
    }
    return {
      title: t("scanner.titles.searchMode"),
      subtitle: t("scanner.titles.searchSubtitle"),
    };
  };

  const { title, subtitle } = getTitles();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <X size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("scanner.headerTitle")}</Text>
        <TouchableOpacity
          style={[
            styles.headerButton,
            { backgroundColor: colors.button.primary },
          ]}
          onPress={() => router.replace("/(app)/dashboard")}
        >
          <CheckCircle size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* İÇERİK */}
      <View style={styles.content}>
        <View
          style={[
            styles.iconCircle,
            params.mode === "delete" && { borderColor: "#e74c3c" },
          ]}
        >
          <ScanBarcode
            size={64}
            color={params.mode === "delete" ? "#e74c3c" : colors.button.primary}
          />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.inputSection}>
          <TextInput
            ref={inputRef}
            style={styles.barcodeInput}
            value={barcode}
            onChangeText={(text) => {
              setBarcode(text);
              barcodeValueRef.current = text;
            }}
            onSubmitEditing={handleBarcodeSubmit}
            placeholder={t("scanner.placeholder")}
            placeholderTextColor={colors.text.secondary}
            autoFocus
            blurOnSubmit={false}
            showSoftInputOnFocus={true}
            selectTextOnFocus={true}
          />
          {successMessage && (
            <View style={styles.resultExplanationBox}>
              <CheckCircle size={18} color="#2E7D32" />
              <Text style={styles.resultExplanationText}>{successMessage}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              params.mode === "delete" && { backgroundColor: "#e74c3c" },
              (!barcode.trim() || barcodeMutation.isPending) && {
                opacity: 0.5,
              },
            ]}
            onPress={handleBarcodeSubmit}
            disabled={!barcode.trim() || barcodeMutation.isPending}
          >
            {barcodeMutation.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {t("scanner.submitButton")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* SONUÇ (HATA) MODALI */}
      <ResultModal
        visible={resultModalVisible}
        onClose={() => {
          setResultModalVisible(false);
          inputRef.current?.focus();
        }}
        title={resultData.title}
        message={resultData.message}
        type={resultData.type as "success" | "error" | "warning"}
      />

      {/* BAŞARI BİLDİRİMİ */}
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
            <X size={24} color="#F44336" />
          )}

          <View>
            <Text style={styles.toastTitle}>{toastContent.title}</Text>
            <Text style={styles.toastSubtitle}>{toastContent.message}</Text>
          </View>
        </View>
      </Animated.View>
      {/* MİKTAR AŞIMI ONAY MODALI */}
      <Modal
        visible={showOverLimitModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowOverLimitModal(false);
          isProcessingRef.current = false;
          inputRef.current?.focus();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View
              style={[
                styles.resultIconContainer,
                { backgroundColor: "rgba(255, 152, 0, 0.1)" },
              ]}
            >
              <AlertTriangle size={48} color="#FF9800" />
            </View>
            <Text style={styles.resultTitle}>
              {t("scanner.overLimit.title")}
            </Text>
            <Text style={styles.resultMessage}>
              {t("scanner.overLimit.message")}
            </Text>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <TouchableOpacity
                style={[
                  styles.resultButton,
                  { flex: 1, backgroundColor: colors.background.darker },
                ]}
                onPress={() => {
                  setShowOverLimitModal(false);
                  isProcessingRef.current = false;
                  inputRef.current?.focus();
                }}
              >
                <Text
                  style={[
                    styles.resultButtonText,
                    { color: colors.text.secondary },
                  ]}
                >
                  {t("scanner.overLimit.cancelBtn")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.resultButton,
                  {
                    flex: 1,
                    backgroundColor: "#FF9800",
                    borderColor: "#FF9800",
                  },
                ]}
                onPress={() => {
                  setShowOverLimitModal(false);
                  setAlwaysIgnoreLimit(true);
                  barcodeMutation.mutate({
                    scannedBarcode: pendingOverLimitBarcode,
                    controlType: -1,
                  });
                }}
              >
                <Text style={[styles.resultButtonText, { color: "#fff" }]}>
                  {t("scanner.overLimit.confirmBtn")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.dark },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.background.card,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: colors.text.primary },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 40,
  },
  inputSection: { width: "100%", position: "relative" },
  barcodeInput: {
    width: "100%",
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 18,
    fontSize: 18,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  resultIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    alignSelf: "center",
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  resultMessage: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  resultButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  resultButtonText: { fontSize: 16, fontWeight: "600" },
  submitButton: {
    marginTop: 16,
    backgroundColor: colors.button.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  toastContainer: {
    position: "absolute",
    bottom: 40,
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
    fontWeight: "700",
    color: colors.text.primary,
  },
  toastSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  resultExplanationBox: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.3)",
    gap: 10,
  },
  resultExplanationText: {
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
});
