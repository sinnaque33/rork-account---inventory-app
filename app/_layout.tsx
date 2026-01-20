import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ApiConfigProvider } from "@/contexts/ApiConfigContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function NavigationHandler() {
  const { pendingNavigation, clearPendingNavigation, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (pendingNavigation) {
      console.log('NavigationHandler: Executing pending navigation to', pendingNavigation);
      router.replace(pendingNavigation as any);
      clearPendingNavigation();
    }
  }, [pendingNavigation, router, clearPendingNavigation]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === '(app)';

    if (!isAuthenticated && inAuthGroup) {
      console.log('NavigationHandler: Redirecting to login - not authenticated');
      router.replace('/login' as any);
    }
  }, [isLoading, isAuthenticated, segments, router]);

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <NavigationHandler />
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ApiConfigProvider>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </ApiConfigProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
