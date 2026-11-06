import { useState, useEffect, useRef, useMemo } from "react";
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
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  ScanBarcode,
  CheckCircle,
  AlertTriangle,
  FileText,
  Home,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { Theme } from "@/constants/theme";
import { api } from "@/services/api";
import { useApiConfig } from "@/contexts/ApiConfigContext";
import { useErrorSignal } from "@/hooks/useErrorSignal";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { useManualKeyboard } from "@/hooks/useManualKeyboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";

export default function BarcodeScannerScreen() {
  const router = useRouter();
  const { replace } = useSafeNavigation();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const noticeBottom =
    (keyboardHeight || insets.bottom) + theme.spacing.md;
  const { useExistingBox } = useApiConfig();
  const playErrorSignal = useErrorSignal();
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
  const manualKeyboard = useManualKeyboard(inputRef);
  const barcodeValueRef = useRef("");
  const isProcessingRef = useRef(false);

  const [barcode, setBarcode] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [displayBoxCode, setDisplayBoxCode] = useState<string | null>(
    params.receiptNo || null,
  );

  // Okutma hatası: tam ekran yerine altta bildirim. Sonraki okutmaya ya da
  // kapat düğmesine kadar kalır, okutmayı engellemez.
  const [scanError, setScanError] = useState<{
    title: string;
    message: string;
    code: string;
  } | null>(null);

  // --- Miktar Aşımı Onay Modalı State'leri ---
  const [showOverLimitModal, setShowOverLimitModal] = useState(false);
  const [pendingOverLimitBarcode, setPendingOverLimitBarcode] = useState("");
  const [alwaysIgnoreLimit, setAlwaysIgnoreLimit] = useState(false);
  const [overLimitType, setOverLimitType] = useState<number>(2);

  // --- Toast İçeriği ve Animasyonu ---
  const [toastContent, setToastContent] = useState({
    title: "",
    message: "",
  });
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(50)).current;
  const toastHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ekran kapanırken bekleyen toast gizleme zamanlayıcısını iptal et.
  useEffect(() => {
    return () => {
      if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
    };
  }, []);

  const showSuccessToast = (title: string, message: string) => {
    setToastContent({ title, message });

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

    if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
    toastHideTimer.current = setTimeout(() => {
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
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

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
            // Param yoksa NaN göndermek yerine undefined bırak (api 0 kullanır).
            params.orderReceiptId
              ? parseInt(params.orderReceiptId, 10)
              : undefined,
            controlType,
          );
          return { ...addResult, mode: "add", scannedBarcode };
        }
        // else if (params.mode === "delete") {
        //   const deleteResult = await api.koliListesi.deleteItemByBarcode(
        //     credentials.userCode,
        //     credentials.password,
        //     koliIdNum,
        //     scannedBarcode,
        //   );
        //   return { ...deleteResult, mode: "delete", scannedBarcode };
        // }
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
          setScanError({
            title: t("scanner.scanFailed"),
            message: explanation || t("scanner.createBoxError"),
            code: variables.scannedBarcode,
          });
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
                  recId: params.orderReceiptId,
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
                      recId: params.orderReceiptId,
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
          setScanError({
            title: t("scanner.scanFailed"),
            message: explanation || t("scanner.systemError"),
            code: variables.scannedBarcode,
          });
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
          );
        }
        return;
      }

      if (data.mode === "search") {
        if (data.err === 99 || data.err === 1 || isError) {
          playErrorSignal();
          setScanError({
            title: t("scanner.boxNotFoundTitle"),
            message: data.msg || t("scanner.boxNotFoundMsg"),
            code: variables.scannedBarcode,
          });
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
                  recId: params.orderReceiptId,
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
                      recId: params.orderReceiptId,
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
    onError: (error: Error, variables) => {
      playErrorSignal();
      setScanError({
        title: t("scanner.systemError"),
        message: error.message,
        code: variables.scannedBarcode,
      });
      setBarcode("");
      barcodeValueRef.current = "";
      inputRef.current?.focus();
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
    setScanError(null);
    // Yeni okutma eski bildirimin yerine geçer; altta iki bildirim üst üste binmez.
    toastOpacity.setValue(0);
    toastTranslateY.setValue(50);

    barcodeMutation.mutate({
      scannedBarcode: finalBarcode,
      controlType: 3,
    });
  };

  const getTitles = () => {
    if (params.mode === "create_from_order") {
      return {
        title: t("scanner.titles.createFromOrder"),
        subtitle: "",
        orderNo: params.receiptNo,
        customer: params.accountName || t("scanner.titles.accountSelected"),
        fieldLabel: t("scanner.titles.firstItemPrompt"),
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

  const { title, subtitle, orderNo, customer, fieldLabel } = getTitles();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        {/* HEADER */}
        <View
          style={[
            styles.header,
            { paddingTop: insets.top + theme.spacing.sm },
          ]}
        >
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <X size={24} color={theme.colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("scanner.headerTitle")}</Text>
          <TouchableOpacity
            style={[
              styles.headerButton,
              { backgroundColor: theme.colors.koliTile },
            ]}
            onPress={() => replace("/(app)/dashboard")}
          >
            <Home size={24} color={theme.colors.koliInk} />
          </TouchableOpacity>
        </View>

        {/* İÇERİK */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { flex: undefined, flexGrow: 1 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View
            style={[
              styles.iconCircle,
              params.mode === "delete" && { borderColor: theme.colors.error },
            ]}
          >
            <ScanBarcode
              size={60}
              color={params.mode === "delete" ? theme.colors.error : theme.colors.koliInk}
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          {orderNo ? (
            <View style={styles.orderChip}>
              <FileText size={16} color={theme.colors.koliInk} />
              <Text style={styles.orderChipText}>{orderNo}</Text>
            </View>
          ) : null}
          {customer ? <Text style={styles.customer}>{customer}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          <View style={styles.inputSection}>
            {fieldLabel ? (
              <Text style={styles.fieldLabel}>{fieldLabel}</Text>
            ) : null}
            <TextInput
              ref={inputRef}
              style={[styles.barcodeInput, scanError && styles.barcodeInputError]}
              value={barcode}
              onChangeText={(text) => {
                setBarcode(text);
                barcodeValueRef.current = text;
              }}
              onSubmitEditing={handleBarcodeSubmit}
              placeholder={t("scanner.placeholder")}
              placeholderTextColor={theme.colors.inkSubtle}
              autoFocus
              blurOnSubmit={false}
              {...manualKeyboard}
              selectTextOnFocus={true}
            />
            {successMessage && (
              <View style={styles.resultExplanationBox}>
                <CheckCircle size={18} color={theme.colors.success} />
                <Text style={styles.resultExplanationText}>{successMessage}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                params.mode === "delete" && { backgroundColor: theme.colors.error },
                (!barcode.trim() || barcodeMutation.isPending) && {
                  opacity: 0.5,
                },
              ]}
              onPress={handleBarcodeSubmit}
              disabled={!barcode.trim() || barcodeMutation.isPending}
            >
              {barcodeMutation.isPending ? (
                <ActivityIndicator color={theme.colors.onPrimary} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {t("scanner.submitButton")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* OKUTMA HATASI BİLDİRİMİ */}
        {scanError ? (
          <View
            style={[
              styles.toastContainer,
              { bottom: noticeBottom },
            ]}
          >
            <View
              style={[styles.toastContent, styles.toastError]}
              accessibilityRole="alert"
            >
              <View style={[styles.toastMark, styles.toastMarkError]}>
                <X size={20} color={theme.colors.errInk} />
              </View>
              <View style={styles.toastBody}>
                <Text style={[styles.toastTitle, styles.toastTitleError]}>
                  {scanError.title}
                </Text>
                <Text style={[styles.toastSubtitle, styles.toastMessageError]}>
                  {scanError.message}
                </Text>
                <Text style={styles.toastCode}>{scanError.code}</Text>
              </View>
              <TouchableOpacity
                style={styles.toastClose}
                onPress={() => {
                  setScanError(null);
                  inputRef.current?.focus();
                }}
                accessibilityRole="button"
                accessibilityLabel={t("scanner.closeNotice")}
                testID="scan-error-close"
              >
                <X size={20} color={theme.colors.readMuted} />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* BAŞARI BİLDİRİMİ */}
        <Animated.View
          style={[
            styles.toastContainer,
            {
              bottom: noticeBottom,
              opacity: toastOpacity,
              transform: [{ translateY: toastTranslateY }],
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.toastContent}>
            <View style={styles.toastMark}>
              <CheckCircle size={20} color={theme.colors.noticeOkInk} />
            </View>

            <View style={styles.toastBody}>
              <Text style={styles.toastTitle}>{toastContent.title}</Text>
              <Text style={styles.toastSubtitle}>{toastContent.message}</Text>
            </View>
          </View>
        </Animated.View>
        {/* MİKTAR AŞIMI ONAY MODALI */}
        <Modal
          visible={showOverLimitModal}
          transparent
          statusBarTranslucent
          navigationBarTranslucent
          animationType="fade"
          onRequestClose={() => {
            setShowOverLimitModal(false);
            isProcessingRef.current = false;
            inputRef.current?.focus();
          }}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { paddingBottom: insets.bottom + theme.spacing.lg },
              ]}
            >
              <View
                style={[
                  styles.resultIconContainer,
                  { backgroundColor: theme.colors.warnTile },
                ]}
              >
                <AlertTriangle size={32} color={theme.colors.warnInk} />
              </View>
              <Text style={styles.resultTitle}>
                {overLimitType === 1
                  ? t("scanner.outOfOrderTitle")
                  : t("scanner.overLimit.title")}{" "}
              </Text>
              <Text style={styles.resultMessage}>
                {overLimitType === 1
                  ? t("scanner.outOfOrderMessage")
                  : t("scanner.overLimit.message")}
              </Text>
              <Text style={styles.limitChip}>{pendingOverLimitBarcode}</Text>

              <View style={styles.limitActions}>
                <TouchableOpacity
                  style={styles.resultButton}
                  onPress={() => {
                    setShowOverLimitModal(false);
                    isProcessingRef.current = false;
                    inputRef.current?.focus();
                  }}
                >
                  <Text style={styles.resultButtonText}>
                    {t("scanner.overLimit.cancelBtn")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.resultButton, styles.resultButtonWarn]}
                  onPress={() => {
                    setShowOverLimitModal(false);
                    // setAlwaysIgnoreLimit(true);
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
      </KeyboardAvoidingView>
    </View>
  );
}

const makeStyles = (theme: Theme) => {
  const { colors, spacing, radius, type } = theme;
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.canvas },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      // paddingTop çalışma anında safe-area inset'inden gelir (çentik desteği)
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      backgroundColor: colors.surface1,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardLine,
    },
    headerButton: {
      width: 48,
      height: 48,
      borderRadius: radius.pill,
      backgroundColor: colors.raised,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: { ...type.screenTitle, color: colors.ink },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },
    iconCircle: {
      width: 120,
      height: 120,
      borderRadius: radius.pill,
      backgroundColor: colors.raised,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.xl,
      borderWidth: 1,
      borderColor: colors.hairlineStrong,
    },
    title: {
      ...type.pageTitle,
      fontSize: 23,
      lineHeight: 30,
      fontWeight: "700",
      letterSpacing: -0.5,
      color: colors.ink,
      textAlign: "center",
    },
    subtitle: {
      ...type.bodyLg,
      fontSize: 15,
      lineHeight: 22,
      color: colors.inkMuted,
      textAlign: "center",
      marginTop: spacing.xs,
    },
    orderChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginTop: spacing.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      borderRadius: radius.pill,
      backgroundColor: colors.koliTile,
    },
    orderChipText: {
      ...type.labelStrong,
      fontSize: 13,
      lineHeight: 19,
      fontVariant: ["tabular-nums"],
      color: colors.ink,
    },
    customer: {
      ...type.bodyLg,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600",
      color: colors.ink,
      textAlign: "center",
      marginTop: spacing.xs,
    },
    inputSection: {
      width: "100%",
      position: "relative",
      marginTop: spacing.xxl,
    },
    fieldLabel: {
      ...type.bodyLg,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600",
      color: colors.ink,
      textAlign: "center",
      marginBottom: spacing.xs,
    },
    barcodeInput: {
      ...type.bodyLg,
      width: "100%",
      minHeight: 64,
      backgroundColor: colors.raised,
      borderRadius: radius.control,
      paddingHorizontal: spacing.md,
      fontSize: 18,
      fontWeight: "500",
      fontVariant: ["tabular-nums"],
      letterSpacing: 0.3,
      color: colors.ink,
      borderWidth: 1,
      borderColor: colors.controlLine,
      textAlign: "center",
    },
    barcodeInputError: {
      borderWidth: 2,
      borderColor: colors.errLine,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.scrim,
      justifyContent: "flex-end",
    },
    modalContent: {
      width: "100%",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.card,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingTop: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
    resultIconContainer: {
      width: 64,
      height: 64,
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
    },
    resultTitle: {
      ...type.pageTitle,
      fontWeight: "700" as const,
      color: colors.ink,
      textAlign: "center",
    },
    resultMessage: {
      ...type.bodyLg,
      color: colors.ink,
      textAlign: "center",
    },
    limitChip: {
      ...type.labelMd,
      fontVariant: ["tabular-nums"],
      color: colors.ink,
      backgroundColor: colors.raised,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      overflow: "hidden",
    },
    limitActions: {
      flexDirection: "row",
      gap: spacing.sm,
      width: "100%",
      marginTop: spacing.sm,
    },
    resultButton: {
      flex: 1,
      minHeight: 56,
      borderRadius: radius.control,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.cardLine,
      backgroundColor: colors.card,
    },
    resultButtonWarn: {
      backgroundColor: colors.warning,
      borderColor: colors.warning,
    },
    resultButtonText: {
      ...type.bodyLg,
      fontWeight: "600" as const,
      color: colors.ink,
    },
    submitButton: {
      marginTop: spacing.md,
      backgroundColor: colors.koliHero,
      borderRadius: radius.control,
      paddingVertical: spacing.md,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      minHeight: 56,
    },
    submitButtonText: {
      ...type.bodyLg,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600",
      color: colors.onPrimary,
    },
    toastContainer: {
      position: "absolute",
      left: spacing.md,
      right: spacing.md,
      zIndex: 999,
    },
    toastContent: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.notice,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.control,
      borderWidth: 1,
      borderColor: colors.noticeLine,
      gap: spacing.sm,
      ...theme.noticeShadow,
    },
    toastError: {
      alignItems: "flex-start",
      borderColor: colors.errLine,
      paddingRight: 0,
    },
    toastMark: {
      width: 32,
      height: 32,
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.noticeOkTile,
    },
    toastMarkError: {
      backgroundColor: colors.errTile,
    },
    toastBody: {
      flex: 1,
      minWidth: 0,
    },
    toastTitle: {
      ...type.bodyLg,
      fontWeight: "700" as const,
      color: colors.ink,
    },
    toastTitleError: {
      color: colors.errInk,
    },
    toastSubtitle: {
      ...type.labelMd,
      fontWeight: "400" as const,
      color: colors.readMuted,
      marginTop: spacing.xxs,
    },
    toastMessageError: {
      color: colors.ink,
    },
    toastCode: {
      ...type.labelMd,
      fontVariant: ["tabular-nums"],
      color: colors.readMuted,
      marginTop: spacing.xxs,
    },
    toastClose: {
      width: 48,
      height: 48,
      marginVertical: -spacing.xs,
      alignItems: "center",
      justifyContent: "center",
    },
    resultExplanationBox: {
      backgroundColor: colors.successTint,
      padding: spacing.sm,
      borderRadius: radius.md,
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.sm,
      borderWidth: 1,
      borderColor: colors.success,
      gap: spacing.xs,
    },
    resultExplanationText: {
      ...type.bodySm,
      color: colors.success,
      fontWeight: "600",
      flex: 1,
    },
  });
};