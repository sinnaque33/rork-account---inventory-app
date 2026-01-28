import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { Settings, RefreshCw, Save } from 'lucide-react-native';
import { useState, useEffect } from 'react';
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
} from 'react-native';
import { useApiConfig } from '@/contexts/ApiConfigContext';
import colors from '@/constants/colors';

export default function SettingsScreen() {
  const { apiBaseUrl, companyCode, companyPassword, updateApiUrl, updateCompanyCode, updateCompanyPassword, resetToDefault, isLoading, isSaving, defaultUrl } = useApiConfig();
  const [url, setUrl] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    setUrl(apiBaseUrl);
    setCode(companyCode);
    setPassword(companyPassword);
  }, [apiBaseUrl, companyCode, companyPassword]);

  const validateUrl = (text: string): boolean => {
    if (!text) {
      setError('URL is required');
      return false;
    }
    if (!text.startsWith('http://') && !text.startsWith('https://')) {
      setError('URL must start with http:// or https://');
      return false;
    }
    setError('');
    return true;
  };

  const handleSave = async () => {
    if (!validateUrl(url)) {
      return;
    }

    try {
      await updateApiUrl(url.trim());
      await updateCompanyCode(code.trim());
      await updateCompanyPassword(password.trim());
      Alert.alert(
        'Success',
        'Settings saved successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset to Default',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetToDefault();
            setUrl(defaultUrl);
            setCode('');
            setPassword('');
            Alert.alert('Success', 'Settings reset to default');
          },
        },
      ]
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
          title: 'API Settings',
          headerStyle: {
            backgroundColor: colors.background.darker,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontWeight: '600' as const,
          },
        }} 
      />
      <LinearGradient
        colors={[colors.background.darker, colors.background.dark]}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                <Text style={styles.title}>API Ayarları</Text>
                <Text style={styles.subtitle}>
                  API Ayarlarını yapınız
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>API URL</Text>
                  <TextInput
                    style={[styles.input, error ? styles.inputError : null]}
                    placeholder="https://example.com/api"
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
                  {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Şirket Kodu</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Şirket Kodu (opsiyonel)"
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
                  <Text style={styles.label}>Şirket Şifresi</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Şirket Şifresi (opsiyonel)"
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
                        <Text style={styles.buttonText}>Kaydet</Text>
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
                    <Text style={styles.buttonText}>Sıfırla</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.helpBox}>
                <Text style={styles.helpTitle}>Yardım</Text>
                <Text style={styles.helpText}>
                  API URL bilgisi tüm servisler için kullanılır. Doğruluğundan emin olunuz.
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.button.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    gap: 20,
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
    fontSize: 14,
    color: colors.input.text,
    borderWidth: 1,
    borderColor: 'transparent',
    textAlignVertical: 'top',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '600' as const,
  },
  helpBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(220, 20, 60, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.button.primary,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
