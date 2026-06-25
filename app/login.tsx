import { useTranslation } from "react-i18next";
import { Stack } from "expo-router";
import { LogIn, Settings, Eye, EyeOff } from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import { Image } from "expo-image";

const logoOnDark = require("../assets/extreme-logo-on-dark.png");
const logoOnLight = require("../assets/Extreme-Logo-Ana.png");
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

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login, loginError, loginMsg, isLoggingIn } = useAuth();
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
  const passwordRef = useRef<TextInput>(null);

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
    console.log("LoginScreen: Login button pressed");
    const isUserCodeValid = validateUserCode(userCode);
    const isPasswordValid = validatePassword(password);

    if (!isUserCodeValid || !isPasswordValid) {
      console.log("LoginScreen: Validation failed");
      return;
    }

    await login({ userCode, password });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Pressable
          style={({ pressed }) => [
            styles.settingsButton,
            { top: insets.top + theme.spacing.sm },
            pressed && styles.settingsButtonPressed,
          ]}
          onPress={() => push("/settings" as any)}
          testID="settings-button"
          hitSlop={8}
        >
          <Settings size={22} color={theme.colors.inkMuted} />
        </Pressable>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
            <View style={styles.header}>
              <Image
                source={theme.isDark ? logoOnDark : logoOnLight}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.title}>{t("login.welcome")}</Text>
              <Text style={styles.subtitle}>{t("login.subtitle")}</Text>
              {loginMsg ? (
                <Text style={styles.loginMsgText}>{loginMsg}</Text>
              ) : null}
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
                    testID="password-input"
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowPassword((prev) => !prev)}
                    hitSlop={8}
                    disabled={isLoggingIn}
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

              {loginError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{loginError}</Text>
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
                    <Text style={styles.buttonText}>
                      {t("login.buttons.login")}
                    </Text>
                    <LogIn size={20} color={theme.colors.onPrimary} />
                  </>
                )}
              </Pressable>
            </View>

            <Text style={styles.footer}>{t("login.footer")}</Text>
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
      backgroundColor: colors.canvas,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xxl,
    },
    content: {
      width: "100%",
      maxWidth: 440,
      alignSelf: "center",
    },
    settingsButton: {
      position: "absolute",
      top: spacing.xxl,
      right: spacing.xl,
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.hairlineStrong,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    settingsButtonPressed: {
      backgroundColor: colors.surface3,
    },
    header: {
      alignItems: "center",
      marginBottom: spacing.xxl,
    },
    logo: {
      width: 240,
      height: 72,
      marginBottom: spacing.lg,
    },
    title: {
      ...type.headline,
      color: colors.ink,
      marginBottom: spacing.xxs,
      textAlign: "center",
    },
    subtitle: {
      ...type.bodySm,
      color: colors.inkMuted,
      marginBottom: spacing.xs,
      textAlign: "center",
    },
    loginMsgText: {
      ...type.bodySm,
      color: colors.error,
      marginTop: spacing.xs,
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
    passwordWrapper: {
      position: "relative",
      justifyContent: "center",
    },
    passwordInput: {
      paddingRight: 48,
    },
    eyeButton: {
      position: "absolute",
      right: spacing.xs,
      top: 0,
      bottom: 0,
      width: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    inputFocused: {
      borderWidth: 2,
      borderColor: colors.primaryRing,
    },
    inputError: {
      borderWidth: 2,
      borderColor: colors.error,
    },
    errorContainer: {
      backgroundColor: colors.errorTint,
      padding: spacing.sm,
      borderRadius: radius.md,
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
    },
    errorText: {
      ...type.bodySm,
      color: colors.error,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingVertical: 14,
      paddingHorizontal: spacing.lg,
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    buttonPressed: {
      backgroundColor: colors.primaryPress,
    },
    buttonDisabled: {
      backgroundColor: colors.surface2,
    },
    buttonText: {
      ...type.button,
      color: colors.onPrimary,
    },
    footer: {
      ...type.caption,
      textAlign: "center",
      color: colors.inkSubtle,
      marginTop: spacing.xxl,
    },
  });
};
