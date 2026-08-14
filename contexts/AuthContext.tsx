import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import { LoginCredentials, LoginResponse } from "@/services/types";
import { getWithMigration, secureStorage } from "@/utils/secureStorage";

const USER_STORAGE_KEY = "auth_user";
// "Beni hatırla" tercihi ve son kullanılan kullanıcı kodu hassas veri değil;
// düz AsyncStorage yeterli. Şifre buraya ASLA yazılmaz.
const REMEMBER_ME_KEY = "remember_me";
const LAST_USER_CODE_KEY = "last_user_code";

interface User {
  uid: number;
  code: string;
  email: string | null;
  firstName: string;
  lastName: string;
  companyName: string;
  admin: boolean;
  userName: string;
  password: string;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginMsg, setLoginMsg] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<LoginCredentials | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );
  // Varsayılan açık: mevcut kullanıcıların otomatik giriş davranışı bozulmasın.
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [lastUserCode, setLastUserCode] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const [remembered, storedUserCode] = await Promise.all([
          AsyncStorage.getItem(REMEMBER_ME_KEY),
          AsyncStorage.getItem(LAST_USER_CODE_KEY),
        ]);
        // Hiç kaydedilmemişse (null) varsayılan true kalır.
        if (remembered !== null) setRememberMe(remembered === "true");
        if (storedUserCode) setLastUserCode(storedUserCode);
      } catch (error) {
        console.error("AuthContext: Failed to load remember-me prefs:", error);
      }
    })();
  }, []);

  const authCheckQuery = useQuery({
    queryKey: ["auth-check"],
    queryFn: async () => {
      console.log(
        "AuthContext: Checking authentication status and restoring user",
      );
      try {
        const isAuth = await api.auth.checkAuth();
        console.log("AuthContext: Auth check result:", isAuth);

        if (isAuth) {
          // Kullanıcı kaydı şifre içerdiği için SecureStore'da tutulur;
          // eski sürümlerin AsyncStorage kaydı ilk okumada oraya taşınır.
          const storedUser = await getWithMigration(USER_STORAGE_KEY);
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser) as User;
            console.log(
              "AuthContext: Restored user from storage:",
              parsedUser.userName,
            );
            setUser(parsedUser);
            // Oturum geri yüklenirken credentials'ı da set et; aksi halde
            // ekranların `enabled: !!credentials` ile koşullu sorguları hiç
            // çalışmaz ve listeler boş gelir (otomatik giriş senaryosu).
            setCredentials({
              userCode: parsedUser.userName,
              password: parsedUser.password,
            });
          } else {
            console.log(
              "AuthContext: Token exists but no user data, clearing token",
            );
            await api.auth.logout();
          }
        }

        setIsInitialized(true);
        return isAuth;
      } catch (error) {
        console.error("AuthContext: Auth check failed:", error);
        setIsInitialized(true);
        return false;
      }
    },
    retry: false,
    staleTime: 0,
  });

  const loginMutation = useMutation({
    mutationFn: async ({
      credentials,
      remember,
    }: {
      credentials: LoginCredentials;
      remember: boolean;
    }) => {
      console.log("AuthContext: Login mutation started, remember:", remember);
      setLoginError(null);
      setLoginMsg(null);
      setCredentials(credentials);
      return api.auth.login(credentials, remember);
    },
    onSuccess: (data: LoginResponse, { credentials: variables, remember }) => {
      if (data.success !== "true" || data.err !== 0) {
        console.log(
          "AuthContext: Login failed with success:",
          data.success,
          "err:",
          data.err,
          "msg:",
          data.msg,
        );
        setLoginMsg(data.msg);
        return;
      }
      console.log("AuthContext: Setting user and navigating to dashboard");
      const newUser = {
        uid: data.uid,
        code: data.code,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName,
        admin: data.admin,
        userName: variables.userCode,
        password: variables.password,
      };
      setUser(newUser);

      // Tercihi ve kullanıcı kodunu her hâlükârda sakla; kod hassas değil ve
      // "beni hatırla" kapalıyken bile login ekranını ön-doldurmakta kullanılır.
      setRememberMe(remember);
      setLastUserCode(variables.userCode);
      AsyncStorage.multiSet([
        [REMEMBER_ME_KEY, String(remember)],
        [LAST_USER_CODE_KEY, variables.userCode],
      ]).catch((err) => {
        console.error("AuthContext: Failed to persist login prefs:", err);
      });

      if (remember) {
        secureStorage
          .setItem(USER_STORAGE_KEY, JSON.stringify(newUser))
          .catch((err) => {
            console.error("AuthContext: Failed to persist user:", err);
          });
      } else {
        // Şifre diske hiç yazılmasın; önceki hatırlanan oturum da silinmeli.
        secureStorage.removeItem(USER_STORAGE_KEY).catch((err) => {
          console.error("AuthContext: Failed to clear stored user:", err);
        });
      }

      setPendingNavigation("/(app)/dashboard");
    },
    onError: (error: Error) => {
      console.error("AuthContext: Login failed", error.message);
      setLoginError(error.message);
    },
  });
  const { mutateAsync: loginMutateAsync, isPending: isLoggingIn } =
    loginMutation;

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("AuthContext: Logout mutation started");
      await api.auth.logout();
      await secureStorage.removeItem(USER_STORAGE_KEY);
    },
    onSuccess: () => {
      console.log("AuthContext: Logout successful");
      setUser(null);
      setPendingNavigation("/login");
    },
  });
  const { mutateAsync: logoutMutateAsync } = logoutMutation;

  const clearPendingNavigation = useCallback(() => {
    setPendingNavigation(null);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials, remember: boolean = true) => {
      await loginMutateAsync({ credentials, remember });
    },
    [loginMutateAsync],
  );

  const logout = useCallback(async () => {
    await logoutMutateAsync();
  }, [logoutMutateAsync]);

  const isLoading = authCheckQuery.isLoading || !isInitialized;

  // Diğer context'lerle aynı desen: referans sabitliği için memoize edilir,
  // aksi halde provider'ın her render'ı tüm useAuth tüketicilerini yeniden
  // render eder.
  return useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      loginError,
      loginMsg,
      isLoggingIn,
      credentials,
      rememberMe,
      lastUserCode,
      pendingNavigation,
      clearPendingNavigation,
    }),
    [
      user,
      isLoading,
      login,
      logout,
      loginError,
      loginMsg,
      isLoggingIn,
      credentials,
      rememberMe,
      lastUserCode,
      pendingNavigation,
      clearPendingNavigation,
    ],
  );
});
