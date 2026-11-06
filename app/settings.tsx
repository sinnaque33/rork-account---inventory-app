import { useTranslation } from "react-i18next";
import { Stack, useRouter } from "expo-router";
import { Check, RefreshCw, Save } from "lucide-react-native";
import { useState, useEffect, useRef, useMemo } from "react";
import { Audio, InterruptionModeAndroid } from "expo-av";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
  Easing,
  Vibration,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApiConfig } from "@/contexts/ApiConfigContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { Theme, ThemeMode } from "@/constants/theme";
import { SOUND_OPTIONS } from "@/constants/sounds";
import i18n from "../locales/i18n";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { theme, themeMode, setThemeMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    apiBaseUrl,
    companyCode,
    companyPassword,
    warehouseCode,
    errorSound,
    useExistingBox,
    skipWeightInput,
    skipStockControl,
    updateConfig,
    resetToDefault,
    isLoading,
    isSaving,
    defaultUrl,
  } = useApiConfig();

  const [url, setUrl] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [whCode, setWhCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [selectedSound, setSelectedSound] = useState<string>(
    errorSound || "error_1",
  );
  const [existingBoxMode, setExistingBoxMode] = useState<boolean>(
    useExistingBox || false,
  );
  const [skipWeightMode, setSkipWeightMode] = useState<boolean>(
    skipWeightInput || false,
  );
  const [skipStockMode, setSkipStockMode] = useState<boolean>(
    skipStockControl || false,
  );
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();

  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(50)).current;
  const toastHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ekran kapanırken bekleyen toast zamanlayıcısını iptal et; aksi halde
  // kullanıcı kendisi geri döndükten sonra timer dolunca router.back()
  // ikinci kez tetiklenip bir ekran daha geri gider.
  useEffect(() => {
    return () => {
      if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
    };
  }, []);

  useEffect(() => {
    const setupAudio = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: true,
      });
    };
    setupAudio();
  }, []);

  useEffect(() => {
    setUrl(apiBaseUrl);
    setCode(companyCode);
    setPassword(companyPassword);
    setWhCode(warehouseCode);
    setExistingBoxMode(useExistingBox || false);
    setSkipWeightMode(skipWeightInput || false);
    setSkipStockMode(skipStockControl || false);
    if (errorSound) {
      setSelectedSound(errorSound);
    }
  }, [
    apiBaseUrl,
    companyCode,
    companyPassword,
    warehouseCode,
    errorSound,
    useExistingBox,
    skipWeightInput,
    skipStockControl,
  ]);

  const playErrorSound = async (soundFile: any) => {
    try {
      if (!soundFile) {
        if (Platform.OS === "android") {
          Vibration.vibrate([0, 400, 100, 400]);
        } else {
          Vibration.vibrate();
        }
        return;
      }

      const { sound } = await Audio.Sound.createAsync(soundFile, {
        shouldPlay: true,
        volume: 1.0,
      });

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (err) {
      console.log("Ses çalınamadı:", err);
    }
  };

  const validateUrl = (text: string): boolean => {
    if (!text) {
      setError(t("settings.alerts.urlRequired"));
      return false;
    }
    if (!text.startsWith("http://") && !text.startsWith("https://")) {
      setError(t("settings.alerts.urlInvalid"));
      return false;
    }
    setError("");
    return true;
  };

  const showSuccessToast = () => {
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
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(({ finished }) => {
        // Animasyon yarıda kesildiyse (ekran kapanıyorsa) tekrar geri gitme.
        if (finished) {
          router.back();
        }
      });
    }, 1500);
  };

  const handleSave = async () => {
    if (!validateUrl(url)) {
      return;
    }

    try {
      await updateConfig({
        url: url.trim(),
        companyCode: code.trim(),
        companyPassword: password.trim(),
        warehouseCode: whCode.trim(),
        errorSound: selectedSound,
        useExistingBox: existingBoxMode,
        skipWeightInput: skipWeightMode,
        skipStockControl: skipStockMode,
      });

      showSuccessToast();
    } catch {
      Alert.alert(
        t("settings.alerts.saveErrorTitle"),
        t("settings.alerts.saveErrorMsg"),
      );
    }
  };

  const handleReset = () => {
    Alert.alert(t("settings.alerts.resetTitle"), t("settings.alerts.resetMsg"), [
      { text: t("settings.alerts.cancel"), style: "cancel" },
      {
        text: t("settings.alerts.resetBtn"),
        style: "destructive",
        onPress: async () => {
          await resetToDefault();
          setUrl(defaultUrl);
          setCode("");
          setPassword("");
          setWhCode("");
          setSelectedSound("error_1");
          setExistingBoxMode(false);
          setSkipWeightMode(false);
          setSkipStockMode(false);
          Alert.alert(
            t("settings.alerts.resetSuccessTitle"),
            t("settings.alerts.resetSuccessMsg"),
          );
        },
      },
    ]);
  };

  const inputStyle = (field: string) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const languageOptions: { id: string; label: string }[] = [
    { id: "tr", label: "🇹🇷 Türkçe" },
    { id: "en", label: "🇬🇧 English" },
  ];

  const themeOptionsList: { id: ThemeMode; label: string }[] = [
    { id: "dark", label: t("settings.themeOptions.dark") },
    { id: "light", label: t("settings.themeOptions.light") },
  ];

  const soundOptions = SOUND_OPTIONS.map((option) => ({
    id: option.id,
    label: t(`settings.sounds.${option.id}`, { defaultValue: option.name }),
    file: option.file,
  }));

  // Tema, dil ve hata uyarısı aynı segment kontrolüyle seçilir.
  const renderSegment = <T extends { id: string; label: string }>(
    label: string,
    options: T[],
    selectedId: string,
    onSelect: (option: T) => void,
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={styles.segment}
        accessibilityRole="radiogroup"
        accessibilityLabel={label}
      >
        {options.map((option) => {
          const active = selectedId === option.id;
          return (
            <Pressable
              key={option.id}
              style={[
                styles.segmentOption,
                active && styles.segmentOptionActive,
              ]}
              onPress={() => onSelect(option)}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
            >
              <Text
                style={[styles.segmentText, active && styles.segmentTextActive]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  // Açık/kapalı tercihler: satırın tamamı dokunulabilir, anahtar sağda.
  const renderSwitch = (
    title: string,
    subtitle: string,
    value: boolean,
    onToggle: () => void,
  ) => (
    <Pressable
      style={styles.switchRow}
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={title}
      accessibilityHint={subtitle}
    >
      <View style={styles.switchTextContainer}>
        <Text style={styles.switchTitle}>{title}</Text>
        <Text style={styles.hint}>{subtitle}</Text>
      </View>
      <View style={[styles.switchTrack, value && styles.switchTrackOn]}>
        <View style={[styles.switchThumb, value && styles.switchThumbOn]} />
      </View>
    </Pressable>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("settings.headerTitle"),
          headerStyle: {
            backgroundColor: theme.colors.header,
          },
          headerTintColor: theme.colors.ink,
          headerTitleStyle: {
            fontWeight: "600" as const,
          },
        }}
      />
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + theme.spacing.xl },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.title} accessibilityRole="header">
                {t("settings.pageTitle")}
              </Text>
              <Text style={styles.subtitle}>{t("settings.pageSubtitle")}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                {t("settings.sections.appearance")}
              </Text>
              {renderSegment(
                t("settings.theme"),
                themeOptionsList,
                themeMode,
                (option) => setThemeMode(option.id),
              )}
              {renderSegment(
                t("settings.language"),
                languageOptions,
                i18n.language,
                (option) => i18n.changeLanguage(option.id),
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                {t("settings.sections.connection")}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("settings.labels.apiUrl")}</Text>
                <TextInput
                  style={[
                    inputStyle("url"),
                    styles.multilineInput,
                    error ? styles.inputError : null,
                  ]}
                  placeholder={t("settings.placeholders.apiUrl")}
                  placeholderTextColor={theme.colors.inkSubtle}
                  value={url}
                  onChangeText={(text) => {
                    setUrl(text);
                    if (error) validateUrl(text);
                  }}
                  onFocus={() => setFocusedField("url")}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  editable={!isSaving}
                  accessibilityLabel={t("settings.labels.apiUrl")}
                  testID="api-url-input"
                  multiline
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <Text style={styles.hint}>{t("settings.hints.apiUrl")}</Text>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, styles.inputRowItem]}>
                  <Text style={styles.label}>
                    {t("settings.labels.companyCode")}
                  </Text>
                  <TextInput
                    style={inputStyle("code")}
                    placeholder={t("settings.placeholders.companyCode")}
                    placeholderTextColor={theme.colors.inkSubtle}
                    value={code}
                    onChangeText={setCode}
                    onFocus={() => setFocusedField("code")}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isSaving}
                    accessibilityLabel={t("settings.labels.companyCode")}
                    testID="company-code-input"
                  />
                </View>

                <View style={[styles.inputGroup, styles.inputRowItem]}>
                  <Text style={styles.label}>
                    {t("settings.labels.companyPassword")}
                  </Text>
                  <TextInput
                    style={inputStyle("password")}
                    placeholder={t("settings.placeholders.companyPassword")}
                    placeholderTextColor={theme.colors.inkSubtle}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                    editable={!isSaving}
                    accessibilityLabel={t("settings.labels.companyPassword")}
                    testID="company-password-input"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {t("settings.labels.warehouseCode")}
                </Text>
                <TextInput
                  style={inputStyle("whCode")}
                  placeholder={t("settings.placeholders.warehouseCode")}
                  placeholderTextColor={theme.colors.inkSubtle}
                  value={whCode}
                  onChangeText={setWhCode}
                  onFocus={() => setFocusedField("whCode")}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="numeric"
                  editable={!isSaving}
                  accessibilityLabel={t("settings.labels.warehouseCode")}
                  testID="warehouse-id-input"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                {t("settings.sections.preferences")}
              </Text>
              {renderSegment(
                t("settings.labels.errorSound"),
                soundOptions,
                selectedSound,
                (option) => {
                  setSelectedSound(option.id);
                  playErrorSound(option.file);
                },
              )}
              {renderSwitch(
                t("settings.boxModeDesc.title"),
                t("settings.boxModeDesc.subtitle"),
                existingBoxMode,
                () => setExistingBoxMode(!existingBoxMode),
              )}
              {renderSwitch(
                t("settings.weightModeDesc.title"),
                t("settings.weightModeDesc.subtitle"),
                skipWeightMode,
                () => setSkipWeightMode(!skipWeightMode),
              )}
              {renderSwitch(
                t("settings.stockControlDesc.title"),
                t("settings.stockControlDesc.subtitle"),
                skipStockMode,
                () => setSkipStockMode(!skipStockMode),
              )}
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.secondaryButton,
                  pressed && styles.secondaryButtonPressed,
                  isSaving && styles.buttonDisabled,
                ]}
                onPress={handleReset}
                disabled={isSaving}
                testID="reset-button"
              >
                <RefreshCw size={20} color={theme.colors.ink} />
                <Text style={styles.secondaryButtonText}>
                  {t("settings.buttons.reset")}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.primaryButton,
                  pressed && styles.primaryButtonPressed,
                  isSaving && styles.buttonDisabled,
                ]}
                onPress={handleSave}
                disabled={isSaving}
                testID="save-button"
              >
                {isSaving ? (
                  <ActivityIndicator
                    color={theme.colors.onConfirm}
                    size="small"
                  />
                ) : (
                  <>
                    <Save size={20} color={theme.colors.onConfirm} />
                    <Text style={styles.primaryButtonText}>
                      {t("settings.buttons.save")}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <Animated.View
          style={[
            styles.toastContainer,
            {
              bottom: insets.bottom + theme.spacing.xxl,
              opacity: toastOpacity,
              transform: [{ translateY: toastTranslateY }],
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.toastContent}>
            <View style={styles.toastMark}>
              <Check size={20} color={theme.colors.noticeOkInk} strokeWidth={2.4} />
            </View>
            <Text style={styles.toastText}>
              {t("settings.alerts.toastSuccess")}
            </Text>
          </View>
        </Animated.View>
      </View>
    </>
  );
}

const makeStyles = (theme: Theme) => {
  const { colors, spacing, radius, type } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.canvas,
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
    },
    header: {
      marginBottom: spacing.xl,
    },
    title: {
      ...type.pageTitle,
      color: colors.ink,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...type.body,
      color: colors.inkMuted,
    },
    // Görünüm, Bağlantı ve depo, Çalışma tercihleri: ince çizgiyle ayrılır.
    section: {
      gap: spacing.lg,
      paddingBottom: spacing.xxl,
      marginBottom: spacing.xxl,
      borderBottomWidth: 1,
      borderBottomColor: colors.hairlineStrong,
    },
    sectionTitle: {
      ...type.labelStrong,
      color: colors.inkMuted,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    inputGroup: {
      gap: spacing.xs,
    },
    inputRow: {
      flexDirection: "row",
      gap: spacing.md,
    },
    inputRowItem: {
      flex: 1,
    },
    label: {
      ...type.labelMd,
      color: colors.ink,
    },
    hint: {
      ...type.hint,
      color: colors.inkMuted,
    },
    segment: {
      flexDirection: "row",
      backgroundColor: theme.isDark ? colors.surface1 : colors.raised,
      borderRadius: radius.control,
      borderWidth: 1,
      borderColor: theme.isDark ? colors.hairlineStrong : "transparent",
      padding: spacing.xxs,
      gap: spacing.xxs,
    },
    segmentOption: {
      flex: 1,
      minHeight: 48,
      paddingHorizontal: spacing.xs,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
    },
    segmentOptionActive: {
      backgroundColor: theme.isDark ? colors.surface3 : colors.surface1,
      borderColor: theme.isDark ? colors.controlLine : colors.hairline,
    },
    segmentText: {
      ...type.labelMd,
      color: colors.inkMuted,
    },
    segmentTextActive: {
      color: colors.ink,
    },
    input: {
      ...type.body,
      backgroundColor: colors.surface1,
      borderRadius: radius.control,
      paddingHorizontal: spacing.md,
      minHeight: 56,
      color: colors.ink,
      borderWidth: 1,
      borderColor: colors.controlLine,
    },
    multilineInput: {
      minHeight: 72,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
      textAlignVertical: "top",
    },
    // Odak halkası nötr; kırmızı halka hata durumuyla karışır.
    inputFocused: {
      borderWidth: 2,
      borderColor: colors.ink,
    },
    inputError: {
      borderWidth: 2,
      borderColor: colors.error,
    },
    errorText: {
      ...type.hint,
      color: colors.error,
    },
    switchRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
    },
    switchTextContainer: {
      flex: 1,
      gap: spacing.xxs,
    },
    switchTitle: {
      ...type.labelStrong,
      color: colors.ink,
    },
    switchTrack: {
      width: 40,
      height: 24,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.controlLine,
      backgroundColor: colors.surface3,
    },
    switchTrackOn: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    switchThumb: {
      position: "absolute",
      top: 3,
      left: 3,
      width: 16,
      height: 16,
      borderRadius: radius.pill,
      backgroundColor: colors.inkMuted,
    },
    switchThumbOn: {
      left: 19,
      backgroundColor: colors.onPrimary,
    },
    buttonRow: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    button: {
      borderRadius: radius.control,
      borderWidth: 1,
      paddingHorizontal: spacing.sm,
      minHeight: 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
    },
    primaryButton: {
      flex: 1.5,
      backgroundColor: colors.confirm,
      borderColor: colors.confirm,
    },
    primaryButtonPressed: {
      backgroundColor: colors.confirmPress,
      borderColor: colors.confirmPress,
    },
    primaryButtonText: {
      ...type.labelStrong,
      color: colors.onConfirm,
    },
    secondaryButton: {
      flex: 1,
      backgroundColor: colors.surface1,
      borderColor: colors.hairlineStrong,
    },
    secondaryButtonPressed: {
      backgroundColor: colors.surface3,
    },
    secondaryButtonText: {
      ...type.labelStrong,
      color: colors.ink,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    toastContainer: {
      position: "absolute",
      left: spacing.md,
      right: spacing.md,
      alignItems: "center",
      zIndex: 99,
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
    toastMark: {
      width: 32,
      height: 32,
      borderRadius: radius.pill,
      backgroundColor: colors.noticeOkTile,
      alignItems: "center",
      justifyContent: "center",
    },
    toastText: {
      ...type.body,
      color: colors.ink,
      fontWeight: "600",
    },
  });
};
