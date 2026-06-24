import { useTranslation } from "react-i18next";
import { Stack, useRouter } from "expo-router";
import {
  Settings,
  RefreshCw,
  Save,
  CheckCircle,
  CheckSquare,
  Square,
} from "lucide-react-native";
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
import { useApiConfig } from "@/contexts/ApiConfigContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { Theme, ThemeMode } from "@/constants/theme";
import { SOUND_OPTIONS } from "@/constants/sounds";
import i18n from "../locales/i18n";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { theme, themeMode, setThemeMode } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    apiBaseUrl,
    companyCode,
    companyPassword,
    warehouseCode,
    errorSound,
    useExistingBox,
    skipWeightInput,
    updateApiUrl,
    updateCompanyCode,
    updateCompanyPassword,
    updateWarehouseCode,
    updateErrorSound,
    updateUseExistingBox,
    updateSkipWeightInput,
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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();

  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(50)).current;

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

    setUrl(apiBaseUrl);
    setCode(companyCode);
    setPassword(companyPassword);
    setWhCode(warehouseCode);
    setExistingBoxMode(useExistingBox || false);
    setSkipWeightMode(skipWeightInput || false);
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

    setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        router.back();
      });
    }, 1500);
  };

  const handleSave = async () => {
    if (!validateUrl(url)) {
      return;
    }

    try {
      await updateApiUrl(url.trim());
      await updateCompanyCode(code.trim());
      await updateCompanyPassword(password.trim());
      await updateWarehouseCode(whCode.trim());
      await updateErrorSound(selectedSound);
      await updateUseExistingBox(existingBoxMode);
      await updateSkipWeightInput(skipWeightMode);

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

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("settings.headerTitle"),
          headerStyle: {
            backgroundColor: theme.colors.canvas,
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
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Settings
                    size={36}
                    color={theme.colors.primary}
                    strokeWidth={2}
                  />
                </View>
                <Text style={styles.title}>{t("settings.pageTitle")}</Text>
                <Text style={styles.subtitle}>
                  {t("settings.pageSubtitle")}
                </Text>
              </View>

              <View style={styles.form}>
                {/* Theme selector */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t("settings.theme")}</Text>
                  <View style={styles.segment}>
                    {themeOptionsList.map((option) => {
                      const active = themeMode === option.id;
                      return (
                        <Pressable
                          key={option.id}
                          style={[
                            styles.segmentOption,
                            active && styles.segmentOptionActive,
                          ]}
                          onPress={() => setThemeMode(option.id)}
                        >
                          <Text
                            style={[
                              styles.segmentText,
                              active && styles.segmentTextActive,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Language selector */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t("settings.language")}</Text>
                  <View style={styles.segment}>
                    {languageOptions.map((option) => {
                      const active = i18n.language === option.id;
                      return (
                        <Pressable
                          key={option.id}
                          style={[
                            styles.segmentOption,
                            active && styles.segmentOptionActive,
                          ]}
                          onPress={() => i18n.changeLanguage(option.id)}
                        >
                          <Text
                            style={[
                              styles.segmentText,
                              active && styles.segmentTextActive,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t("settings.labels.apiUrl")}
                  </Text>
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
                    testID="api-url-input"
                    multiline
                  />
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
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
                    testID="company-code-input"
                  />
                </View>

                <View style={styles.inputGroup}>
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
                    testID="company-password-input"
                  />
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
                    testID="warehouse-id-input"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t("settings.labels.errorSound")}
                  </Text>
                  <View style={styles.soundSelectorContainer}>
                    {SOUND_OPTIONS.map((option) => {
                      const active = selectedSound === option.id;
                      return (
                        <Pressable
                          key={option.id}
                          style={[
                            styles.soundOption,
                            active && styles.soundOptionSelected,
                          ]}
                          onPress={() => {
                            setSelectedSound(option.id);
                            playErrorSound(option.file);
                          }}
                        >
                          <Text
                            style={[
                              styles.soundOptionText,
                              active && styles.soundOptionTextSelected,
                            ]}
                          >
                            {t(`settings.sounds.${option.id}`, {
                              defaultValue: option.name,
                            })}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t("settings.labels.boxMode")}
                  </Text>
                  <Pressable
                    style={styles.checkboxContainer}
                    onPress={() => setExistingBoxMode(!existingBoxMode)}
                  >
                    {existingBoxMode ? (
                      <CheckSquare size={24} color={theme.colors.primary} />
                    ) : (
                      <Square size={24} color={theme.colors.inkSubtle} />
                    )}
                    <View style={styles.checkboxTextContainer}>
                      <Text style={styles.checkboxTitle}>
                        {t("settings.boxModeDesc.title")}
                      </Text>
                      <Text style={styles.checkboxSubtitle}>
                        {t("settings.boxModeDesc.subtitle")}
                      </Text>
                    </View>
                  </Pressable>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t("settings.labels.skipWeightMode")}
                  </Text>
                  <Pressable
                    style={styles.checkboxContainer}
                    onPress={() => setSkipWeightMode(!skipWeightMode)}
                  >
                    {skipWeightMode ? (
                      <CheckSquare size={24} color={theme.colors.primary} />
                    ) : (
                      <Square size={24} color={theme.colors.inkSubtle} />
                    )}
                    <View style={styles.checkboxTextContainer}>
                      <Text style={styles.checkboxTitle}>
                        {t("settings.weightModeDesc.title")}
                      </Text>
                      <Text style={styles.checkboxSubtitle}>
                        {t("settings.weightModeDesc.subtitle")}
                      </Text>
                    </View>
                  </Pressable>
                </View>

                <View style={styles.buttonGroup}>
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
                        color={theme.colors.onPrimary}
                        size="small"
                      />
                    ) : (
                      <>
                        <Save size={20} color={theme.colors.onPrimary} />
                        <Text style={styles.primaryButtonText}>
                          {t("settings.buttons.save")}
                        </Text>
                      </>
                    )}
                  </Pressable>

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
                </View>
              </View>

              <View style={styles.helpBox}>
                <Text style={styles.helpTitle}>{t("settings.help.title")}</Text>
                <Text style={styles.helpText}>{t("settings.help.text")}</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

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
          <View style={styles.toastContent}>
            <CheckCircle size={22} color={theme.colors.success} />
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
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xxl,
    },
    header: {
      alignItems: "center",
      marginBottom: spacing.xxl,
    },
    iconContainer: {
      width: 72,
      height: 72,
      borderRadius: radius.xl,
      backgroundColor: colors.surface1,
      borderWidth: 1,
      borderColor: colors.hairline,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },
    title: {
      ...type.displayLg,
      color: colors.ink,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...type.body,
      color: colors.inkMuted,
      textAlign: "center",
    },
    form: {
      gap: spacing.lg,
    },
    inputGroup: {
      gap: spacing.xs,
    },
    label: {
      ...type.label,
      color: colors.inkMuted,
      textTransform: "uppercase",
    },
    segment: {
      flexDirection: "row",
      backgroundColor: colors.surface2,
      borderRadius: radius.md,
      padding: spacing.xxs,
      gap: spacing.xxs,
    },
    segmentOption: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: radius.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    segmentOptionActive: {
      backgroundColor: colors.surface4,
    },
    segmentText: {
      ...type.button,
      color: colors.inkSubtle,
    },
    segmentTextActive: {
      color: colors.ink,
    },
    input: {
      ...type.body,
      backgroundColor: colors.surface2,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      minHeight: 50,
      color: colors.ink,
      borderWidth: 1,
      borderColor: colors.hairlineStrong,
    },
    multilineInput: {
      paddingTop: spacing.md,
      textAlignVertical: "top",
    },
    inputFocused: {
      borderWidth: 2,
      borderColor: colors.primaryRing,
    },
    inputError: {
      borderWidth: 2,
      borderColor: colors.error,
    },
    errorText: {
      ...type.bodySm,
      color: colors.error,
    },
    buttonGroup: {
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    button: {
      borderRadius: radius.md,
      paddingVertical: 14,
      paddingHorizontal: spacing.lg,
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    primaryButtonPressed: {
      backgroundColor: colors.primaryPress,
    },
    primaryButtonText: {
      ...type.button,
      color: colors.onPrimary,
    },
    secondaryButton: {
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.hairlineStrong,
    },
    secondaryButtonPressed: {
      backgroundColor: colors.surface3,
    },
    secondaryButtonText: {
      ...type.button,
      color: colors.ink,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    helpBox: {
      marginTop: spacing.xl,
      padding: spacing.md,
      backgroundColor: colors.primaryTint,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.hairlineStrong,
    },
    helpTitle: {
      ...type.label,
      textTransform: "uppercase",
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    helpText: {
      ...type.bodySm,
      color: colors.inkMuted,
      lineHeight: 20,
    },
    toastContainer: {
      position: "absolute",
      bottom: spacing.xxl,
      left: spacing.lg,
      right: spacing.lg,
      alignItems: "center",
      zIndex: 99,
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
      gap: spacing.sm,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    toastText: {
      ...type.body,
      color: colors.ink,
      fontWeight: "600",
    },
    soundSelectorContainer: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    soundOption: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xxs,
      borderRadius: radius.md,
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.hairlineStrong,
      alignItems: "center",
      justifyContent: "center",
    },
    soundOptionSelected: {
      backgroundColor: colors.primaryTint,
      borderColor: colors.primary,
    },
    soundOptionText: {
      ...type.bodySm,
      color: colors.inkMuted,
      fontWeight: "600",
      textAlign: "center",
    },
    soundOptionTextSelected: {
      color: colors.ink,
    },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface1,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.hairline,
      gap: spacing.sm,
    },
    checkboxTextContainer: {
      flex: 1,
    },
    checkboxTitle: {
      ...type.body,
      fontWeight: "600",
      color: colors.ink,
      marginBottom: 2,
    },
    checkboxSubtitle: {
      ...type.bodySm,
      color: colors.inkMuted,
      lineHeight: 16,
    },
  });
};
