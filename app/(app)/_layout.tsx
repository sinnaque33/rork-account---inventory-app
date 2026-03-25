import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import colors from '@/constants/colors';

export default function AppLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background.darker,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600' as const,
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
        name="accounts"
        options={{
          title: t('navigation.accounts'),
        }}
      />
      <Stack.Screen
        name="inventory"
        options={{
          title: t('navigation.inventory'),
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