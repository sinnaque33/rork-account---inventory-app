import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Audio } from "expo-av";
import { useApiConfig } from "@/contexts/ApiConfigContext";
import { SOUND_FILES } from "@/constants/sounds";
import {
  AlertCircle,
  Package,
  FileText,
  Lock,
  Unlock,
  Trash2,
  CheckCircle,
  Plus,
  ScanBarcode,
  AlertTriangle,
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
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Vibration,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { byteArrayToBase64 } from "@/utils/imageUtils";

import colors from "@/constants/colors";

export default function KoliDetayScreen() {
  const { t } = useTranslation();
  const {
    id,
    packageNo,
    receiptNo,
    sipExp,
    boxCode,
    alwaysIgnoreLimit: initialIgnoreLimit,
  } = useLocalSearchParams<{
    id: string;
    packageNo?: string;
    receiptNo?: string;
    sipExp?: string;
    boxCode?: string;
    alwaysIgnoreLimit?: string;
  }>();

  const { errorSound } = useApiConfig();

  const playErrorSignal = async () => {
    try {
      Vibration.vibrate(500);
      if (errorSound !== "vibration" && SOUND_FILES[errorSound]) {
        const { sound } = await Audio.Sound.createAsync(
          SOUND_FILES[errorSound],
          { shouldPlay: true },
          undefined,
          true,
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

  const { credentials } = useAuth();

  const queryClient = useQueryClient();
  const [showReceiptConfirm, setShowReceiptConfirm] = useState(false);
  const [showCloseBoxModal, setShowCloseBoxModal] = useState(false);
  const [grossWeight, setGrossWeight] = useState("");
  const [netWeight, setNetWeight] = useState("");
  const [weightError, setWeightError] = useState<string | null>(null);
  const [showOpenBoxConfirm, setShowOpenBoxConfirm] = useState(false);

  // --- BARKOD OKUMA STATE'LERİ ---
  const [scanMode, setScanMode] = useState<"add" | "delete">("add");
  const [barcode, setBarcode] = useState("");
  const inputRef = useRef<TextInput>(null);
  const barcodeValueRef = useRef("");
  const isProcessingRef = useRef(false);

  // --- Miktar Aşımı Onay Modalı State'leri ---
  const [showOverLimitModal, setShowOverLimitModal] = useState(false);
  const [pendingOverLimitBarcode, setPendingOverLimitBarcode] = useState("");
  const [alwaysIgnoreLimit, setAlwaysIgnoreLimit] = useState(
    initialIgnoreLimit === "true",
  );
  // const [activeReceiptNo, setActiveReceiptNo] = useState(receiptNo || "");
  // const [activeSipExp, setActiveSipExp] = useState(sipExp || "");

  // --- BİLDİRİM VE HATA MODAL STATE'LERİ ---
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultData, setResultData] = useState({
    title: "",
    message: "",
    type: "error",
  });

  // --- Toast İçeriği ve Animasyonu ---
  const [toastContent, setToastContent] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(50)).current;

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

  // --- BARKOD OKUMA (MUTATION) ---
  const barcodeMutation = useMutation({
    mutationFn: async ({
      scannedBarcode,
      controlType = 3,
    }: {
      scannedBarcode: string;
      controlType?: number;
    }) => {
      if (!credentials || !id) throw new Error(t("koliDetay.missingInfo"));

      const koliIdNum = parseInt(id, 10);

      if (scanMode === "add") {
        console.log(
          "*****************koli detayda gönderilen controlType: ",
          controlType,
        );

        return await api.koliListesi.addItemByBarcode(
          credentials.userCode,
          credentials.password,
          koliIdNum,
          scannedBarcode,
          undefined,
          controlType,
        );
      } else {
        return await api.koliListesi.deleteItemByBarcode(
          credentials.userCode,
          credentials.password,
          koliIdNum,
          scannedBarcode,
        );
      }
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
      const explanation = data.resultExplanation || data.msg || "";
      const isError =
        (data.err !== 0 && data.err !== undefined) || data.resultError === true;

      if (isError) {
        playErrorSignal();
        setResultData({
          title: t("koliDetay.operationFailed"),
          message: explanation || t("koliDetay.defaultError"),
          type: "error",
        });
        setResultModalVisible(true);
        setBarcode("");
        barcodeValueRef.current = "";
      } else {
        setBarcode("");
        barcodeValueRef.current = "";
        inputRef.current?.focus();

        queryClient.invalidateQueries({ queryKey: ["koli-detay", id] });
        showToast(
          t("koliDetay.success"),
          scanMode === "add"
            ? t("koliDetay.itemAdded")
            : t("koliDetay.itemDeleted"),
          "success",
        );
      }
    },
    onError: (err: Error) => {
      playErrorSignal();
      setBarcode("");
      barcodeValueRef.current = "";
      setResultData({
        title: t("koliDetay.systemError"),
        message: err.message,
        type: "error",
      });
      setResultModalVisible(true);
    },
    onSettled: (data) => {
      if (data?.resultErrorType === 2) {
        return;
      }
      isProcessingRef.current = false;
    },
  });

  const handleBarcodeSubmit = () => {
    const finalBarcode = barcodeValueRef.current.trim();
    if (!finalBarcode || isProcessingRef.current) return;

    isProcessingRef.current = true;

    barcodeMutation.mutate({
      scannedBarcode: finalBarcode,
      controlType: alwaysIgnoreLimit ? -1 : 3,
    });
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
        throw new Error(t("koliDetay.missingInfo"));
      }
      return api.koliListesi.closeBox(
        credentials.userCode,
        credentials.password,
        parseInt(id, 10),
        grossWeight,
        netWeight,
      );
    },
    onSuccess: (data) => {
      showToast(
        t("koliDetay.success"),
        data.msg || t("koliDetay.boxClosed"),
        "success",
      );
      setShowCloseBoxModal(false);
      setGrossWeight("");
      setNetWeight("");
      queryClient.invalidateQueries({ queryKey: ["koli-detay", id] });
      queryClient.invalidateQueries({ queryKey: ["koli-listesi"] });
    },
    onError: (error) => {
      Alert.alert(
        t("koliDetay.error"),
        error instanceof Error ? error.message : t("koliDetay.defaultError"),
      );
    },
  });

  const openBoxMutation = useMutation({
    mutationFn: async () => {
      if (!credentials || !id) {
        throw new Error(t("koliDetay.missingInfo"));
      }
      return api.koliListesi.openBox(
        credentials.userCode,
        credentials.password,
        parseInt(id, 10),
      );
    },
    onSuccess: (data) => {
      showToast(
        t("koliDetay.success"),
        data.msg || t("koliDetay.boxOpened"),
        "success",
      );
      setShowOpenBoxConfirm(false);
      queryClient.invalidateQueries({ queryKey: ["koli-detay", id] });
      queryClient.invalidateQueries({ queryKey: ["koli-listesi"] });
    },
    onError: (error) => {
      Alert.alert(
        t("koliDetay.error"),
        error instanceof Error ? error.message : t("koliDetay.defaultError"),
      );
    },
  });

  const createReceiptMutation = useMutation({
    mutationFn: async () => {
      if (!credentials || !id) {
        throw new Error(t("koliDetay.missingInfo"));
      }
      return api.koliListesi.createReceipt(
        credentials.userCode,
        credentials.password,
        parseInt(id, 10),
      );
    },
    onSuccess: (data) => {
      const isError =
        String(data.success) !== "true" ||
        (data.err !== undefined && data.err !== 0);

      if (isError) {
        playErrorSignal();
        showToast(
          t("koliDetay.operationFailed"),
          data.msg || t("koliDetay.receiptCreateFail"),
          "error",
        );
      } else {
        showToast(
          t("koliDetay.success"),
          data.msg || t("koliDetay.receiptCreated"),
          "success",
        );
        queryClient.invalidateQueries({ queryKey: ["koli-detay", id] });
        queryClient.invalidateQueries({ queryKey: ["koli-listesi"] });
      }
    },
    onError: (error) => {
      playErrorSignal();
      showToast(
        t("koliDetay.systemError"),
        error instanceof Error
          ? error.message
          : t("koliDetay.receiptSystemError"),
        "error",
      );
    },
  });

  const koliDetailQuery = useQuery({
    queryKey: ["koli-detay", id, credentials],
    queryFn: async () => {
      if (!credentials || !id) {
        throw new Error(t("koliDetay.missingInfo"));
      }
      return api.koliListesi.getDetail(
        credentials.userCode,
        credentials.password,
        parseInt(id, 10),
      );
    },
    enabled: !!credentials && !!id,
  });

  // // Koli detay verisi geldiğinde içindeki alanları görmek için logluyoruz
  // useEffect(() => {
  //   if (koliDetailQuery.data && koliDetailQuery.data.length > 0) {
  //     const firstItem = koliDetailQuery.data[0];
      
  //     console.log("\n🔍 --- Koli Detay API'den Gelen İlk Ürün Datası ---");
  //     // JSON.stringify ile objeyi okunaklı bir formatta yazdırıyoruz
  //     console.log(JSON.stringify(firstItem, null, 2)); 
  //     console.log("---------------------------------------------------\n");
  //   }
  // }, [koliDetailQuery.data]);

  const getDisplayValue = (item: any, key: string): string => {
    const val = item[key];
    if (val === null || val === undefined || val === "") return "";
    return String(val);
  };

  if (koliDetailQuery.isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: t("koliDetay.headerFallback") }} />
        <ActivityIndicator size="large" color={colors.button.primary} />
        <Text style={styles.loadingText}>{t("koliDetay.loading")}</Text>
      </View>
    );
  }

  if (koliDetailQuery.isError) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: t("koliDetay.headerFallback") }} />
        <AlertCircle size={48} color={colors.border.error} />
        <Text style={styles.errorTitle}>{t("koliDetay.loadErrorTitle")}</Text>
        <Text style={styles.errorText}>
          {koliDetailQuery.error instanceof Error
            ? koliDetailQuery.error.message
            : t("koliDetay.defaultError")}
        </Text>
      </View>
    );
  }

  const items = koliDetailQuery.data || [];

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const base64Thumbnail = byteArrayToBase64(
      item.Thumbnail as unknown as number[] | Uint8Array | string | null,
    );
    const hasValidThumbnail = !!base64Thumbnail;

    const keys = Object.keys(item);

    const h1Key = keys.find((key) => key.startsWith("h1_"));
    const itemTitle = h1Key
      ? getDisplayValue(item, h1Key)
      : item.InventoryName || `${t("koliDetay.itemFallback")}${index + 1}`;

    const h2Key = keys.find((key) => key.startsWith("h2_"));
    let quantityLabel = t("koliDetay.quantity");
    let quantityValue = String(item.Quantity || "");

    if (h2Key) {
      quantityLabel = h2Key.replace("h2_", "");
      const rawQuantity = item[h2Key];

      const isBarcodeOrSerial = /barkod|seri|kod|no|ean/i.test(quantityLabel);
      const isVeryLargeNumber = String(rawQuantity).trim().length >= 8;

      quantityValue =
        rawQuantity &&
        !isNaN(Number(rawQuantity)) &&
        !isBarcodeOrSerial &&
        !isVeryLargeNumber
          ? Number(rawQuantity).toFixed(2)
          : String(rawQuantity || "");
    }

    const dynamicFields = keys
      .filter((key) => key.startsWith("sh_"))
      .slice(0, 6);

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          {hasValidThumbnail ? (
            <Image
              source={{ uri: `data:image/png;base64,${base64Thumbnail}` }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.iconContainer}>
              <Package size={24} color={colors.button.primary} />
            </View>
          )}

          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={3}>
              {itemTitle}
            </Text>

            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>{quantityLabel}: </Text>
              <Text style={styles.quantityValue}>{quantityValue}</Text>
            </View>

            {dynamicFields.length > 0 && (
              <View style={styles.dynamicFieldsContainer}>
                {dynamicFields.map((key) => {
                  const val = getDisplayValue(item, key);
                  const displayVal = val ? val : " ";

                  return (
                    <View key={key} style={styles.dynamicFieldRow}>
                      <Text style={styles.fieldLabel}>
                        {key.replace("sh_", "")}:
                      </Text>
                      <Text
                        style={[
                          styles.fieldValue,
                          { color: colors.status.success, fontWeight: "700" },
                        ]}
                        numberOfLines={1}
                      >
                        {displayVal}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
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
          title: packageNo
            ? `${t("koliDetay.boxNo")}${packageNo}`
            : boxCode
              ? `${t("koliDetay.boxNo")}${boxCode}`
              : t("koliDetay.headerFallback"),
        }}
      />
      {receiptNo || sipExp ? (
        <View style={styles.receiptBanner}>
          {receiptNo ? (
            <Text style={styles.receiptBannerText}>
              {t("koliDetay.orderNo")}
              {receiptNo}
            </Text>
          ) : null}
          {sipExp ? (
            <Text style={styles.sipExpBannerText}>
              {decodeURIComponent(sipExp)}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* --- YENİ EKLENEN BARKOD OKUMA ALANI --- */}
      <View style={styles.topSection}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              scanMode === "add" && styles.toggleBtnActiveAdd,
            ]}
            onPress={() => {
              setScanMode("add");
              inputRef.current?.focus();
            }}
            activeOpacity={0.8}
          >
            <Plus
              size={18}
              color={scanMode === "add" ? "#fff" : colors.text.secondary}
            />
            <Text
              style={[
                styles.toggleText,
                scanMode === "add" && { color: "#fff" },
              ]}
            >
              {t("koliDetay.addMaterial")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              scanMode === "delete" && styles.toggleBtnActiveDelete,
            ]}
            onPress={() => {
              setScanMode("delete");
              inputRef.current?.focus();
            }}
            activeOpacity={0.8}
          >
            <Trash2
              size={18}
              color={scanMode === "delete" ? "#fff" : colors.text.secondary}
            />
            <Text
              style={[
                styles.toggleText,
                scanMode === "delete" && { color: "#fff" },
              ]}
            >
              {t("koliDetay.deleteMaterial")}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.barcodeInputWrapper,
            scanMode === "delete" && { borderColor: "rgba(244, 67, 54, 0.5)" },
          ]}
        >
          <ScanBarcode
            size={22}
            color={scanMode === "delete" ? "#F44336" : colors.button.primary}
          />
          <TextInput
            ref={inputRef}
            style={styles.barcodeInputTop}
            value={barcode}
            onChangeText={(text) => {
              setBarcode(text);
              barcodeValueRef.current = text;
            }}
            onSubmitEditing={handleBarcodeSubmit}
            placeholder={
              scanMode === "add"
                ? t("koliDetay.placeholderAdd")
                : t("koliDetay.placeholderDelete")
            }
            placeholderTextColor={colors.text.secondary}
            autoFocus
            blurOnSubmit={false}
          />
          {barcodeMutation.isPending && (
            <ActivityIndicator size="small" color={colors.button.primary} />
          )}
        </View>
      </View>
      {/* -------------------------------------- */}

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.InventoryName}-${index}`}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={48} color={colors.text.secondary} />
            <Text style={styles.emptyText}>{t("koliDetay.emptyBox")}</Text>
          </View>
        }
      />

      {/* ALT BUTONLAR */}
      <View style={styles.buttonContainer}>
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
          <Text style={styles.buttonText}>
            {t("koliDetay.btnCreateReceipt")}
          </Text>
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
          <Text style={styles.buttonText}>{t("koliDetay.btnOpenBox")}</Text>
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
          <Text style={styles.buttonText}>{t("koliDetay.btnCloseBox")}</Text>
        </TouchableOpacity>
      </View>

      {/* --- MODALLAR --- */}
      <Modal
        visible={resultModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResultModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resultModalContent}>
            <View
              style={[
                styles.resultIconContainer,
                { backgroundColor: "rgba(244, 67, 54, 0.1)" },
              ]}
            >
              <AlertCircle size={48} color="#F44336" />
            </View>
            <Text style={styles.resultTitle}>{resultData.title}</Text>
            <Text style={styles.resultMessage}>{resultData.message}</Text>
            <TouchableOpacity
              style={styles.resultCancelButton}
              onPress={() => {
                setResultModalVisible(false);
                inputRef.current?.focus();
              }}
            >
              <Text style={styles.resultCancelText}>{t("koliDetay.ok")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
            <Text style={styles.receiptModalTitle}>
              {t("koliDetay.modals.receiptTitle")}
            </Text>
            <Text style={styles.receiptModalSubtitle}>
              {t("koliDetay.modals.receiptSubtitle")}
            </Text>
            <View style={styles.receiptModalButtons}>
              <TouchableOpacity
                style={styles.receiptCancelButton}
                onPress={() => setShowReceiptConfirm(false)}
              >
                <Text style={styles.receiptCancelText}>
                  {t("koliDetay.cancel")}
                </Text>
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
                  <Text style={styles.receiptConfirmText}>
                    {t("koliDetay.create")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
            <Text style={styles.receiptModalTitle}>
              {t("koliDetay.modals.closeTitle")}
            </Text>
            <Text style={styles.receiptModalSubtitle}>
              {t("koliDetay.modals.closeSubtitle")}
            </Text>

            <View style={styles.weightInputContainer}>
              <Text style={styles.weightLabel}>
                {t("koliDetay.modals.grossWeight")}
              </Text>
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
              <Text style={styles.weightLabel}>
                {t("koliDetay.modals.netWeight")}
              </Text>
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
                <Text style={styles.receiptCancelText}>
                  {t("koliDetay.cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.receiptConfirmButton,
                  closeBoxMutation.isPending && styles.disabledButton,
                ]}
                onPress={() => {
                  Keyboard.dismiss();

                  if (!grossWeight.trim() || !netWeight.trim()) {
                    setWeightError(t("koliDetay.modals.weightRequired"));
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
                  <Text style={styles.receiptConfirmText}>
                    {t("koliDetay.continue")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
            <Text style={styles.receiptModalTitle}>
              {t("koliDetay.modals.openTitle")}
            </Text>
            <Text style={styles.receiptModalSubtitle}>
              {t("koliDetay.modals.openSubtitle")}
            </Text>
            <View style={styles.receiptModalButtons}>
              <TouchableOpacity
                style={styles.receiptCancelButton}
                onPress={() => setShowOpenBoxConfirm(false)}
              >
                <Text style={styles.receiptCancelText}>
                  {t("koliDetay.cancel")}
                </Text>
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
                  <Text style={styles.receiptConfirmText}>
                    {t("koliDetay.continue")}
                  </Text>
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
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  topSection: {
    backgroundColor: colors.background.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    gap: 12,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: colors.background.darker,
    borderRadius: 10,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  toggleBtnActiveAdd: {
    backgroundColor: colors.button.primary,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  toggleBtnActiveDelete: {
    backgroundColor: "#E53935",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: "Segoe UI",
    fontWeight: "600",
    color: colors.text.secondary,
  },
  barcodeInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.darker,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
    gap: 12,
  },
  barcodeInputTop: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Segoe UI",
    fontWeight: "600",
    color: colors.text.primary,
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
    fontFamily: "Segoe UI",
    fontWeight: "600" as const,
    color: colors.button.primary,
    textAlign: "center",
  },
  sipExpBannerText: {
    fontSize: 13,
    fontFamily: "Segoe UI",
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
    fontFamily: "Segoe UI",
    color: colors.text.secondary,
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: "Segoe UI",
    fontWeight: "600" as const,
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
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Segoe UI",
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
    alignItems: "flex-start",
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
    gap: 4,
  },
  itemName: {
    fontSize: 15,
    fontFamily: "Segoe UI",
    fontWeight: "600" as const,
    color: colors.text.primary,
    lineHeight: 20,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  quantityLabel: {
    fontSize: 13,
    fontFamily: "Segoe UI",
    color: colors.text.secondary,
    lineHeight: 18,
  },
  quantityValue: {
    fontSize: 13,
    fontFamily: "Segoe UI",
    fontWeight: "700" as const,
    color: colors.status.success,
    lineHeight: 18,
  },
  dynamicFieldsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    gap: 4,
  },
  dynamicFieldRow: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: "Segoe UI",
    fontWeight: "700",
    color: colors.text.secondary,
    marginRight: 4,
  },
  fieldValue: {
    fontSize: 11,
    fontFamily: "Segoe UI",
    color: colors.text.primary,
    flexShrink: 1,
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
    fontSize: 12,
    fontFamily: "Segoe UI",
    fontWeight: "700" as const,
    color: "#000",
    textAlign: "center",
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  resultModalContent: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  resultIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontFamily: "Segoe UI",
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  resultMessage: {
    fontSize: 14,
    fontFamily: "Segoe UI",
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  resultCancelButton: {
    backgroundColor: colors.background.darker,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.default,
    width: "100%",
  },
  resultCancelText: {
    fontSize: 15,
    fontFamily: "Segoe UI",
    fontWeight: "600",
    color: colors.text.primary,
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
    fontFamily: "Segoe UI",
    fontWeight: "700" as const,
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  receiptModalSubtitle: {
    fontSize: 15,
    fontFamily: "Segoe UI",
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
    fontFamily: "Segoe UI",
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
    fontFamily: "Segoe UI",
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
    fontFamily: "Segoe UI",
    fontWeight: "600" as const,
    color: "#aaa",
    marginBottom: 8,
  },
  weightInput: {
    backgroundColor: "#333",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: "Segoe UI",
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
    fontFamily: "Segoe UI",
    fontWeight: "700" as const,
    color: colors.text.primary,
  },
  toastSubtitle: {
    fontSize: 13,
    fontFamily: "Segoe UI",
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
    fontFamily: "Segoe UI",
    fontWeight: "600" as const,
    flex: 1,
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
});
