import createContextHook from '@nkzw/create-context-hook';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, LoginCredentials, LoginResponse } from '@/services/api';

const USER_STORAGE_KEY = 'auth_user';

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
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const authCheckQuery = useQuery({
    queryKey: ['auth-check'],
    queryFn: async () => {
      console.log('AuthContext: Checking authentication status and restoring user');
      try {
        const isAuth = await api.auth.checkAuth();
        console.log('AuthContext: Auth check result:', isAuth);
        
        if (isAuth) {
          const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser) as User;
            console.log('AuthContext: Restored user from storage:', parsedUser.userName);
            setUser(parsedUser);
          } else {
            console.log('AuthContext: Token exists but no user data, clearing token');
            await api.auth.logout();
          }
        }
        
        setIsInitialized(true);
        return isAuth;
      } catch (error) {
        console.error('AuthContext: Auth check failed:', error);
        setIsInitialized(true);
        return false;
      }
    },
    retry: false,
    staleTime: 0,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      console.log('AuthContext: Login mutation started');
      setLoginError(null);
      setLoginMsg(null);
      setCredentials(credentials);
      return api.auth.login(credentials);
    },
    onSuccess: (data: LoginResponse, variables: LoginCredentials) => {
      console.log('AuthContext: Login successful, checking success and err status');
      if (data.success !== "true" || data.err !== 0) {
        console.log('AuthContext: Login failed with success:', data.success, 'err:', data.err, 'msg:', data.msg);
        setLoginMsg(data.msg);
        return;
      }
      console.log('AuthContext: Setting user and navigating to dashboard');
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
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser)).catch(err => {
        console.error('AuthContext: Failed to persist user:', err);
      });
      setPendingNavigation('/(app)/dashboard');
    },
    onError: (error: Error) => {
      console.error('AuthContext: Login failed', error.message);
      setLoginError(error.message);
    },
  });
  const { mutateAsync: loginMutateAsync, isPending: isLoggingIn } = loginMutation;

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('AuthContext: Logout mutation started');
      await api.auth.logout();
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    },
    onSuccess: () => {
      console.log('AuthContext: Logout successful');
      setUser(null);
      setPendingNavigation('/login');
    },
  });
  const { mutateAsync: logoutMutateAsync } = logoutMutation;

  const clearPendingNavigation = useCallback(() => {
    setPendingNavigation(null);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      await loginMutateAsync(credentials);
    },
    [loginMutateAsync]
  );

  const logout = useCallback(async () => {
    await logoutMutateAsync();
  }, [logoutMutateAsync]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading: authCheckQuery.isLoading || !isInitialized,
    login,
    logout,
    loginError,
    loginMsg,
    isLoggingIn,
    credentials,
    pendingNavigation,
    clearPendingNavigation,
  };
});
