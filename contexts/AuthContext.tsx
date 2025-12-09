import createContextHook from '@nkzw/create-context-hook';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter, useSegments } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { api, LoginCredentials, LoginResponse } from '@/services/api';

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
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginMsg, setLoginMsg] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<LoginCredentials | null>(null);
  const router = useRouter();
  const segments = useSegments();

  const authCheckQuery = useQuery({
    queryKey: ['auth-check'],
    queryFn: async () => {
      console.log('AuthContext: Checking authentication status');
      const isAuth = await api.auth.checkAuth();
      return isAuth;
    },
    retry: false,
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
      setTimeout(() => {
        router.replace('/(app)/dashboard' as any);
      }, 100);
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
    },
    onSuccess: () => {
      console.log('AuthContext: Logout successful');
      setUser(null);
      router.replace('/login' as any);
    },
  });
  const { mutateAsync: logoutMutateAsync } = logoutMutation;

  useEffect(() => {
    if (authCheckQuery.isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === '(app)';
    const isAuthenticated = authCheckQuery.data === true && user !== null;

    console.log('AuthContext: Route protection check', {
      isAuthenticated,
      inAuthGroup,
      segments,
    });

    if (!isAuthenticated && inAuthGroup) {
      console.log('AuthContext: Redirecting to login - not authenticated');
      router.replace('/login' as any);
    } else if (isAuthenticated && !inAuthGroup && segments[0] !== 'login') {
      console.log('AuthContext: Redirecting to dashboard - already authenticated');
      router.replace('/(app)/dashboard' as any);
    }
  }, [authCheckQuery.isLoading, authCheckQuery.data, user, segments, router]);

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
    isLoading: authCheckQuery.isLoading,
    login,
    logout,
    loginError,
    loginMsg,
    isLoggingIn,
    credentials,
  };
});
