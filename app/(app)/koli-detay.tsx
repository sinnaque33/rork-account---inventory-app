import { LinearGradient } from "expo-linear-gradient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { Trans, useTranslation } from "react-i18next";
import { useApiConfig } from "@/contexts/ApiConfigContext";
import { useErrorSignal } from "@/hooks/useErrorSignal";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { useManualKeyboard } from "@/hooks/useManualKeyboard";
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
  PackagePlus,
  ChevronRight,
  X,
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
  Image,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { memo, useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { byteArrayToBase64 } from "@/utils/imageUtils";

import { useTheme } from "@/contexts/ThemeContext";
import type { Theme } from "@/constants/theme";
import type { KoliItem } from "@/services/types";
import PrintBarcodeModal from "../components/PrintBarcodeModal";
import { ActionButton } from "../components/ActionButton";
import ReceiptConfirmModal from "../components/ReceiptConfirmModal";

export default function KoliDetayScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  // Bildirimler alt düğmelerin üstünde durur. Klavye açıkken iOS'ta düğmeler
  // klavyeyle yükselir, Android'de klavyenin altında kalır.
  const noticeBase = insets.bottom + 136;
  const noticeBottom = !keyboardHeight
    ? noticeBase
    : Platform.OS === "ios"
      ? noticeBase + keyboardHeight
      : keyboardHeight + theme.spacing.md;
  const {
    id,
    packageNo,
    receiptNo,
    recId,
    sipExp,
    boxCode,
    initialSuccessMsg,
    alwaysIgnoreLimit: initialIgnoreLimit,
  } = useLocalSearchParams<{
    id: string;
    packageNo?: string;
    receiptNo?: string;
    recId?: string;
    sipExp?: string;
    boxCode?: string;
    initialSuccessMsg?: string;
    alwaysIgnoreLimit?: string;
  }>();

  const { skipWeightInput } = useApiConfig();
  const playErrorSignal = useErrorSignal();

  const { credentials } = useAuth();

  const router = useRouter();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [showReceiptConfirm, setShowReceiptConfirm] = useState(false);
  const [showNewBoxConfirm, setShowNewBoxConfirm] = useState(false);
  const [showCloseBoxModal, setShowCloseBoxModal] = useState(false);
  const [grossWeight, setGrossWeight] = useState("");
  const [netWeight, setNetWeight] = useState("");
  const [weightError, setWeightError] = useState<string | null>(null);
  const [showOpenBoxConfirm, setShowOpenBoxConfirm] = useState(false);
  const [showDeleteBoxConfirm, setShowDeleteBoxConfirm] = useState(false);

  // --- SİPARİŞE BAĞLI KOLİLER (banner'daki sipariş numarasına dokununca) ---
  const [showOrderBoxesModal, setShowOrderBoxesModal] = useState(false);
  // Listeden seçilen koli; doluysa modal onay adımına geçer.
  const [pendingSiblingBox, setPendingSiblingBox] = useState<KoliItem | null>(
    null,
  );

  // --- BARKOD OKUMA STATE'LERİ ---
  const [scanMode, setScanMode] = useState<"add" | "delete">("add");
  const [barcode, setBarcode] = useState("");
  const inputRef = useRef<TextInput>(null);
  const manualKeyboard = useManualKeyboard(inputRef);
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

  // Okutma hatası: tam ekran yerine altta bildirim. Sonraki okutmaya ya da
  // kapat düğmesine kadar kalır, okutmayı engellemez.
  const [scanError, setScanError] = useState<{
    title: string;
    message: string;
    code: string;
  } | null>(null);
  // Son eklenen ürünün barkodu; satırı başarı bildirimi süresince işaretler.
  const [justScanned, setJustScanned] = useState<string | null>(null);

  // --- Toast İçeriği ve Animasyonu ---
  const [toastContent, setToastContent] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error",
    // Aynı içerikle art arda çağrıldığında da animasyon efektinin yeniden
    // tetiklenmesi için artan sayaç.
    nonce: 0,
  });
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(50)).current;
  const toastHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Koli silindikten sonra listeye dönüş zamanlayıcısı
  const backTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sayfa açıldığında inputa odaklan
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Ekran kapanırken bekleyen toast gizleme zamanlayıcısını iptal et;
  // aksi halde unmount edilmiş component üzerinde animasyon başlatılır.
  // Aynı şekilde silme sonrası geri dönüş zamanlayıcısı da temizlenmeli.
  useEffect(() => {
    return () => {
      if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
      if (backTimer.current) clearTimeout(backTimer.current);
    };
  }, []);

  const showToast = useCallback(
    (title: string, message: string, type: "success" | "error" = "success") => {
      // Aynı yerde gösterilirler; yeni bildirim eski okutma hatasının yerine geçer.
      setScanError(null);
      setToastContent((prev) => ({
        title,
        message,
        type,
        nonce: prev.nonce + 1,
      }));
    },
    [],
  );

  // Başka bir ekrandan "işlem başarılı" mesajıyla gelindiyse (örn. yeni koli
  // oluşturma) ekran açılır açılmaz bir kez toast göster.
  const initialToastShownRef = useRef(false);
  useEffect(() => {
    if (!initialSuccessMsg || initialToastShownRef.current) return;
    initialToastShownRef.current = true;
    showToast(t("koliDetay.success"), initialSuccessMsg, "success");
  }, [initialSuccessMsg, showToast, t]);

  // Animasyon, yeni içerik render edildikten SONRA başlamalı. Aksi halde
  // native driver hâlâ eski renkteki (ilk açılışta yeşil) view'i fade-in eder
  // ve toast bir an yanlış renkte görünüp sonra doğru renge atlar.
  useEffect(() => {
    if (toastContent.nonce === 0) return;

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
      setJustScanned(null);
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
  }, [toastContent.nonce, toastOpacity, toastTranslateY]);

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
          id,
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
        setScanError({
          title: t("koliDetay.scanFailed"),
          message: explanation || t("koliDetay.defaultError"),
          code: variables.scannedBarcode,
        });
        setBarcode("");
        barcodeValueRef.current = "";
        inputRef.current?.focus();
      } else {
        setBarcode("");
        barcodeValueRef.current = "";
        inputRef.current?.focus();

        queryClient.invalidateQueries({ queryKey: ["koli-detay", id] });
        if (scanMode === "add") setJustScanned(variables.scannedBarcode);
        showToast(
          t("koliDetay.success"),
          scanMode === "add"
            ? t("koliDetay.itemAdded")
            : t("koliDetay.itemDeleted"),
          "success",
        );
      }
    },
    onError: (err: Error, variables) => {
      playErrorSignal();
      setBarcode("");
      barcodeValueRef.current = "";
      setScanError({
        title: t("koliDetay.systemError"),
        message: err.message,
        code: variables.scannedBarcode,
      });
      inputRef.current?.focus();
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
    setScanError(null);
    // Yeni okutma eski bildirimin yerine geçer; altta iki bildirim üst üste binmez.
    toastOpacity.setValue(0);
    toastTranslateY.setValue(50);

    barcodeMutation.mutate({
      scannedBarcode: finalBarcode,
      controlType: alwaysIgnoreLimit ? -1 : 3,
    });
  };

  // İrsaliye ekranı yığında açık kalabilir: silinen, yeniden açılan ya da
  // irsaliyesi kesilen koli oradaki seçimden düşmeli, liste de güncel durumu göstermeli.
  const removeFromWaybillSelection = useCallback(() => {
    queryClient.setQueryData<string[]>(["irs-removed-boxes"], (old) => [
      ...(old || []),
      String(id),
    ]);
    queryClient.invalidateQueries({ queryKey: ["irs-koli-listesi"] });
  }, [queryClient, id]);

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
      const result = await api.koliListesi.closeBox(
        credentials.userCode,
        credentials.password,
        parseInt(id, 10),
        grossWeight,
        netWeight,
      );
      console.log("Koli Kapatma API Yanıtı:", JSON.stringify(result, null, 2));
      return result;
    },
    onSuccess: (data) => {
      let parsedData: any = {};
      const responseData = (data as any).data;

      if (responseData) {
        try {
          parsedData =
            typeof responseData === "string"
              ? JSON.parse(responseData)
              : responseData;
        } catch (e) {
          console.warn("CloseBox data parse edilemedi", e);
        }
      }

      const isError =
        String(data.success) !== "true" ||
        ((data as any).err !== undefined && (data as any).err !== 0) ||
        parsedData.resultError === true ||
        (parsedData.err !== undefined && parsedData.err !== 0);

      if (isError) {
        playErrorSignal();
        const errorMsg =
          parsedData.resultExplanation ||
          data.msg ||
          t("koliDetay.defaultError");
        showToast(t("koliDetay.error"), errorMsg, "error");
        return;
      }

      showToast(
        t("koliDetay.success"),
        data.msg || t("koliDetay.boxClosed"),
        "success",
      );
      // Ağırlıklar yalnızca başarıda temizlenir; hata durumunda kullanıcı
      // modalı tekrar açtığında girdiği değerleri yeniden yazmak zorunda kalmasın.
      setGrossWeight("");
      setNetWeight("");
      queryClient.invalidateQueries({ queryKey: ["koli-detay", id] });
      queryClient.invalidateQueries({ queryKey: ["koli-listesi"] });
      queryClient.invalidateQueries({ queryKey: ["irs-koli-listesi"] });
    },
    onError: (error) => {
      playErrorSignal();
      showToast(
        t("koliDetay.systemError"),
        error instanceof Error ? error.message : t("koliDetay.defaultError"),
        "error",
      );
    },
    // "Devam"a basıldıktan sonra sonuç ne olursa olsun modal kapanmalı; aksi
    // halde iş kuralı hatasında modal açık kalıyor ve toast arkasında görünmüyor.
    onSettled: () => {
      setShowCloseBoxModal(false);
    },
  });

  const openBoxMutation = useMutation({
    mutationFn: async () => {
      if (!credentials || !id) {
        throw new Error(t("koliDetay.missingInfo"));
      }
      const result = await api.koliListesi.openBox(
        credentials.userCode,
        credentials.password,
        parseInt(id, 10),
      );
      console.log("Koli Açma API Yanıtı:", JSON.stringify(result, null, 2));
      return result;
    },
    onSuccess: (data) => {
      // Sunucu iş kuralı hatalarında da success:"true" döndüğü için sadece
      // success'e bakmak yetmez; err/resultExplanation da kontrol edilmeli.
      const isError =
        String(data.success) !== "true" ||
        (data.err !== undefined && data.err !== 0);

      if (isError) {
        playErrorSignal();
        showToast(
          t("koliDetay.operationFailed"),
          data.resultExplanation || data.msg || t("koliDetay.boxOpenFail"),
          "error",
        );
        return;
      }

      showToast(
        t("koliDetay.success"),
        data.msg || t("koliDetay.boxOpened"),
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["koli-detay", id] });
      queryClient.invalidateQueries({ queryKey: ["koli-listesi"] });
      removeFromWaybillSelection();
    },
    onError: (error) => {
      playErrorSignal();
      showToast(
        t("koliDetay.systemError"),
        error instanceof Error ? error.message : t("koliDetay.defaultError"),
        "error",
      );
    },
    // Sonuç ne olursa olsun modal kapanmalı; açık kalırsa toast arkasında kalır.
    onSettled: () => {
      setShowOpenBoxConfirm(false);
    },
  });

  const deleteBoxMutation = useMutation({
    mutationFn: async () => {
      if (!credentials || !id) {
        throw new Error(t("koliDetay.missingInfo"));
      }
      return api.koliListesi.deleteBox(
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
          data.resultExplanation || data.msg || t("koliDetay.boxDeleteFail"),
          "error",
        );
        return;
      }

      showToast(
        t("koliDetay.success"),
        data.msg || t("koliDetay.boxDeleted"),
        "success",
      );

      // Silinen kolinin detay sorgusu yeniden çekilmemeli (ölü kayıt -> hata ekranı).
      queryClient.removeQueries({ queryKey: ["koli-detay", id] });

      // Sonsuz listelerde invalidate, yüklü tüm sayfaları sırayla yeniden çeker;
      // bu tamamlanana kadar liste eski önbelleği (silinen koliyi) gösterirdi.
      // O yüzden koliyi önce önbellekten cerrahi olarak düşürüyoruz.
      const deletedId = parseInt(id, 10);
      const dropDeletedBox = (
        old: InfiniteData<KoliItem[]> | undefined,
      ): InfiniteData<KoliItem[]> | undefined =>
        old
          ? {
              ...old,
              pages: old.pages.map((page) =>
                // Servis id'yi metin olarak gönderiyor; sayıya çevrilmezse eşleşmez.
                page.filter((box) => Number(box.id) !== deletedId),
              ),
            }
          : old;

      // Prefix eşleşmesi: userCode/arama varyantlarının hepsini yakalar.
      queryClient.setQueriesData<InfiniteData<KoliItem[]>>(
        { queryKey: ["koli-listesi"] },
        dropDeletedBox,
      );
      queryClient.setQueriesData<InfiniteData<KoliItem[]>>(
        { queryKey: ["irs-koli-listesi"] },
        dropDeletedBox,
      );

      // Sunucu gerçeğiyle uzlaşmak için arka planda tazele.
      queryClient.invalidateQueries({ queryKey: ["koli-listesi"] });
      removeFromWaybillSelection();
      queryClient.invalidateQueries({ queryKey: ["order-boxes"] });

      // Toast görünür kalsın diye kısa gecikmeyle listeye dön.
      backTimer.current = setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(app)/koli-listesi" as any);
        }
      }, 900);
    },
    onError: (error) => {
      playErrorSignal();
      showToast(
        t("koliDetay.systemError"),
        error instanceof Error ? error.message : t("koliDetay.defaultError"),
        "error",
      );
    },
    // "Sil"e basıldıktan sonra sonuç ne olursa olsun modal kapanmalı; aksi halde
    // iş kuralı hatasında modal açık kalıyor ve toast onun arkasında görünmüyor.
    onSettled: () => {
      setShowDeleteBoxConfirm(false);
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
        removeFromWaybillSelection();
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

  // Yeni koli, içinde bulunduğumuz kolinin siparişine bağlanmalı. Sipariş
  // RecId'si iki yoldan gelebilir:
  //  1) `recId` parametresi (barkod okuyucu / sipariş seçim ekranı bunu doğru
  //     gönderir),
  //  2) koli listesi ekranından gelindiyse `recId` koli id'sinin kendisidir
  //     (bkz. koli-listesi.tsx `//todo recId gönder`), o yüzden güvenilmez;
  //     bu durumda sipariş numarasından RecId'yi sipariş listesinden çözeriz.
  const trustedOrderRecId = useMemo(() => {
    const boxId = parseInt(id, 10);
    const paramOrderId = recId ? parseInt(recId, 10) : NaN;
    return !Number.isNaN(paramOrderId) &&
      paramOrderId > 0 &&
      paramOrderId !== boxId
      ? paramOrderId
      : undefined;
  }, [id, recId]);

  const resolveOrderReceiptId = useCallback(async (): Promise<number> => {
    if (!credentials) throw new Error(t("koliDetay.missingInfo"));

    if (trustedOrderRecId !== undefined) {
      return trustedOrderRecId;
    }

    if (!receiptNo) throw new Error(t("koliDetay.orderNotResolved"));

    // Sipariş listesi ekranıyla aynı cache anahtarı; çoğu zaman hazır gelir.
    const orders = await queryClient.fetchQuery({
      queryKey: ["order-receipts", credentials.userCode],
      queryFn: () =>
        api.koliListesi.getOrderReceipts(
          credentials.userCode,
          credentials.password,
        ),
      staleTime: 60_000,
    });

    const match = orders.find(
      (order) => String(order.ReceiptNo).trim() === String(receiptNo).trim(),
    );
    if (!match) throw new Error(t("koliDetay.orderNotResolved"));

    return match.RecId;
  }, [credentials, trustedOrderRecId, receiptNo, queryClient, t]);

  // Koli detayından başka bir koli detayına geçerken stack büyütülmez: geri
  // tuşu koli detaylarında birikmek yerine detayın açıldığı listeye dönmeli.
  // İrsaliye ekranı yığında kalırsa seçimi de korunur.
  const openBoxDetail = useCallback(
    (detailParams: Record<string, string | undefined>) => {
      navigation.dispatch((state) => {
        const listIndex = state.routes.findIndex(
          (route) =>
            route.name === "koli-listesi" || route.name === "irskoli-listesi",
        );

        if (listIndex !== -1) {
          const newRoutes = state.routes.slice(0, listIndex + 1);
          newRoutes.push({ name: "koli-detay", params: detailParams } as any);

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
    [navigation],
  );

  const createNewBoxMutation = useMutation({
    mutationFn: async () => {
      if (!credentials || !id) {
        throw new Error(t("koliDetay.missingInfo"));
      }
      const orderReceiptId = await resolveOrderReceiptId();
      const result = await api.koliListesi.createEmptyKoliFromOrderReceipt(
        credentials.userCode,
        credentials.password,
        orderReceiptId,
      );
      console.log("Yeni Koli API Yanıtı:", JSON.stringify(result, null, 2));
      return { ...result, orderReceiptId };
    },
    onSuccess: (data) => {
      // Bu serviste success:"true" gelirken de iş kuralı hatası dönebiliyor.
      const isError =
        String(data.success) !== "true" ||
        (data.err !== undefined && data.err !== 0) ||
        !data.resultBoxId;

      if (isError) {
        playErrorSignal();
        showToast(
          t("koliDetay.operationFailed"),
          data.msg || t("koliDetay.newBoxFail"),
          "error",
        );
        return;
      }

      const newBoxCode = data.boxCode || String(data.resultBoxId);
      queryClient.invalidateQueries({ queryKey: ["koli-listesi"] });
      // Siparişin koli listesi de değişti (banner'daki listeye yansımalı).
      queryClient.invalidateQueries({ queryKey: ["order-boxes"] });

      // Yeni koliye geç, ama geri tuşu önceki koliye değil listeye dönsün.
      openBoxDetail({
        id: String(data.resultBoxId),
        recId: String(data.orderReceiptId),
        packageNo: newBoxCode,
        boxCode: newBoxCode,
        receiptNo,
        sipExp,
        initialSuccessMsg: t("koliDetay.newBoxCreated"),
      });
    },
    onError: (error) => {
      playErrorSignal();
      showToast(
        t("koliDetay.systemError"),
        error instanceof Error ? error.message : t("koliDetay.newBoxFail"),
        "error",
      );
    },
    // Sonuç ne olursa olsun modal kapanmalı; açık kalırsa toast arkasında kalır.
    onSettled: () => {
      setShowNewBoxConfirm(false);
    },
  });

  const koliDetailQuery = useQuery({
    // credentials objesi şifre içerir; cache anahtarına yalnızca kullanıcı
    // kodu girmeli (kullanıcı değişince cache ayrışması için yeterli).
    queryKey: ["koli-detay", id, credentials?.userCode],
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

  // Aynı siparişe bağlı koliler. Yalnızca modal açıldığında çekilir; sipariş
  // numarası ekrana parametre olarak geldiği için sorgu ondan beslenir.
  const orderBoxesQuery = useQuery({
    queryKey: ["order-boxes", receiptNo, credentials?.userCode],
    queryFn: async () => {
      if (!credentials || !receiptNo) {
        throw new Error(t("koliDetay.missingInfo"));
      }
      return api.koliListesi.getBoxesByOrderNo(
        credentials.userCode,
        credentials.password,
        receiptNo,
      );
    },
    enabled: showOrderBoxesModal && !!credentials && !!receiptNo,
    staleTime: 30_000,
  });

  const openOrderBoxes = useCallback(() => {
    // Barkod inputu her zaman odakta; klavye modalın üstüne binmesin.
    Keyboard.dismiss();
    setPendingSiblingBox(null);
    setShowOrderBoxesModal(true);
  }, []);

  const closeOrderBoxes = useCallback(() => {
    setShowOrderBoxesModal(false);
    setPendingSiblingBox(null);
    inputRef.current?.focus();
  }, []);

  const goToSiblingBox = useCallback(
    (box: KoliItem) => {
      setShowOrderBoxesModal(false);
      setPendingSiblingBox(null);
      openBoxDetail({
        id: String(box.id),
        packageNo: box.PackageNo,
        boxCode: box.PackageNo,
        receiptNo: box.ReceiptNo || receiptNo,
        // useLocalSearchParams değeri çözdüğü için sipExp kodlanmış gider.
        sipExp: box.SipExp ? encodeURIComponent(box.SipExp) : sipExp,
        // recId yalnızca gerçekten sipariş RecId'siyse aktarılır; koli
        // listesinden gelen "recId = koli id" değeri yeni kolinin yanlış
        // siparişe bağlanmasına yol açardı.
        recId:
          trustedOrderRecId !== undefined
            ? String(trustedOrderRecId)
            : undefined,
      });
    },
    [openBoxDetail, receiptNo, sipExp, trustedOrderRecId],
  );

  // Satır bileşeni memoize edildiği için barkod inputundaki her tuş vuruşu
  // artık tüm listeyi yeniden render etmez.
  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <KoliDetailRow
        item={item}
        index={index}
        styles={styles}
        isJust={!!justScanned && isScannedItem(item, justScanned)}
      />
    ),
    [styles, justScanned],
  );

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Stack.Screen
        options={{
          title: packageNo || boxCode || t("koliDetay.headerFallback"),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowDeleteBoxConfirm(true)}
              style={{ marginRight: 16 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={t("koliDetay.btnDeleteBox")}
              disabled={deleteBoxMutation.isPending}
            >
              {deleteBoxMutation.isPending ? (
                <ActivityIndicator size="small" color={theme.colors.error} />
              ) : (
                <Trash2 size={24} color={theme.colors.error} />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      {receiptNo || sipExp ? (
        <LinearGradient
          colors={[theme.colors.koliHero, theme.colors.koliHeroDeep]}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 0.8 }}
          style={styles.orderHero}
        >
          {receiptNo ? (
            <View style={styles.orderHeroRow}>
              {/* Sipariş numarası bir aksiyon: dokununca aynı siparişe bağlı
                  koliler listelenir. */}
              <TouchableOpacity
                style={styles.orderHeroNo}
                onPress={openOrderBoxes}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`${t("koliDetay.orderNo")}${receiptNo}`}
                accessibilityHint={t("koliDetay.orderBoxes.openHint")}
                testID="order-boxes-button"
              >
                <Text style={styles.orderHeroNoText} numberOfLines={1}>
                  {receiptNo}
                </Text>
                <ChevronRight size={20} color={theme.colors.onPrimary} />
              </TouchableOpacity>

              {/* Aynı siparişe yeni koli: aksiyon, ait olduğu siparişin yanında
                  durur; alttaki koli aksiyonları çubuğuna dokunmaz. */}
              <TouchableOpacity
                style={[
                  styles.newBoxButton,
                  createNewBoxMutation.isPending && styles.disabledButton,
                ]}
                onPress={() => setShowNewBoxConfirm(true)}
                disabled={createNewBoxMutation.isPending}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={t("koliDetay.btnNewBox")}
                testID="new-box-button"
              >
                {createNewBoxMutation.isPending ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.koliHero}
                  />
                ) : (
                  <PackagePlus size={20} color={theme.colors.koliHero} />
                )}
                <Text style={styles.newBoxButtonText}>
                  {t("koliDetay.btnNewBox")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {sipExp ? (
            <Text style={styles.orderHeroNote} numberOfLines={2}>
              {sipExp}
            </Text>
          ) : null}
        </LinearGradient>
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
              size={20}
              color={
                scanMode === "add"
                  ? theme.colors.onConfirm
                  : theme.colors.inkMuted
              }
            />
            <Text
              style={[
                styles.toggleText,
                scanMode === "add" && { color: theme.colors.onConfirm },
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
              size={20}
              color={
                scanMode === "delete"
                  ? theme.colors.onError
                  : theme.colors.error
              }
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
            scanError && { borderColor: theme.colors.errLine },
          ]}
        >
          <ScanBarcode
            size={24}
            color={
              scanError
                ? theme.colors.errInk
                : scanMode === "delete"
                  ? theme.colors.error
                  : theme.colors.okInk
            }
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
            {...manualKeyboard}
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
        ListHeaderComponent={
          items.length > 0 ? (
            <Text style={styles.countText}>
              <Text style={styles.countValue}>{items.length}</Text>{" "}
              {t("koliDetay.itemCountLabel")}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={48} color={theme.colors.inkSubtle} />
            <Text style={styles.emptyText}>{t("koliDetay.emptyBox")}</Text>
          </View>
        }
      />

      {/* ALT BUTONLAR */}
      <View
        style={[
          styles.buttonContainer,
          { paddingBottom: insets.bottom + theme.spacing.sm },
        ]}
      >
        <ActionButton
          text={t("koliDetay.btnPrint")}
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
          icon={<Unlock size={20} color={theme.colors.ink} />}
          onPress={() => setShowOpenBoxConfirm(true)}
          isLoading={openBoxMutation.isPending}
        />

        <ActionButton
          text={t("koliDetay.btnCloseBox")}
          icon={<Lock size={20} color={theme.colors.onConfirm} />}
          tone="ok"
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
        statusBarTranslucent
        navigationBarTranslucent
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
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.onPrimary}
                  />
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
        statusBarTranslucent
        navigationBarTranslucent
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
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.onSuccess}
                  />
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

      {/* --- YENİ KOLİ ONAY MODALI --- */}
      <Modal
        visible={showNewBoxConfirm}
        transparent
        statusBarTranslucent
        navigationBarTranslucent
        animationType="fade"
        onRequestClose={() => setShowNewBoxConfirm(false)}
      >
        <View style={styles.receiptModalOverlay}>
          <View style={styles.receiptModalContent}>
            <View style={styles.receiptIconContainer}>
              <PackagePlus size={48} color={theme.colors.primary} />
            </View>
            <Text style={styles.receiptModalTitle}>
              {t("koliDetay.modals.newBoxTitle")}
            </Text>
            {/* Sipariş numarası cümle içinde kaybolmasın diye vurgulanır;
                çeviri tek bir cümle olarak kalsın diye <Trans> kullanılıyor. */}
            <Text style={styles.receiptModalSubtitle}>
              <Trans
                i18nKey="koliDetay.modals.newBoxSubtitle"
                values={{ receiptNo }}
                components={{
                  no: <Text style={styles.receiptModalHighlight} />,
                }}
              />
            </Text>
            <View style={styles.receiptModalButtons}>
              <TouchableOpacity
                style={styles.receiptCancelButton}
                onPress={() => setShowNewBoxConfirm(false)}
                disabled={createNewBoxMutation.isPending}
              >
                <Text style={styles.receiptCancelText}>
                  {t("koliDetay.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.receiptConfirmButton,
                  createNewBoxMutation.isPending && styles.disabledButton,
                ]}
                onPress={() => createNewBoxMutation.mutate()}
                disabled={createNewBoxMutation.isPending}
              >
                {createNewBoxMutation.isPending ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.onPrimary}
                  />
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

      {/* --- KOLİ SİLME ONAY MODALI --- */}
      <Modal
        visible={showDeleteBoxConfirm}
        transparent
        statusBarTranslucent
        navigationBarTranslucent
        animationType="fade"
        onRequestClose={() => setShowDeleteBoxConfirm(false)}
      >
        <View style={styles.receiptModalOverlay}>
          <View style={styles.receiptModalContent}>
            <View
              style={[
                styles.receiptIconContainer,
                { backgroundColor: theme.colors.errorTint },
              ]}
            >
              <Trash2 size={48} color={theme.colors.error} />
            </View>
            <Text style={styles.receiptModalTitle}>
              {t("koliDetay.modals.deleteBoxTitle")}
            </Text>
            <Text style={styles.receiptModalSubtitle}>
              {items.length > 0
                ? t("koliDetay.modals.deleteBoxSubtitleWithItems", {
                    count: items.length,
                  })
                : t("koliDetay.modals.deleteBoxSubtitle")}
            </Text>
            <View style={styles.receiptModalButtons}>
              <TouchableOpacity
                style={styles.receiptCancelButton}
                onPress={() => setShowDeleteBoxConfirm(false)}
              >
                <Text style={styles.receiptCancelText}>
                  {t("koliDetay.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.receiptConfirmButton,
                  { backgroundColor: theme.colors.error },
                  deleteBoxMutation.isPending && styles.disabledButton,
                ]}
                onPress={() => deleteBoxMutation.mutate()}
                disabled={deleteBoxMutation.isPending}
              >
                {deleteBoxMutation.isPending ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.onError}
                  />
                ) : (
                  <Text
                    style={[
                      styles.receiptConfirmText,
                      { color: theme.colors.onError },
                    ]}
                  >
                    {t("koliDetay.modals.deleteBoxConfirm")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* OKUTMA HATASI BİLDİRİMİ */}
      {scanError ? (
        <View style={[styles.toastContainer, { bottom: noticeBottom }]}>
          <View
            style={[styles.toastContent, styles.toastError, styles.toastClosable]}
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
              accessibilityLabel={t("koliDetay.closeNotice")}
              testID="scan-error-close"
            >
              <X size={20} color={theme.colors.readMuted} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

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
        <View
          style={[
            styles.toastContent,
            toastContent.type === "error" && styles.toastError,
          ]}
        >
          <View
            style={[
              styles.toastMark,
              toastContent.type === "error" && styles.toastMarkError,
            ]}
          >
            {toastContent.type === "success" ? (
              <CheckCircle size={20} color={theme.colors.noticeOkInk} />
            ) : (
              <AlertCircle size={20} color={theme.colors.errInk} />
            )}
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
                ? t("koliDetay.outOfOrderTitle")
                : t("scanner.overLimit.title")}{" "}
            </Text>
            <Text style={styles.resultMessage}>
              {overLimitType === 1
                ? t("koliDetay.outOfOrderMessage")
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
                  //setAlwaysIgnoreLimit(true);
                  barcodeMutation.mutate({
                    scannedBarcode: pendingOverLimitBarcode,
                    controlType: -1,
                  });
                }}
              >
                <Text
                  style={[
                    styles.resultButtonText,
                    { color: theme.colors.onWarning },
                  ]}
                >
                  {t("scanner.overLimit.confirmBtn")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- SİPARİŞE BAĞLI KOLİLER: LİSTE + ONAY --- */}
      <Modal
        visible={showOrderBoxesModal}
        transparent
        statusBarTranslucent
        navigationBarTranslucent
        animationType="fade"
        onRequestClose={closeOrderBoxes}
      >
        <View style={styles.receiptModalOverlay}>
          <View style={styles.orderBoxesModalContent}>
            {pendingSiblingBox ? (
              // --- 2. ADIM: SEÇİLEN KOLİYE GEÇİŞ ONAYI ---
              <View style={styles.orderBoxesConfirm}>
                <View style={styles.receiptIconContainer}>
                  <Package size={48} color={theme.colors.primary} />
                </View>
                <Text style={styles.receiptModalTitle}>
                  {t("koliDetay.orderBoxes.confirmTitle")}
                </Text>
                <Text style={styles.receiptModalSubtitle}>
                  <Trans
                    i18nKey="koliDetay.orderBoxes.confirmMessage"
                    values={{ packageNo: pendingSiblingBox.PackageNo }}
                    components={{
                      no: <Text style={styles.receiptModalHighlight} />,
                    }}
                  />
                </Text>
                <View style={styles.receiptModalButtons}>
                  <TouchableOpacity
                    style={styles.receiptCancelButton}
                    onPress={() => setPendingSiblingBox(null)}
                  >
                    <Text style={styles.receiptCancelText}>
                      {t("koliDetay.orderBoxes.back")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.receiptConfirmButton}
                    onPress={() => goToSiblingBox(pendingSiblingBox)}
                    testID="order-box-confirm"
                  >
                    <Text style={styles.receiptConfirmText}>
                      {t("koliDetay.orderBoxes.confirmBtn")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // --- 1. ADIM: SİPARİŞE BAĞLI KOLİ LİSTESİ ---
              <>
                <Text style={styles.orderBoxesTitle}>
                  {t("koliDetay.orderBoxes.title")}
                </Text>
                <Text style={styles.orderBoxesSubtitle}>
                  {t("koliDetay.orderBoxes.subtitle", { receiptNo })}
                </Text>

                {orderBoxesQuery.isLoading ? (
                  <View style={styles.orderBoxesState}>
                    <ActivityIndicator
                      size="large"
                      color={theme.colors.primary}
                    />
                    <Text style={styles.orderBoxesStateText}>
                      {t("koliDetay.orderBoxes.loading")}
                    </Text>
                  </View>
                ) : orderBoxesQuery.isError ? (
                  <View style={styles.orderBoxesState}>
                    <AlertCircle size={32} color={theme.colors.error} />
                    <Text style={styles.orderBoxesStateText}>
                      {orderBoxesQuery.error instanceof Error
                        ? orderBoxesQuery.error.message
                        : t("koliDetay.defaultError")}
                    </Text>
                    <TouchableOpacity
                      style={styles.orderBoxesRetry}
                      onPress={() => orderBoxesQuery.refetch()}
                    >
                      <Text style={styles.orderBoxesRetryText}>
                        {t("koliDetay.orderBoxes.retry")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <FlatList
                    data={orderBoxesQuery.data || []}
                    style={styles.orderBoxesList}
                    keyExtractor={(box) => String(box.id)}
                    ItemSeparatorComponent={() => (
                      <View style={styles.orderBoxesSeparator} />
                    )}
                    renderItem={({ item: box }) => {
                      const isCurrent = String(box.id) === String(id);
                      return (
                        <TouchableOpacity
                          style={[
                            styles.orderBoxRow,
                            isCurrent && styles.orderBoxRowCurrent,
                          ]}
                          activeOpacity={0.75}
                          disabled={isCurrent}
                          onPress={() => setPendingSiblingBox(box)}
                          testID={`order-box-${box.id}`}
                        >
                          <View
                            style={[
                              styles.orderBoxRowIcon,
                              isCurrent && {
                                backgroundColor: theme.colors.surface3,
                              },
                            ]}
                          >
                            <Package
                              size={18}
                              color={
                                isCurrent
                                  ? theme.colors.inkSubtle
                                  : theme.colors.primary
                              }
                            />
                          </View>
                          <View style={styles.orderBoxRowInfo}>
                            <Text
                              style={styles.orderBoxRowTitle}
                              numberOfLines={1}
                            >
                              {box.PackageNo}
                            </Text>
                            {box.Explanation ? (
                              <Text
                                style={styles.orderBoxRowSub}
                                numberOfLines={1}
                              >
                                {box.Explanation}
                              </Text>
                            ) : null}
                          </View>
                          {isCurrent ? (
                            <View style={styles.orderBoxCurrentBadge}>
                              <Text style={styles.orderBoxCurrentBadgeText}>
                                {t("koliDetay.orderBoxes.current")}
                              </Text>
                            </View>
                          ) : (
                            <ChevronRight
                              size={18}
                              color={theme.colors.inkSubtle}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    }}
                    ListEmptyComponent={
                      <View style={styles.orderBoxesState}>
                        <Package size={32} color={theme.colors.inkSubtle} />
                        <Text style={styles.orderBoxesStateText}>
                          {t("koliDetay.orderBoxes.empty")}
                        </Text>
                      </View>
                    }
                  />
                )}

                <TouchableOpacity
                  style={styles.orderBoxesCloseButton}
                  onPress={closeOrderBoxes}
                >
                  <Text style={styles.receiptCancelText}>
                    {t("koliDetay.orderBoxes.close")}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <PrintBarcodeModal
        visible={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        koliId={id}
        onSuccess={(msg) => showToast(t("koliDetay.success"), msg, "success")}
        onError={(msg) => {
          playErrorSignal();
          showToast(t("koliDetay.error"), msg, "error");
        }}
      />
    </KeyboardAvoidingView>
  );
}

type KoliDetayStyles = ReturnType<typeof makeStyles>;

function getDisplayValue(item: any, key: string): string {
  const val = item[key];
  if (val === null || val === undefined || val === "") return "";
  return String(val);
}

// Okutulan barkod satırın h2 alanındaysa satır bu okutmanındır.
function isScannedItem(item: any, code: string): boolean {
  const h2Key = Object.keys(item).find((key) => key.startsWith("h2_"));
  return !!h2Key && item[h2Key] === code;
}

// Servisten "Lot Adeti" gelen alan adı kartta "Lot adeti" yazılır.
function sentenceCase(text: string): string {
  return text ? text[0] + text.slice(1).toLocaleLowerCase("tr") : text;
}

function labelOf(key: string): string {
  return sentenceCase(key.replace(/^sh_/, ""));
}

// Liste satırı: memo + useMemo sayesinde ekranın diğer state değişimlerinde
// (örn. barkod inputu) yeniden render edilmez; base64 dönüşümü ve alan
// çıkarımı yalnızca item değiştiğinde hesaplanır.
const KoliDetailRow = memo(function KoliDetailRow({
  item,
  index,
  styles,
  isJust,
}: {
  item: any;
  index: number;
  styles: KoliDetayStyles;
  isJust: boolean;
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const base64Thumbnail = useMemo(
    () =>
      byteArrayToBase64(
        item.Thumbnail as unknown as number[] | Uint8Array | string | null,
      ),
    [item.Thumbnail],
  );
  const hasValidThumbnail = !!base64Thumbnail;

  const { itemTitle, codeField, corner, facts } = useMemo(() => {
    const keys = Object.keys(item);

    const h1Key = keys.find((key) => key.startsWith("h1_"));
    const itemTitle = h1Key
      ? getDisplayValue(item, h1Key)
      : item.InventoryName || `${t("koliDetay.itemFallback")}${index + 1}`;

    const h2Key = keys.find((key) => key.startsWith("h2_"));
    let quantityLabel = t("koliDetay.quantity");
    let quantityValue = String(item.Quantity || "");
    let h2IsCode = false;

    if (h2Key) {
      quantityLabel = h2Key.replace("h2_", "");
      const rawQuantity = item[h2Key];

      const isBarcodeOrSerial = /barkod|seri|kod|no|ean/i.test(quantityLabel);
      const isVeryLargeNumber = String(rawQuantity).trim().length >= 8;
      h2IsCode = isBarcodeOrSerial || isVeryLargeNumber;

      quantityValue =
        rawQuantity &&
        !isNaN(Number(rawQuantity)) &&
        !h2IsCode
          ? Number(rawQuantity).toFixed(2)
          : String(rawQuantity || "");
    }

    const dynamicFields = keys
      .filter((key) => key.startsWith("sh_"))
      .slice(0, 6);

    // Miktar sağ üst köşede: servis sh_Miktar gönderiyorsa odur, göndermiyorsa
    // h2 alanı barkod değilse o alan miktar sayılır.
    const qtyKey = dynamicFields.find((key) => /^sh_miktar$/i.test(key));
    const corner = qtyKey
      ? { label: labelOf(qtyKey), value: getDisplayValue(item, qtyKey) }
      : !h2IsCode
        ? { label: quantityLabel, value: quantityValue }
        : null;
    const codeField =
      h2Key && (qtyKey || h2IsCode)
        ? { label: sentenceCase(quantityLabel), value: quantityValue }
        : null;
    const facts = dynamicFields.filter((key) => key !== qtyKey);

    return { itemTitle, codeField, corner, facts };
  }, [item, index, t]);

  return (
    <View style={[styles.card, isJust && styles.cardJust]}>
      <View style={styles.cardContent}>
        {hasValidThumbnail ? (
          <Image
            source={{ uri: `data:image/png;base64,${base64Thumbnail}` }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.iconContainer}>
            <Package size={24} color={theme.colors.koliInk} />
          </View>
        )}

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={3}>
            {itemTitle}
          </Text>

          {codeField ? (
            <View style={styles.codeRow}>
              <Text style={styles.codeLabel}>{codeField.label}</Text>
              <Text style={styles.codeValue}>{codeField.value}</Text>
            </View>
          ) : null}
        </View>

        {corner ? (
          <View style={styles.quantityCorner}>
            <Text style={styles.quantityLabel}>{corner.label}</Text>
            <Text style={styles.quantityValue}>{corner.value}</Text>
          </View>
        ) : null}
      </View>

      {facts.length > 0 && (
        <View style={styles.factsRow}>
          {facts.map((key) => {
            const val = getDisplayValue(item, key);
            const displayVal = val ? val : " ";

            return (
              <View key={key} style={styles.fact}>
                <Text style={styles.factLabel}>{labelOf(key)}</Text>
                <Text style={styles.factValue} numberOfLines={1}>
                  {displayVal}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
});

const makeStyles = (theme: Theme) => {
  const { colors, spacing, radius, type } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    topSection: {
      backgroundColor: colors.canvas,
      paddingTop: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xs,
      gap: spacing.sm,
    },
    toggleContainer: {
      flexDirection: "row",
      gap: spacing.xxs,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.cardLine,
      padding: spacing.xxs,
      ...theme.cardShadow,
    },
    toggleBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44,
      borderRadius: radius.control,
      gap: spacing.xs,
    },
    toggleBtnActiveAdd: {
      backgroundColor: colors.confirm,
    },
    toggleBtnActiveDelete: {
      backgroundColor: colors.error,
    },
    toggleText: {
      ...type.labelStrong,
      color: colors.inkMuted,
    },
    barcodeInputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.okInk,
      borderRadius: radius.control,
      paddingHorizontal: spacing.md,
      minHeight: 56,
      gap: spacing.sm,
      ...theme.cardShadow,
    },
    barcodeInputTop: {
      ...type.bodyLg,
      flex: 1,
      fontVariant: ["tabular-nums"],
      color: colors.ink,
    },
    content: {
      paddingTop: spacing.xxs,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
    },
    countText: {
      ...type.labelMd,
      color: colors.readMuted,
      paddingHorizontal: spacing.xxs,
      marginBottom: spacing.sm,
    },
    countValue: {
      color: colors.ink,
      fontWeight: "700" as const,
    },
    orderHero: {
      marginTop: spacing.sm,
      marginHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      paddingLeft: spacing.md,
      paddingRight: spacing.sm,
      borderRadius: radius.xl,
      gap: spacing.xxs,
    },
    orderHeroRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    orderHeroNo: {
      flex: 1,
      minWidth: 0,
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xxs,
    },
    orderHeroNoText: {
      ...type.codeLg,
      fontSize: 18,
      color: colors.onPrimary,
    },
    orderHeroNote: {
      ...type.labelMd,
      color: colors.onPrimary,
    },
    newBoxButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      backgroundColor: colors.onPrimary,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      // Dokunma alanı en az 44pt olmalı (iOS/Android kılavuzu).
      minHeight: 44,
      minWidth: 44,
    },
    newBoxButtonText: {
      ...type.labelStrong,
      color: colors.koliHero,
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
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.cardLine,
      ...theme.cardShadow,
    },
    // Son eklenen ürün: başarı bildirimi süresince.
    cardJust: {
      backgroundColor: colors.okTile,
      borderColor: colors.confirm,
    },
    cardContent: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: radius.control,
      backgroundColor: colors.koliTile,
      alignItems: "center",
      justifyContent: "center",
    },
    thumbnailImage: {
      width: 44,
      height: 44,
      borderRadius: radius.control,
      backgroundColor: colors.surface2,
    },
    itemInfo: {
      flex: 1,
      minWidth: 0,
      gap: spacing.xxs,
    },
    itemName: {
      ...type.codeLg,
      color: colors.ink,
    },
    codeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
    },
    codeLabel: {
      ...type.labelMd,
      color: colors.readMuted,
    },
    codeValue: {
      ...type.labelMd,
      fontVariant: ["tabular-nums"],
      color: colors.ink,
    },
    quantityCorner: {
      alignItems: "flex-end",
      minWidth: 64,
    },
    quantityLabel: {
      ...type.labelMd,
      color: colors.readMuted,
    },
    quantityValue: {
      ...type.quantity,
      color: colors.okInk,
    },
    factsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      columnGap: spacing.xl,
      rowGap: spacing.xs,
      marginTop: spacing.sm,
      paddingTop: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.bandLine,
    },
    fact: {
      minWidth: 0,
      flexShrink: 1,
    },
    factLabel: {
      ...type.labelMd,
      fontWeight: "400" as const,
      color: colors.readMuted,
    },
    factValue: {
      ...type.bodyLg,
      fontWeight: "600" as const,
      color: colors.ink,
    },
    buttonContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingTop: spacing.xs,
      paddingHorizontal: spacing.md,
      gap: spacing.xs,
      backgroundColor: colors.canvas,
      borderTopWidth: 1,
      borderTopColor: colors.cardLine,
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
    // Modal metninde öne çıkarılan değer (örn. sipariş numarası).
    receiptModalHighlight: {
      color: colors.primary,
      fontWeight: "700" as const,
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
    // Siparişe bağlı koliler modalı: liste barındırdığı için yüksekliği
    // sınırlanır, içerik kaydırılır.
    orderBoxesModalContent: {
      backgroundColor: colors.surface1,
      borderRadius: radius.xxl,
      padding: spacing.lg,
      width: "100%",
      maxWidth: 360,
      maxHeight: "80%",
      borderWidth: 1,
      borderColor: colors.hairline,
    },
    orderBoxesConfirm: {
      alignItems: "center",
    },
    orderBoxesTitle: {
      ...type.cardTitle,
      fontSize: 18,
      color: colors.ink,
      textAlign: "center",
    },
    orderBoxesSubtitle: {
      ...type.bodySm,
      color: colors.inkMuted,
      textAlign: "center",
      marginTop: spacing.xxs,
      marginBottom: spacing.md,
    },
    orderBoxesList: {
      // RN'de varsayılan flexShrink 0; liste uzayınca modalın maxHeight'ını
      // taşırıp "Kapat" butonunu ekran dışına itmesin.
      flexGrow: 0,
      flexShrink: 1,
    },
    orderBoxesSeparator: {
      height: spacing.xs,
    },
    orderBoxRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.surface2,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.hairline,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      minHeight: 56,
    },
    orderBoxRowCurrent: {
      borderColor: colors.primary,
      backgroundColor: colors.surface1,
    },
    orderBoxRowIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.sm,
      backgroundColor: colors.primaryTint,
      alignItems: "center",
      justifyContent: "center",
    },
    orderBoxRowInfo: {
      flex: 1,
      gap: 2,
    },
    orderBoxRowTitle: {
      ...type.body,
      fontWeight: "600" as const,
      color: colors.ink,
    },
    orderBoxRowSub: {
      ...type.bodySm,
      color: colors.inkMuted,
    },
    orderBoxCurrentBadge: {
      backgroundColor: colors.primaryTint,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
    },
    orderBoxCurrentBadgeText: {
      ...type.caption,
      color: colors.primary,
      fontWeight: "700" as const,
    },
    orderBoxesState: {
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      paddingVertical: spacing.xl,
    },
    orderBoxesStateText: {
      ...type.bodySm,
      color: colors.inkMuted,
      textAlign: "center",
    },
    orderBoxesRetry: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.hairlineStrong,
      backgroundColor: colors.surface2,
      paddingHorizontal: spacing.lg,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    orderBoxesRetryText: {
      ...type.button,
      color: colors.ink,
    },
    orderBoxesCloseButton: {
      marginTop: spacing.md,
      backgroundColor: colors.surface2,
      borderRadius: radius.md,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.hairlineStrong,
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
    },
    // Kapat düğmesi kendi boşluğunu getirir.
    toastClosable: {
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
  });
};
