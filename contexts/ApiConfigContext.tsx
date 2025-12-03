import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { clearApiUrlCache } from '@/services/api';

const STORAGE_KEY = 'api_base_url';
const COMPANY_CODE_KEY = 'company_code';
const COMPANY_PASSWORD_KEY = 'company_password';

export const [ApiConfigProvider, useApiConfig] = createContextHook(() => {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
  const [companyCode, setCompanyCode] = useState<string>('');
  const [companyPassword, setCompanyPassword] = useState<string>('');

  const loadUrlQuery = useQuery({
    queryKey: ['api-config'],
    queryFn: async () => {
      console.log('ApiConfigContext: Loading API config from storage');
      const [url, code, pwd] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(COMPANY_CODE_KEY),
        AsyncStorage.getItem(COMPANY_PASSWORD_KEY),
      ]);
      return {
        url: url || '',
        companyCode: code || '',
        companyPassword: pwd || '',
      };
    },
    retry: false,
  });

  useEffect(() => {
    if (loadUrlQuery.data) {
      console.log('ApiConfigContext: Setting API config', loadUrlQuery.data);
      setApiBaseUrl(loadUrlQuery.data.url);
      setCompanyCode(loadUrlQuery.data.companyCode);
      setCompanyPassword(loadUrlQuery.data.companyPassword);
    }
  }, [loadUrlQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (params: { url?: string; companyCode?: string; companyPassword?: string }) => {
      console.log('ApiConfigContext: Saving API config to storage', params);
      const promises: Promise<void>[] = [];
      
      if (params.url !== undefined) {
        promises.push(AsyncStorage.setItem(STORAGE_KEY, params.url));
      }
      if (params.companyCode !== undefined) {
        promises.push(AsyncStorage.setItem(COMPANY_CODE_KEY, params.companyCode));
      }
      if (params.companyPassword !== undefined) {
        promises.push(AsyncStorage.setItem(COMPANY_PASSWORD_KEY, params.companyPassword));
      }
      
      await Promise.all(promises);
      clearApiUrlCache();
      return params;
    },
    onSuccess: (params) => {
      console.log('ApiConfigContext: API config saved successfully');
      if (params.url !== undefined) setApiBaseUrl(params.url);
      if (params.companyCode !== undefined) setCompanyCode(params.companyCode);
      if (params.companyPassword !== undefined) setCompanyPassword(params.companyPassword);
    },
  });
  const { mutateAsync: saveMutateAsync } = saveMutation;

  const updateApiUrl = useCallback(async (url: string) => {
    await saveMutateAsync({ url });
  }, [saveMutateAsync]);

  const updateCompanyCode = useCallback(async (code: string) => {
    await saveMutateAsync({ companyCode: code });
  }, [saveMutateAsync]);

  const updateCompanyPassword = useCallback(async (password: string) => {
    await saveMutateAsync({ companyPassword: password });
  }, [saveMutateAsync]);

  const resetToDefault = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEY),
      AsyncStorage.removeItem(COMPANY_CODE_KEY),
      AsyncStorage.removeItem(COMPANY_PASSWORD_KEY),
    ]);
    clearApiUrlCache();
    setApiBaseUrl('');
    setCompanyCode('');
    setCompanyPassword('');
  }, []);

  return useMemo(() => ({
    apiBaseUrl,
    companyCode,
    companyPassword,
    updateApiUrl,
    updateCompanyCode,
    updateCompanyPassword,
    resetToDefault,
    isLoading: loadUrlQuery.isLoading,
    isSaving: saveMutation.isPending,
    defaultUrl: 'https://webstreme.uniteks.com.tr:8001/ExtWsLiveV2/Services',
  }), [
    apiBaseUrl,
    companyCode,
    companyPassword,
    updateApiUrl,
    updateCompanyCode,
    updateCompanyPassword,
    resetToDefault,
    loadUrlQuery.isLoading,
    saveMutation.isPending,
  ]);
});
