import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buildTheme, Theme, ThemeMode } from "@/constants/theme";

const THEME_STORAGE_KEY = "app_theme_mode";
const DEFAULT_MODE: ThemeMode = "dark";

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [mode, setMode] = useState<ThemeMode>(DEFAULT_MODE);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (active && (stored === "dark" || stored === "light")) {
          setMode(stored);
        }
      } catch (error) {
        console.log("ThemeContext: Failed to load theme mode", error);
      } finally {
        if (active) setIsLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const setThemeMode = useCallback(async (next: ThemeMode) => {
    setMode(next);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (error) {
      console.log("ThemeContext: Failed to persist theme mode", error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(mode === "dark" ? "light" : "dark");
  }, [mode, setThemeMode]);

  const theme: Theme = useMemo(() => buildTheme(mode), [mode]);

  return useMemo(
    () => ({
      theme,
      themeMode: mode,
      isDark: mode === "dark",
      isLoaded,
      setThemeMode,
      toggleTheme,
    }),
    [theme, mode, isLoaded, setThemeMode, toggleTheme],
  );
});
