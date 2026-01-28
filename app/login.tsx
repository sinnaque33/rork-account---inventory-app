import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { LogIn, Settings } from 'lucide-react-native';
import { useState } from 'react';
import { Image } from 'expo-image';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import colors from '@/constants/colors';

export default function LoginScreen() {
  const { login, loginError, loginMsg, isLoggingIn } = useAuth();
  const router = useRouter();
  const [userCode, setUserCode] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [userCodeError, setUserCodeError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  const validateUserCode = (text: string): boolean => {
    if (!text) {
      setUserCodeError('User code is required');
      return false;
    }
    setUserCodeError('');
    return true;
  };

  const validatePassword = (text: string): boolean => {
    if (!text) {
      setPasswordError('Password is required');
      return false;
    }
    if (text.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    console.log('LoginScreen: Login button pressed');
    const isUserCodeValid = validateUserCode(userCode);
    const isPasswordValid = validatePassword(password);

    if (!isUserCodeValid || !isPasswordValid) {
      console.log('LoginScreen: Validation failed');
      return;
    }

    await login({ userCode, password });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[colors.background.darker, colors.background.dark]}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <Pressable
              style={styles.settingsButton}
              onPress={() => router.push('/settings' as any)}
              testID="settings-button"
            >
              <Settings size={24} color="#fff" />
            </Pressable>

            <View style={styles.header}>
              <Image
                source={{ uri: 'https://cdn.rork.app/user-content/46e4cfe3-6f33-48fb-ac89-c7b0e1a6ce6e.png' }}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>
              {loginMsg ? (
                <Text style={styles.loginMsgText}>{loginMsg}</Text>
              ) : null}
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>User Code</Text>
                <TextInput
                  style={[styles.input, userCodeError ? styles.inputError : null]}
                  placeholder="Kullanıcı"
                  placeholderTextColor={colors.input.placeholder}
                  value={userCode}
                  onChangeText={(text) => {
                    setUserCode(text);
                    if (userCodeError) validateUserCode(text);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoggingIn}
                  testID="usercode-input"
                />
                {userCodeError ? (
                  <Text style={styles.errorText}>{userCodeError}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    passwordError ? styles.inputError : null,
                  ]}
                  placeholder="Şifre"
                  placeholderTextColor={colors.input.placeholder}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) validatePassword(text);
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoggingIn}
                  testID="password-input"
                />
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
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Sign In</Text>
                    <LogIn size={20} color="#fff" />
                  </>
                )}
              </Pressable>
            </View>

            <Text style={styles.footer}>
              Secure business authentication
            </Text>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  settingsButton: {
    position: 'absolute',
    top: 48,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.button.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  loginMsgText: {
    color: colors.error.text,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.input.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.input.text,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: colors.border.error,
  },
  errorContainer: {
    backgroundColor: colors.error.background,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.error.border,
  },
  errorText: {
    color: colors.error.text,
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.button.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
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
    fontWeight: '600' as const,
  },
  footer: {
    textAlign: 'center',
    color: colors.text.muted,
    fontSize: 12,
    marginTop: 32,
  },
});
