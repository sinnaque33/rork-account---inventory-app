import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';

export default function AppLayout() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.canvas,
        },
        headerTintColor: theme.colors.ink,
        headerTitleStyle: {
          fontWeight: '600' as const,
        },
        contentStyle: {
          backgroundColor: theme.colors.canvas,
        },
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{
          title: t('navigation.dashboard'),
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="koli-listesi"
        options={{
          title: t('navigation.koliListesi'),
        }}
      />
      <Stack.Screen
        name="create-koli"
        options={{
          title: t('navigation.createKoli'),
        }}
      />
      <Stack.Screen
        name="barcode-scanner"
        options={{
          title: t('navigation.barcodeScanner'),
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
    </Stack>
  );
}
