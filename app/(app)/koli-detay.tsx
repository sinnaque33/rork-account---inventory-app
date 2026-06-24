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
  Printer,
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
import { useState, useRef, useEffect, useMemo } from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { byteArrayToBase64 } from "@/utils/imageUtils";

import { useTheme } from "@/contexts/ThemeContext";
import type { Theme } from "@/constants/theme";
import PrintBarcodeModal from "../components/PrintBarcodeModal";
import { ActionButton } from "../components/ActionButton";
import ReceiptConfirmModal from "../components/ReceiptConfirmModal";
import ResultModal from "../components/ResultModal";

export default function KoliDetayScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
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
    recId?: string;
    sipExp?: string;
    boxCode?: string;
    alwaysIgnoreLimit?: string;
  }>();

  const { errorSound } = useApiConfig();
  const { skipWeightInput } = useApiConfig();

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

  // --- YAZDIRMA STATE'LERİ ---
  const [showPrintModal, setShowPrintModal] = useState(false);

  // --- Miktar Aşımı Onay Modalı State'leri ---
  const [showOverLimitModal, setShowOverLimitModal] = useState(false);
  const [pendingOverLimitBarcode, setPendingOverLimitBarcode] = useState("");
  const [alwaysIgnoreLimit, setAlwaysIgnoreLimit] = useState(
    initialIgnoreLimit === "true",
  );
  const [overLimitType, setOverLimitType] = useState<number>(2);

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
        console.log("****** id", id);

        return await api.koliListesi.addItemByBarcode(
          credentials.userCode,
          credentials.password,
          koliIdNum,
          scannedBarcode,
          id ? parseInt(id, 10) : undefined,
          controlType,
        );
      } else {
        return await api.koliListesi.deleteItemByBarcode(
          credentials.userCode,
          credentials.password,
          koliIdNum,
          scannedBarcode,
          id
        );
      }
    },
    onSuccess: (data: any, variables) => {
      // --- miktar aşımı ve olmayan malzeme okutma ---
      if (data.resultErrorType === 2 || data.resultErrorType === 1) {
        playErrorSignal();

        setBarcode("");
        barcodeValueRef.current = "";
        setPendingOverLimitBarcode(variables.scannedBarcode);
        setOverLimitType(data.resultErrorType);
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
      grossWeight?: string;
      netWeight?: string;
    } = {}) => {
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
        parseInt(id, 10)
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

  const getDisplayValue = (item: any, key: string): string => {
    const val = item[key];
    if (val === null || val === undefined || val === "") return "";
    return String(val);
  };

  if (koliDetailQuery.isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: t("koliDetay.headerFallback") }} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t("koliDetay.loading")}</Text>
      </View>
    );
  }

  if (koliDetailQuery.isError) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: t("koliDetay.headerFallback") }} />
        <AlertCircle size={48} color={theme.colors.error} />
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
              <Package size={24} color={theme.colors.primary} />
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
                          { color: theme.colors.success, fontWeight: "700" },
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
              color={scanMode === "add" ? theme.colors.onPrimary : theme.colors.inkSubtle}
            />
            <Text
              style={[
                styles.toggleText,
                scanMode === "add" && { color: theme.colors.onPrimary },
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
              color={scanMode === "delete" ? theme.colors.onError : theme.colors.inkSubtle}
            />
            <Text
              style={[
                styles.toggleText,
                scanMode === "delete" && { color: theme.colors.onError },
              ]}
            >
              {t("koliDetay.deleteMaterial")}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.barcodeInputWrapper,
            scanMode === "delete" && { borderColor: theme.colors.error },
          ]}
        >
          <ScanBarcode
            size={22}
            color={scanMode === "delete" ? theme.colors.error : theme.colors.primary}
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
            placeholderTextColor={theme.colors.inkSubtle}
            autoFocus
            blurOnSubmit={false}
          />
          {barcodeMutation.isPending && (
            <ActivityIndicator size="small" color={theme.colors.primary} />
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
            <Package size={48} color={theme.colors.inkSubtle} />
            <Text style={styles.emptyText}>{t("koliDetay.emptyBox")}</Text>
          </View>
        }
      />

      {/* ALT BUTONLAR */}
      <View style={styles.buttonContainer}>
        <ActionButton
          text="Yazdır"
          icon={<Printer size={20} color={theme.colors.ink} />}
          onPress={() => setShowPrintModal(true)}
        />

        <ActionButton
          text={t("koliDetay.btnCreateReceipt")}
          icon={<FileText size={20} color={theme.colors.ink} />}
          onPress={() => setShowReceiptConfirm(true)}
          isLoading={createReceiptMutation.isPending}
        />

        <ActionButton
          text={t("koliDetay.btnOpenBox")}
          icon={<Unlock size={20} color={theme.colors.success} />}
          onPress={() => setShowOpenBoxConfirm(true)}
          isLoading={openBoxMutation.isPending}
        />

        <ActionButton
          text={t("koliDetay.btnCloseBox")}
          icon={<Lock size={20} color={theme.colors.primary} />}
          onPress={() => {
            if (skipWeightInput) {
              closeBoxMutation.mutate({});
            } else {
              setShowCloseBoxModal(true);
            }
          }}
          isLoading={closeBoxMutation.isPending}
        />
      </View>

      {/* --- MODALLAR --- */}
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

      {/* --- ONAY MODALI (Yeni Component) --- */}
      <ReceiptConfirmModal
        visible={showReceiptConfirm}
        onClose={() => setShowReceiptConfirm(false)}
        isLoading={createReceiptMutation.isPending}
        itemCount={1}
        onConfirm={() => {
          setShowReceiptConfirm(false);
          createReceiptMutation.mutate();
        }}
      />

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
              <Lock size={48} color={theme.colors.primary} />
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
                placeholderTextColor={theme.colors.inkSubtle}
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
                placeholderTextColor={theme.colors.inkSubtle}
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
                <AlertCircle size={16} color={theme.colors.error} />
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
                  <ActivityIndicator size="small" color={theme.colors.onPrimary} />
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
                { backgroundColor: theme.colors.successTint },
              ]}
            >
              <Unlock size={48} color={theme.colors.success} />
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
                  { backgroundColor: theme.colors.success },
                  openBoxMutation.isPending && styles.disabledButton,
                ]}
                onPress={() => openBoxMutation.mutate()}
                disabled={openBoxMutation.isPending}
              >
                {openBoxMutation.isPending ? (
                  <ActivityIndicator size="small" color={theme.colors.onSuccess} />
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
              borderLeftColor: theme.colors.error,
            },
          ]}
        >
          {toastContent.type === "success" ? (
            <CheckCircle size={24} color={theme.colors.success} />
          ) : (
            <AlertCircle size={24} color={theme.colors.error} />
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
                { backgroundColor: theme.colors.warningTint },
              ]}
            >
              <AlertTriangle size={48} color={theme.colors.warning} />
            </View>
            <Text style={styles.resultTitle}>
              {overLimitType === 1
                ? "Sipariş Dışı Ürün"
                : t("scanner.overLimit.title")}{" "}
            </Text>
            <Text style={styles.resultMessage}>
              {overLimitType === 1
                ? "Siparişte olmayan malzeme okutuyorsunuz. Devam etmek istiyor musunuz?"
                : t("scanner.overLimit.message")}
            </Text>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <TouchableOpacity
                style={[
                  styles.resultButton,
                  { flex: 1, backgroundColor: theme.colors.surface2 },
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
                    { color: theme.colors.inkMuted },
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
                    backgroundColor: theme.colors.warning,
                    borderColor: theme.colors.warning,
                  },
                ]}
                onPress={() => {
                  setShowOverLimitModal(false);
                  //setAlwaysIgnoreLimit(true);
                  barcodeMutation.mutate({
                    scannedBarcode: pendingOverLimitBarcode,
                    controlType: -1,
                  });
                }}
              >
                <Text style={[styles.resultButtonText, { color: theme.colors.onWarning }]}>
                  {t("scanner.overLimit.confirmBtn")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <PrintBarcodeModal
        visible={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        koliId={id}
        onSuccess={(msg) => showToast("Başarılı", msg, "success")}
        onError={(msg) => {
          playErrorSignal();
          showToast("Hata", msg, "error");
        }}
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
    topSection: {
      backgroundColor: colors.canvas,
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.hairline,
      gap: spacing.sm,
    },
    toggleContainer: {
      flexDirection: "row",
      backgroundColor: colors.surface2,
      borderRadius: radius.md,
      padding: spacing.xxs,
    },
    toggleBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.sm,
      borderRadius: radius.sm,
      gap: spacing.xxs,
    },
    toggleBtnActiveAdd: {
      backgroundColor: colors.primary,
    },
    toggleBtnActiveDelete: {
      backgroundColor: colors.error,
    },
    toggleText: {
      ...type.button,
      color: colors.inkSubtle,
    },
    barcodeInputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.hairlineStrong,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      height: 50,
      gap: spacing.sm,
    },
    barcodeInputTop: {
      ...type.bodyLg,
      flex: 1,
      fontWeight: "600",
      color: colors.ink,
    },
    content: {
      padding: spacing.md,
    },
    receiptBanner: {
      backgroundColor: colors.primaryTint,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.hairline,
    },
    receiptBannerText: {
      ...type.bodySm,
      fontWeight: "600" as const,
      color: colors.primary,
      textAlign: "center",
    },
    sipExpBannerText: {
      ...type.bodySm,
      fontWeight: "500" as const,
      color: colors.success,
      textAlign: "center",
      marginTop: spacing.xxs,
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
      paddingVertical: spacing.xxxl,
      gap: spacing.sm,
    },
    emptyText: {
      ...type.body,
      color: colors.inkMuted,
      textAlign: "center",
    },
    card: {
      backgroundColor: colors.surface1,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.hairline,
    },
    cardContent: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: radius.md,
      backgroundColor: colors.primaryTint,
      alignItems: "center",
      justifyContent: "center",
    },
    thumbnailImage: {
      width: 48,
      height: 48,
      borderRadius: radius.sm,
      backgroundColor: colors.surface2,
    },
    itemInfo: {
      flex: 1,
      gap: spacing.xxs,
    },
    itemName: {
      ...type.cardTitle,
      fontSize: 15,
      color: colors.ink,
    },
    quantityContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 2,
    },
    quantityLabel: {
      ...type.bodySm,
      color: colors.inkMuted,
    },
    quantityValue: {
      ...type.mono,
      fontWeight: "700" as const,
      color: colors.success,
    },
    dynamicFieldsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: spacing.xxs,
      gap: spacing.xxs,
    },
    dynamicFieldRow: {
      width: "48%",
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 2,
    },
    fieldLabel: {
      ...type.caption,
      fontWeight: "700",
      color: colors.inkSubtle,
      marginRight: spacing.xxs,
    },
    fieldValue: {
      ...type.caption,
      color: colors.ink,
      flexShrink: 1,
    },
    buttonContainer: {
      flexDirection: "row",
      padding: spacing.md,
      paddingBottom: spacing.xxl,
      gap: spacing.sm,
      backgroundColor: colors.canvas,
      borderTopWidth: 1,
      borderTopColor: colors.hairline,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: colors.scrim,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
    },
    resultIconContainer: {
      width: 64,
      height: 64,
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },
    resultTitle: {
      ...type.cardTitle,
      fontSize: 18,
      color: colors.ink,
      textAlign: "center",
      marginBottom: spacing.xs,
    },
    resultMessage: {
      ...type.bodySm,
      color: colors.inkMuted,
      textAlign: "center",
      marginBottom: spacing.xl,
      lineHeight: 20,
    },
    disabledButton: {
      opacity: 0.6,
    },
    receiptModalOverlay: {
      flex: 1,
      backgroundColor: colors.scrim,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
    },
    receiptModalContent: {
      backgroundColor: colors.surface1,
      borderRadius: radius.xxl,
      padding: spacing.xl,
      width: "100%",
      maxWidth: 340,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.hairline,
    },
    receiptIconContainer: {
      width: 80,
      height: 80,
      borderRadius: radius.pill,
      backgroundColor: colors.primaryTint,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    receiptModalTitle: {
      ...type.headline,
      color: colors.ink,
      textAlign: "center",
      marginBottom: spacing.sm,
    },
    receiptModalSubtitle: {
      ...type.body,
      color: colors.inkMuted,
      textAlign: "center",
      marginBottom: spacing.xl,
    },
    receiptModalButtons: {
      flexDirection: "row" as const,
      gap: spacing.sm,
      width: "100%",
    },
    receiptCancelButton: {
      flex: 1,
      backgroundColor: colors.surface2,
      borderRadius: radius.md,
      padding: 14,
      minHeight: 48,
      alignItems: "center" as const,
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.hairlineStrong,
    },
    receiptCancelText: {
      ...type.button,
      color: colors.ink,
    },
    receiptConfirmButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      padding: 14,
      minHeight: 48,
      alignItems: "center" as const,
      justifyContent: "center",
    },
    receiptConfirmText: {
      ...type.button,
      color: colors.onPrimary,
    },
    closeBoxModalContent: {
      backgroundColor: colors.surface1,
      borderRadius: radius.xxl,
      padding: spacing.xl,
      width: "100%",
      maxWidth: 340,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.hairline,
    },
    weightInputContainer: {
      width: "100%",
      marginBottom: spacing.md,
    },
    weightLabel: {
      ...type.label,
      textTransform: "uppercase",
      color: colors.inkMuted,
      marginBottom: spacing.xs,
      alignSelf: "flex-start",
    },
    weightInput: {
      ...type.body,
      backgroundColor: colors.surface2,
      borderRadius: radius.md,
      padding: 14,
      color: colors.ink,
      borderWidth: 1,
      borderColor: colors.hairlineStrong,
      width: "100%",
    },
    toastContainer: {
      position: "absolute",
      bottom: 120,
      left: spacing.lg,
      right: spacing.lg,
      alignItems: "center",
      zIndex: 999,
    },
    toastContent: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface3,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderLeftWidth: 4,
      borderLeftColor: colors.success,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 6,
      gap: spacing.sm,
    },
    toastTitle: {
      ...type.bodySm,
      fontWeight: "700" as const,
      color: colors.ink,
    },
    toastSubtitle: {
      ...type.bodySm,
      color: colors.inkMuted,
      flexWrap: "wrap",
    },
    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.errorTint,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.sm,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.error,
      gap: spacing.xs,
      width: "100%",
    },
    weightErrorMessage: {
      ...type.bodySm,
      color: colors.error,
      fontWeight: "600" as const,
      flex: 1,
    },
    modalContent: {
      width: "100%",
      maxWidth: 320,
      backgroundColor: colors.surface1,
      borderRadius: radius.xxl,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: colors.hairline,
    },
    resultButton: {
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.hairlineStrong,
    },
    resultButtonText: { ...type.button },
  });
};
