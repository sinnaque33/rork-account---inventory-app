import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import {
  Settings,
  RefreshCw,
  Save,
  CheckCircle,
  CheckSquare,
  Square,
} from "lucide-react-native";
import { useState, useEffect, useRef } from "react";
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
import colors from "@/constants/colors";
import { SOUND_OPTIONS } from "@/constants/sounds";
import i18n from "./i18n";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const {
    apiBaseUrl,
    companyCode,
    companyPassword,
    warehouseId,
    errorSound,
    useExistingBox,
    updateApiUrl,
    updateCompanyCode,
    updateCompanyPassword,
    updateWarehouseId,
    updateErrorSound,
    updateUseExistingBox,
    resetToDefault,
    isLoading,
    isSaving,
    defaultUrl,
  } = useApiConfig();

  const [url, setUrl] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [whId, setWhId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [selectedSound, setSelectedSound] = useState<string>(
    errorSound || "error_1",
  );
  const [existingBoxMode, setExistingBoxMode] = useState<boolean>(
    useExistingBox || false,
  );
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
    setWhId(warehouseId);
    setExistingBoxMode(useExistingBox || false);
    if (errorSound) {
      setSelectedSound(errorSound);
    }
  }, [
    apiBaseUrl,
    companyCode,
    companyPassword,
    warehouseId,
    errorSound,
    useExistingBox,
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
      await updateWarehouseId(whId.trim());
      await updateErrorSound(selectedSound);
      await updateUseExistingBox(existingBoxMode);

      showSuccessToast();
    } catch {
      Alert.alert(
        t("settings.alerts.saveErrorTitle"),
        t("settings.alerts.saveErrorMsg"),
      );
    }
  };

  const handleReset = () => {
    Alert.alert(
      t("settings.alerts.resetTitle"),
      t("settings.alerts.resetMsg"),
      [
        { text: t("settings.alerts.cancel"), style: "cancel" },
        {
          text: t("settings.alerts.resetBtn"),
          style: "destructive",
          onPress: async () => {
            await resetToDefault();
            setUrl(defaultUrl);
            setCode("");
            setPassword("");
            setWhId("");
            setSelectedSound("error_1");
            setExistingBoxMode(false);
            Alert.alert(
              t("settings.alerts.resetSuccessTitle"),
              t("settings.alerts.resetSuccessMsg"),
            );
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("settings.headerTitle"),
          headerStyle: {
            backgroundColor: colors.background.darker,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontWeight: "600" as const,
          },
        }}
      />
      <LinearGradient
        colors={[colors.background.darker, colors.background.dark]}
        style={styles.container}
      >
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
                  <Settings size={40} color="#fff" strokeWidth={2} />
                </View>
                <Text style={styles.title}>{t("settings.pageTitle")}</Text>
                <Text style={styles.subtitle}>
                  {t("settings.pageSubtitle")}
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t("settings.language") || "Dil / Language"}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <Pressable
                      style={[
                        styles.button,
                        {
                          flex: 1,
                          backgroundColor:
                            i18n.language === "tr"
                              ? colors.button.primary
                              : colors.background.darker,
                          borderWidth: 1,
                          borderColor: colors.border.default,
                        },
                      ]}
                      onPress={() => i18n.changeLanguage("tr")}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          {
                            color:
                              i18n.language === "tr"
                                ? "#fff"
                                : colors.text.secondary,
                          },
                        ]}
                      >
                        🇹🇷 Türkçe
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.button,
                        {
                          flex: 1,
                          backgroundColor:
                            i18n.language === "en"
                              ? colors.button.primary
                              : colors.background.darker,
                          borderWidth: 1,
                          borderColor: colors.border.default,
                        },
                      ]}
                      onPress={() => i18n.changeLanguage("en")}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          {
                            color:
                              i18n.language === "en"
                                ? "#fff"
                                : colors.text.secondary,
                          },
                        ]}
                      >
                        🇬🇧 English
                      </Text>
                    </Pressable>
                  </View>
                  <Text style={styles.label}>
                    {t("settings.labels.apiUrl")}
                  </Text>
                  <TextInput
                    style={[styles.input, error ? styles.inputError : null]}
                    placeholder={t("settings.placeholders.apiUrl")}
                    placeholderTextColor={colors.input.placeholder}
                    value={url}
                    onChangeText={(text) => {
                      setUrl(text);
                      if (error) validateUrl(text);
                    }}
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
                    style={styles.input}
                    placeholder={t("settings.placeholders.companyCode")}
                    placeholderTextColor={colors.input.placeholder}
                    value={code}
                    onChangeText={setCode}
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
                    style={styles.input}
                    placeholder={t("settings.placeholders.companyPassword")}
                    placeholderTextColor={colors.input.placeholder}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                    editable={!isSaving}
                    testID="company-password-input"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t("settings.labels.warehouseId")}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t("settings.placeholders.warehouseId")}
                    placeholderTextColor={colors.input.placeholder}
                    value={whId}
                    onChangeText={setWhId}
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
                    {SOUND_OPTIONS.map((option) => (
                      <Pressable
                        key={option.id}
                        style={[
                          styles.soundOption,
                          selectedSound === option.id &&
                            styles.soundOptionSelected,
                        ]}
                        onPress={() => {
                          setSelectedSound(option.id);
                          playErrorSound(option.file);
                        }}
                      >
                        <Text
                          style={[
                            styles.soundOptionText,
                            selectedSound === option.id &&
                              styles.soundOptionTextSelected,
                          ]}
                        >
                          {t(`settings.sounds.${option.id}`, {
                            defaultValue: option.name,
                          })}
                        </Text>
                      </Pressable>
                    ))}
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
                      <CheckSquare size={24} color={colors.button.primary} />
                    ) : (
                      <Square size={24} color={colors.text.secondary} />
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

                <View style={styles.buttonGroup}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.button,
                      styles.primaryButton,
                      pressed && styles.buttonPressed,
                      isSaving && styles.buttonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={isSaving}
                    testID="save-button"
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Save size={20} color="#fff" />
                        <Text style={styles.buttonText}>
                          {t("settings.buttons.save")}
                        </Text>
                      </>
                    )}
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.button,
                      styles.secondaryButton,
                      pressed && styles.buttonPressed,
                      isSaving && styles.buttonDisabled,
                    ]}
                    onPress={handleReset}
                    disabled={isSaving}
                    testID="reset-button"
                  >
                    <RefreshCw size={20} color="#fff" />
                    <Text style={styles.buttonText}>
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

        {/* Yeni Eklenen Toast Animasyonu */}
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
            <CheckCircle size={22} color="#4CAF50" />
            <Text style={styles.toastText}>
              {t("settings.alerts.toastSuccess")}
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.darker,
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
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.button.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.input.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: colors.input.text,
    borderWidth: 1,
    borderColor: "transparent",
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: colors.border.error,
  },
  errorText: {
    color: colors.error.text,
    fontSize: 14,
  },
  buttonGroup: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButton: {
    backgroundColor: colors.button.primary,
  },
  secondaryButton: {
    backgroundColor: colors.button.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  helpBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "rgba(220, 20, 60, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(220, 20, 60, 0.3)",
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.button.primary,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  // Yeni eklenen stiller
  toastContainer: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 99,
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.4)",
    elevation: 5,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  toastText: {
    color: colors.text.primary,
    fontWeight: "600",
  },
  soundSelectorContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
  },
  soundOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: colors.input.background,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: "center",
    justifyContent: "center",
  },
  soundOptionSelected: {
    backgroundColor: colors.button.primary,
    borderColor: colors.button.primary,
  },
  soundOptionText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  soundOptionTextSelected: {
    color: "#fff",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(33, 150, 243, 0.05)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(33, 150, 243, 0.2)",
    gap: 12,
    marginTop: 4,
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  checkboxSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
});
