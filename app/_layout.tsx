import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Audio, InterruptionModeAndroid } from "expo-av";
import "../locales/i18n";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ApiConfigProvider } from "@/contexts/ApiConfigContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Hata sesinin iOS sessiz modda da çalabilmesi için audio mode uygulama
// açılışında bir kez ayarlanır (yalnızca ayarlar ekranına girildiğinde değil).
Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
  interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
  shouldDuckAndroid: true,
}).catch((e) => {
  console.log("RootLayout: Audio mode ayarlanamadı:", e);
});

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

  // Splash ekranını yalnızca oturum kontrolü bittiğinde gizle. Böylece
  // hazır olmadan login ekranının bir an görünmesi (flaş) engellenir.
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

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
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <ApiConfigProvider>
            <AuthProvider>
              <RootLayoutNav />
            </AuthProvider>
          </ApiConfigProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
