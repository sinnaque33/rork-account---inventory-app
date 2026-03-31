import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useMemo } from "react";
import { clearApiUrlCache } from "@/services/api";

const STORAGE_KEY = "api_base_url";
const COMPANY_CODE_KEY = "company_code";
const COMPANY_PASSWORD_KEY = "company_password";
const WAREHOUSE_ID_KEY = "warehouse_id";
const ERROR_SOUND_KEY = "error_sound";
const USE_EXISTING_BOX_KEY = "use_existing_box";
const PRINTER_NAME_KEY = "preferred_printer_name";

export const [ApiConfigProvider, useApiConfig] = createContextHook(() => {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("");
  const [companyCode, setCompanyCode] = useState<string>("");
  const [companyPassword, setCompanyPassword] = useState<string>("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [errorSound, setErrorSound] = useState<string>("error_1");
  const [useExistingBox, setUseExistingBox] = useState<boolean>(false);
  const [printerName, setPrinterName] = useState<string>("VARSAYILAN YAZICI ADINI GİRİN");

  const loadUrlQuery = useQuery({
    queryKey: ["api-config"],
    queryFn: async () => {
      console.log("ApiConfigContext: Loading API config from storage");
      const [url, code, pwd, whId, eSound, existingBox, pName] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(COMPANY_CODE_KEY),
          AsyncStorage.getItem(COMPANY_PASSWORD_KEY),
          AsyncStorage.getItem(WAREHOUSE_ID_KEY),
          AsyncStorage.getItem(ERROR_SOUND_KEY),
          AsyncStorage.getItem(USE_EXISTING_BOX_KEY),
          AsyncStorage.getItem(PRINTER_NAME_KEY),
        ]);
      return {
        url: url || "",
        companyCode: code || "",
        companyPassword: pwd || "",
        warehouseId: whId || "",
        errorSound: eSound || "error_1",
        useExistingBox: existingBox === "true",
        printerName: pName || "EPSON",
      };
    },
    retry: false,
  });

  useEffect(() => {
    if (loadUrlQuery.data) {
      console.log("ApiConfigContext: Setting API config", loadUrlQuery.data);
      setApiBaseUrl(loadUrlQuery.data.url);
      setCompanyCode(loadUrlQuery.data.companyCode);
      setCompanyPassword(loadUrlQuery.data.companyPassword);
      setWarehouseId(loadUrlQuery.data.warehouseId);
      setErrorSound(loadUrlQuery.data.errorSound);
      setUseExistingBox(loadUrlQuery.data.useExistingBox);
      setPrinterName(loadUrlQuery.data.printerName);
    }
  }, [loadUrlQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (params: {
      url?: string;
      companyCode?: string;
      companyPassword?: string;
      warehouseId?: string;
      errorSound?: string;
      useExistingBox?: boolean;
      printerName?: string;
    }) => {
      console.log("ApiConfigContext: Saving API config to storage", params);
      const promises: Promise<void>[] = [];

      if (params.printerName !== undefined) {
        promises.push(
          AsyncStorage.setItem(PRINTER_NAME_KEY, params.printerName),
        );
      }

      if (params.url !== undefined) {
        promises.push(AsyncStorage.setItem(STORAGE_KEY, params.url));
      }
      if (params.companyCode !== undefined) {
        promises.push(
          AsyncStorage.setItem(COMPANY_CODE_KEY, params.companyCode),
        );
      }
      if (params.companyPassword !== undefined) {
        promises.push(
          AsyncStorage.setItem(COMPANY_PASSWORD_KEY, params.companyPassword),
        );
      }
      if (params.warehouseId !== undefined) {
        promises.push(
          AsyncStorage.setItem(WAREHOUSE_ID_KEY, params.warehouseId),
        );
      }
      if (params.errorSound !== undefined) {
        promises.push(AsyncStorage.setItem(ERROR_SOUND_KEY, params.errorSound));
      }
      if (params.useExistingBox !== undefined) {
        promises.push(
          AsyncStorage.setItem(
            USE_EXISTING_BOX_KEY,
            String(params.useExistingBox),
          ),
        );
      }
      await Promise.all(promises);
      clearApiUrlCache();
      return params;
    },
    onSuccess: (params) => {
      console.log("ApiConfigContext: API config saved successfully");
      if (params.url !== undefined) setApiBaseUrl(params.url);
      if (params.companyCode !== undefined) setCompanyCode(params.companyCode);
      if (params.companyPassword !== undefined)
        setCompanyPassword(params.companyPassword);
      if (params.warehouseId !== undefined) setWarehouseId(params.warehouseId);
      if (params.errorSound !== undefined) setErrorSound(params.errorSound);
      if (params.useExistingBox !== undefined)
        setUseExistingBox(params.useExistingBox);
      if (params.printerName !== undefined) setPrinterName(params.printerName);
    },
  });
  const { mutateAsync: saveMutateAsync } = saveMutation;

  const updateApiUrl = useCallback(
    async (url: string) => {
      await saveMutateAsync({ url });
    },
    [saveMutateAsync],
  );

  const updateCompanyCode = useCallback(
    async (code: string) => {
      await saveMutateAsync({ companyCode: code });
    },
    [saveMutateAsync],
  );

  const updateCompanyPassword = useCallback(
    async (password: string) => {
      await saveMutateAsync({ companyPassword: password });
    },
    [saveMutateAsync],
  );

  const updateWarehouseId = useCallback(
    async (whId: string) => {
      await saveMutateAsync({ warehouseId: whId });
    },
    [saveMutateAsync],
  );
  const updateErrorSound = useCallback(
    async (sound: string) => {
      await saveMutateAsync({ errorSound: sound });
    },
    [saveMutateAsync],
  );

  const updateUseExistingBox = useCallback(
    async (value: boolean) => {
      await saveMutateAsync({ useExistingBox: value });
    },
    [saveMutateAsync],
  );

  const updatePrinterName = useCallback(
    async (name: string) => {
      await saveMutateAsync({ printerName: name });
    },
    [saveMutateAsync],
  );

  const resetToDefault = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEY),
      AsyncStorage.removeItem(COMPANY_CODE_KEY),
      AsyncStorage.removeItem(COMPANY_PASSWORD_KEY),
      AsyncStorage.removeItem(WAREHOUSE_ID_KEY),
      AsyncStorage.removeItem(ERROR_SOUND_KEY),
      AsyncStorage.removeItem(USE_EXISTING_BOX_KEY),
      AsyncStorage.removeItem(PRINTER_NAME_KEY),
    ]);
    clearApiUrlCache();
    setApiBaseUrl("");
    setCompanyCode("");
    setCompanyPassword("");
    setWarehouseId("");
    setErrorSound("error_1");
    setUseExistingBox(false);
    setPrinterName("EPSON");
  }, []);

  return useMemo(
    () => ({
      apiBaseUrl,
      companyCode,
      companyPassword,
      warehouseId,
      errorSound,
      useExistingBox,
      printerName,
      updatePrinterName,
      updateUseExistingBox,
      updateApiUrl,
      updateCompanyCode,
      updateCompanyPassword,
      updateWarehouseId,
      updateErrorSound,
      resetToDefault,
      isLoading: loadUrlQuery.isLoading,
      isSaving: saveMutation.isPending,
      defaultUrl: "https://webstreme.uniteks.com.tr:8001/ExtWsLiveV2/Services",
    }),
    [
      apiBaseUrl,
      companyCode,
      companyPassword,
      warehouseId,
      errorSound,
      useExistingBox,
      printerName,
      updatePrinterName,
      updateUseExistingBox,
      updateApiUrl,
      updateCompanyCode,
      updateCompanyPassword,
      updateWarehouseId,
      updateErrorSound,
      resetToDefault,
      loadUrlQuery.isLoading,
      saveMutation.isPending,
    ],
  );
});
