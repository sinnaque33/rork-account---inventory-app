import { useTranslation } from "react-i18next";
import { Stack } from "expo-router";
import {
  AlertCircle,
  LogIn,
  Settings,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { Theme } from "@/constants/theme";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";

const logoOnDark = require("../assets/extreme-logo-on-dark.png");
const logoOnLight = require("../assets/Extreme-Logo-Ana.png");

export default function LoginScreen() {
  const { t } = useTranslation();
  const {
    login,
    loginError,
    loginMsg,
    isLoggingIn,
    rememberMe,
    lastUserCode,
  } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { push } = useSafeNavigation();
  const [userCode, setUserCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [userCodeError, setUserCodeError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [focusedField, setFocusedField] = useState<"user" | "password" | null>(
    null,
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [remember, setRemember] = useState<boolean>(rememberMe);
  const passwordRef = useRef<TextInput>(null);

  // Tercihler AuthContext'te asenkron yüklendiği için ilk render'da henüz
  // hazır olmayabilir; geldiklerinde kutuyu ve kullanıcı kodunu eşitle.
  useEffect(() => {
    setRemember(rememberMe);
  }, [rememberMe]);

  useEffect(() => {
    if (lastUserCode) setUserCode(lastUserCode);
  }, [lastUserCode]);

  const validateUserCode = (text: string): boolean => {
    if (!text) {
      setUserCodeError(t("login.alerts.userRequired"));
      return false;
    }
    setUserCodeError("");
    return true;
  };

  const validatePassword = (text: string): boolean => {
    if (!text) {
      setPasswordError(t("login.alerts.passwordRequired"));
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleLogin = async () => {
    const trimmedUserCode = userCode.trim();
    const isUserCodeValid = validateUserCode(trimmedUserCode);
    const isPasswordValid = validatePassword(password);

    if (!isUserCodeValid || !isPasswordValid) {
      return;
    }

    await login({ userCode: trimmedUserCode, password }, remember);
  };

  // Sunucunun reddettiği giriş (loginMsg) ile istek hatası (loginError) aynı
  // yerde, Giriş düğmesinin hemen üstünde gösterilir.
  const formError = loginError || loginMsg;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.settingsButtonPressed,
            ]}
            onPress={() => push("/settings" as any)}
            accessibilityRole="button"
            accessibilityLabel={t("settings.headerTitle")}
            testID="settings-button"
          >
            <Settings size={24} color={theme.colors.ink} />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + theme.spacing.xl },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <Image
                  source={theme.isDark ? logoOnDark : logoOnLight}
                  style={styles.logo}
                  contentFit="contain"
                  contentPosition="left"
                />
                <Text style={styles.title} accessibilityRole="header">
                  {t("login.welcome")}
                </Text>
                <Text style={styles.subtitle}>{t("login.subtitle")}</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t("login.labels.user")}</Text>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === "user" && styles.inputFocused,
                      userCodeError ? styles.inputError : null,
                    ]}
                    placeholder={t("login.placeholders.user")}
                    placeholderTextColor={theme.colors.inkSubtle}
                    value={userCode}
                    onChangeText={(text) => {
                      setUserCode(text);
                      if (userCodeError) validateUserCode(text);
                    }}
                    onFocus={() => setFocusedField("user")}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoggingIn}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    accessibilityLabel={t("login.labels.user")}
                    testID="usercode-input"
                  />
                  {userCodeError ? (
                    <Text style={styles.errorText}>{userCodeError}</Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t("login.labels.password")}</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      ref={passwordRef}
                      style={[
                        styles.input,
                        styles.passwordInput,
                        focusedField === "password" && styles.inputFocused,
                        passwordError ? styles.inputError : null,
                      ]}
                      placeholder={t("login.placeholders.password")}
                      placeholderTextColor={theme.colors.inkSubtle}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (passwordError) validatePassword(text);
                      }}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoggingIn}
                      returnKeyType="go"
                      onSubmitEditing={handleLogin}
                      accessibilityLabel={t("login.labels.password")}
                      testID="password-input"
                    />
                    <Pressable
                      style={styles.eyeButton}
                      onPress={() => setShowPassword((prev) => !prev)}
                      disabled={isLoggingIn}
                      accessibilityRole="button"
                      accessibilityLabel={
                        showPassword
                          ? t("login.hidePassword")
                          : t("login.showPassword")
                      }
                      testID="toggle-password-visibility"
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={theme.colors.inkMuted} />
                      ) : (
                        <Eye size={20} color={theme.colors.inkMuted} />
                      )}
                    </Pressable>
                  </View>
                  {passwordError ? (
                    <Text style={styles.errorText}>{passwordError}</Text>
                  ) : null}
                </View>

                <Pressable
                  style={styles.rememberRow}
                  onPress={() => setRemember((prev) => !prev)}
                  disabled={isLoggingIn}
                  hitSlop={8}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: remember, disabled: isLoggingIn }}
                  testID="remember-me-toggle"
                >
                  {remember ? (
                    <CheckSquare size={24} color={theme.colors.primary} />
                  ) : (
                    <Square size={24} color={theme.colors.inkSubtle} />
                  )}
                  <View style={styles.rememberTextContainer}>
                    <Text style={styles.rememberLabel}>
                      {t("login.labels.rememberMe")}
                    </Text>
                    <Text style={styles.rememberHint}>
                      {t("login.rememberMeHint")}
                    </Text>
                  </View>
                </Pressable>

                {formError ? (
                  <View
                    style={styles.errorContainer}
                    accessibilityRole="alert"
                    accessibilityLiveRegion="polite"
                  >
                    <AlertCircle size={20} color={theme.colors.error} />
                    <Text style={styles.errorContainerText}>{formError}</Text>
                  </View>
                ) : null}

                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                    isLoggingIn && styles.buttonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={isLoggingIn}
                  testID="login-button"
                >
                  {isLoggingIn ? (
                    <ActivityIndicator color={theme.colors.onPrimary} />
                  ) : (
                    <>
                      <LogIn size={20} color={theme.colors.onPrimary} />
                      <Text style={styles.buttonText}>
                        {t("login.buttons.login")}
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const makeStyles = (theme: Theme) => {
  const { colors, spacing, radius, type } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.loginPage,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    settingsButton: {
      width: 48,
      height: 48,
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
    },
    settingsButtonPressed: {
      backgroundColor: colors.surface2,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.xxl,
      paddingTop: spacing.xl,
    },
    content: {
      width: "100%",
      maxWidth: 440,
      alignSelf: "center",
    },
    header: {
      marginBottom: spacing.xxl,
    },
    logo: {
      width: 208,
      height: 64,
      marginBottom: spacing.xxl,
    },
    title: {
      ...type.heroTitle,
      color: colors.ink,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...type.body,
      color: colors.inkMuted,
    },
    form: {
      gap: spacing.xl,
    },
    inputGroup: {
      gap: spacing.xs,
    },
    label: {
      ...type.labelMd,
      color: colors.ink,
    },
    input: {
      ...type.body,
      backgroundColor: colors.loginField,
      borderRadius: radius.control,
      paddingHorizontal: spacing.md,
      minHeight: 56,
      color: colors.ink,
      borderWidth: 1,
      borderColor: colors.controlLine,
    },
    passwordWrapper: {
      position: "relative",
      justifyContent: "center",
    },
    passwordInput: {
      paddingRight: 52,
    },
    eyeButton: {
      position: "absolute",
      right: spacing.xxs,
      top: 0,
      bottom: 0,
      width: 48,
      alignItems: "center",
      justifyContent: "center",
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
    rememberRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },
    rememberTextContainer: {
      flex: 1,
      gap: spacing.xxs,
    },
    rememberLabel: {
      ...type.labelStrong,
      color: colors.ink,
    },
    rememberHint: {
      ...type.hint,
      color: colors.inkMuted,
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.errorTint,
      borderRadius: radius.control,
      borderWidth: 1,
      borderColor: colors.error,
    },
    errorContainerText: {
      ...type.hint,
      flex: 1,
      color: colors.ink,
    },
    errorText: {
      ...type.hint,
      color: colors.error,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: radius.control,
      paddingHorizontal: spacing.sm,
      minHeight: 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
    },
    buttonPressed: {
      backgroundColor: colors.primaryPress,
    },
    // Yüklenirken düğme kırmızı kalır; beyaz gösterge iki temada da görünür.
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      ...type.labelStrong,
      color: colors.onPrimary,
    },
  });
};
