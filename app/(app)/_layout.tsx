import { Stack } from 'expo-router';
import colors from '@/constants/colors';

export default function AppLayout() {
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
          title: 'Dashboard',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="accounts"
        options={{
          title: 'Current Accounts',
        }}
      />
      <Stack.Screen
        name="inventory"
        options={{
          title: 'Inventory',
        }}
      />
      <Stack.Screen
        name="koli-listesi"
        options={{
          title: 'Koli Listesi',
        }}
      />
      <Stack.Screen
        name="create-koli"
        options={{
          title: 'Create Koli',
        }}
      />
      <Stack.Screen
        name="barcode-scanner"
        options={{
          title: 'Barcode Scanner',
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
    </Stack>
  );
}
