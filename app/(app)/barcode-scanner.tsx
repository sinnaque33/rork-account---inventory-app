import { useState, useEffect, useRef } from "react";
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

export default function BarcodeScannerScreen() {
  const router = useRouter();
  const { errorSound } = useApiConfig();
  const playErrorSignal = async () => {
    try {
      // Her zaman titret
      Vibration.vibrate(500);

      // Ayar "vibration" değilse ve ses dosyası varsa çal
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

  // Sayfa açıldığında veya modal kapandığında inputa odaklan
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
    mutationFn: async (scannedBarcode: string) => {
      if (!credentials) throw new Error("No credentials available");

      // DURUM 1: SİPARİŞTEN YENİ KOLİ OLUŞTURMA VE İLK ÜRÜNÜ EKLEME
      if (params.mode === "create_from_order" && params.orderReceiptId) {
        console.log(
          `Siparişten (${params.orderReceiptId}) koli oluşturuluyor...`,
        );

        const koliResult = await api.koliListesi.createKoliFromOrderReceipt(
          credentials.userCode,
          credentials.password,
          parseInt(params.orderReceiptId, 10),
        );

        if (!koliResult.resultBoxId) {
          throw new Error("Koli oluşturulamadı veya ID alınamadı.");
        }

        const newKoliId = koliResult.resultBoxId;
        console.log(
          `Koli oluşturuldu (ID: ${newKoliId}), ürün ekleniyor: ${scannedBarcode}`,
        );

        const addItemResult = await api.koliListesi.addItemByBarcode(
          credentials.userCode,
          credentials.password,
          newKoliId,
          scannedBarcode,
        );

        return {
          mode: "create_from_order",
          resultBoxId: newKoliId,
          addResult: addItemResult,
        };
      }

      // DURUM 2: Mevcut Koliye Ürün Ekleme veya Silme Modu
      if (params.mode && params.koliId) {
        const koliIdNum = parseInt(params.koliId, 10);

        if (params.mode === "add") {
          return await api.koliListesi.addItemByBarcode(
            credentials.userCode,
            credentials.password,
            koliIdNum,
            scannedBarcode,
          );
        } else if (params.mode === "delete") {
          return await api.koliListesi.deleteItemByBarcode(
            credentials.userCode,
            credentials.password,
            koliIdNum,
            scannedBarcode,
          );
        }
      }

      // DURUM 3: Varsayılan (Koli Arama) Modu
      const barcodeResult = await api.koliListesi.getKoliDetailByBarcode(
        credentials.userCode,
        credentials.password,
        scannedBarcode,
      );
      if (barcodeResult.err === 99)
        return { err: 99, msg: barcodeResult.msg, mode: "search" };
      if (!barcodeResult.recId)
        throw new Error("Bu barkoda ait koli bulunamadı");

      return { recId: barcodeResult.recId, mode: "search" };
    },
    onSuccess: (data: any) => {
      setBarcode("");
      inputRef.current?.focus();

      const explanation =
        data.addResult?.resultExplanation || data.resultExplanation || data.msg;

      // Koli kodunu yakala
      const extractedBoxCode =
        data.boxCode ||
        data.addResult?.boxCode ||
        (data.resultBoxId ? String(data.resultBoxId) : null);

      if (extractedBoxCode) {
        setDisplayBoxCode(extractedBoxCode);
      }

      // Yeni Siparişten Koli Oluşturma Durumu
      if (data.mode === "create_from_order") {
        queryClient.invalidateQueries({ queryKey: ["koli-listesi"] });
        router.replace({
          pathname: "/(app)/koli-detay",
          params: {
            id: data.resultBoxId.toString(),
            boxCode: extractedBoxCode,
            receiptNo: params.receiptNo,
            initialSuccessMsg: explanation,
          },
        } as any);
        return;
      }

      // Seri Okuma (Ekleme/Silme) Durumu
      if (data.mode !== "search") {
        const isError = data.err !== 0 && data.err !== undefined;

        if (isError) {
          playErrorSignal();
          setSuccessMessage(null);
          setResultData({
            title: "İşlem Başarısız",
            message: explanation || "Hata oluştu.",
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

          // Toast gösterimi
          const isAdd = params.mode === "add";
          showSuccessToast(
            "Başarılı",
            isAdd ? "Ürün eklendi" : "Ürün silindi",
            "success",
          );
        }
      }
      // Koli Arama Durumu
      else {
        if (data.err === 99) {
          setResultData({
            title: "Bulunamadı",
            message: data.msg,
            type: "error",
          });
          setResultModalVisible(true);
        } else if (data.recId) {
          router.replace(`/(app)/koli-detay?id=${data.recId}` as any);
        }
      }
    },
    onError: (error: Error) => {
      playErrorSignal();
      setResultData({
        title: "Sistem Hatası",
        message: error.message,
        type: "error",
      });
      setResultModalVisible(true);
      setBarcode("");
    },
  });

  const handleBarcodeSubmit = () => {
    const finalBarcode = barcodeValueRef.current.trim();
    if (!finalBarcode || barcodeMutation.isPending) return;
    setSuccessMessage(null);
    barcodeMutation.mutate(finalBarcode);
  };

  // Dinamik Başlık ve Alt Başlıklar
  const getTitles = () => {
    if (params.mode === "create_from_order") {
      const acc = params.accountName || "Cari Seçildi";
      const rec = params.receiptNo ? `(Fiş: ${params.receiptNo})` : "";

      return {
        title: "Siparişten Koli Aç",
        subtitle: `${acc} - ${rec}
        İlk ürünü okutun`,
      };
    }
    if (params.mode === "add") {
      return {
        title: "Ürün Ekle",
        subtitle: `Koli #${displayBoxCode || params.koliId} içine ürün ekleniyor`,
      };
    }
    if (params.mode === "delete") {
      return {
        title: "Ürün Sil",
        subtitle: `Koli #${displayBoxCode || params.koliId} içinden ürün siliniyor`,
      };
    }
    return { title: "Koli Ara", subtitle: "Koli bilgisini görmek için okutun" };
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
        <Text style={styles.headerTitle}>Barkod Okutun</Text>
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

      {/* İÇERİK (Kamarasız, İkonlu Tasarım) */}
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
            placeholder="Okutun veya yazın..."
            placeholderTextColor={colors.text.secondary}
            autoFocus
            blurOnSubmit={false} // Enter'a basınca focus gitmesin (Seri okuma için kritik)
            showSoftInputOnFocus={true} // Klavyeyi aç
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
              <Text style={styles.submitButtonText}>Gönder</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* SONUÇ (HATA) MODALI */}
      <Modal
        visible={resultModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResultModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View
              style={[
                styles.resultIconContainer,
                { backgroundColor: "rgba(244, 67, 54, 0.1)" },
              ]}
            >
              <AlertTriangle size={48} color="#F44336" />
            </View>
            <Text style={styles.resultTitle}>{resultData.title}</Text>
            <Text style={styles.resultMessage}>{resultData.message}</Text>
            <TouchableOpacity
              style={[
                styles.resultButton,
                { backgroundColor: colors.background.darker },
              ]}
              onPress={() => {
                setResultModalVisible(false);
                inputRef.current?.focus(); // Kapanınca okuyucuya dön
              }}
            >
              <Text
                style={[
                  styles.resultButtonText,
                  { color: colors.text.primary },
                ]}
              >
                Tekrar Dene
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BAŞARI BİLDİRİMİ (Seri Okuma Toast'u) */}
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
