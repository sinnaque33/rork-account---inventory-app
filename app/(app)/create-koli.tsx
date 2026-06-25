import { ShoppingCart } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { Theme } from '@/constants/theme';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';

export default function CreateKoliScreen() {
  const { push } = useSafeNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <>
      <Stack.Screen
        options={{
          title: t('createKoli.headerTitle'),
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>{t('createKoli.title')}</Text>
            <Text style={styles.subtitle}>{t('createKoli.subtitle')}</Text>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => {
                  console.log('CreateKoli: Navigating to order-receipts');
                  push('/(app)/order-receipts');
                }}
                activeOpacity={0.7}
                testID="receipt-barcode-button"
              >
                <View style={styles.iconCircle}>
                  <ShoppingCart size={32} color={theme.colors.onPrimary} />
                </View>
                <Text style={styles.optionTitle}>{t('createKoli.orderOptionTitle')}</Text>
                <Text style={styles.optionDescription}>
                  {t('createKoli.orderOptionDesc')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
    },
    title: {
      ...type.displayLg,
      color: colors.ink,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...type.body,
      color: colors.inkMuted,
      marginBottom: spacing.xxl,
    },
    buttonsContainer: {
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    optionButton: {
      backgroundColor: colors.surface1,
      borderRadius: radius.lg,
      padding: spacing.xl,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.hairline,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    optionTitle: {
      ...type.cardTitle,
      color: colors.ink,
      marginBottom: spacing.xs,
    },
    optionDescription: {
      ...type.bodySm,
      color: colors.inkMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
};