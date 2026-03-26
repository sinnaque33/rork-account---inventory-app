import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL_STORAGE_KEY = "api_base_url";
const COMPANY_CODE_KEY = "company_code";
const COMPANY_PASSWORD_KEY = "company_password";
const WAREHOUSE_ID_KEY = "warehouse_id";

let cachedApiUrl: string | null = null;
let cachedCompanyCode: string | null = null;
let cachedCompanyPassword: string | null = null;
let cachedWarehouseId: string | null = null;

async function getApiBaseUrl(): Promise<string> {
  if (cachedApiUrl) {
    return cachedApiUrl;
  }
  try {
    const stored = await AsyncStorage.getItem(API_URL_STORAGE_KEY);
    cachedApiUrl = stored || "";
    return cachedApiUrl;
  } catch (error) {
    console.error("Failed to load API URL from storage:", error);
    return "";
  }
}

async function getCompanyCode(): Promise<string> {
  if (cachedCompanyCode !== null) {
    return cachedCompanyCode;
  }
  try {
    const stored = await AsyncStorage.getItem(COMPANY_CODE_KEY);
    cachedCompanyCode = stored || "";
    return cachedCompanyCode;
  } catch (error) {
    console.error("Failed to load company code from storage:", error);
    return "";
  }
}

async function getCompanyPassword(): Promise<string> {
  if (cachedCompanyPassword !== null) {
    return cachedCompanyPassword;
  }
  try {
    const stored = await AsyncStorage.getItem(COMPANY_PASSWORD_KEY);
    cachedCompanyPassword = stored || "";
    return cachedCompanyPassword;
  } catch (error) {
    console.error("Failed to load company password from storage:", error);
    return "";
  }
}

async function getWarehouseId(): Promise<string> {
  if (cachedWarehouseId !== null) {
    return cachedWarehouseId;
  }
  try {
    const stored = await AsyncStorage.getItem(WAREHOUSE_ID_KEY);
    cachedWarehouseId = stored || "3";
    return cachedWarehouseId;
  } catch (error) {
    console.error("Failed to load warehouse id from storage:", error);
    return "3";
  }
}

export function clearApiUrlCache() {
  cachedApiUrl = null;
  cachedCompanyCode = null;
  cachedCompanyPassword = null;
  cachedWarehouseId = null;
}

const tokenStorage = {
  async getToken(): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem("auth_token");
    }
    return await SecureStore.getItemAsync("auth_token");
  },

  async setToken(token: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem("auth_token", token);
    } else {
      await SecureStore.setItemAsync("auth_token", token);
    }
  },

  async removeToken(): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem("auth_token");
    } else {
      await SecureStore.deleteItemAsync("auth_token");
    }
  },
};

export interface LoginCredentials {
  userCode: string;
  password: string;
}

export interface LoginResponse {
  success: string;
  err: number;
  msg: string;
  firstName: string;
  lastName: string;
  admin: boolean;
  email: string | null;
  uid: number;
  code: string;
  special: string | null;
  password: string;
  token: string;
  ticket: string;
  company: string;
  companyPassword: string;
  companyName: string;
  picture: string;
  version: string;
  employeeId: number;
  resourceId: number;
  agent: boolean;
  dept: {
    id: number;
    code: string;
    name: string;
  };
  wh: {
    id: number;
    code: string;
    name: string;
  };
  ca: {
    id: number;
    code: string;
    name: string;
  };
  contact: {
    id: number;
    name: string;
    email: string;
  };
  privs: {
    logical: number;
    module: number;
    item: number;
    subitem: number;
    privilege: number;
  }[];
  decs: {
    pDecs: string;
    fpDecs: string;
    aDecs: string;
    faDecs: string;
    rDecs: string;
    frDecs: string;
    qDecs: string;
    vDecs: string;
    rrDecs: string;
  };
  menu: any[];
  app: Record<string, any>;
}

export interface CurrentAccount {
  CurrentAccountCode: string;
  CurrentAccountName: string;
}

export interface RunJsonServiceResponse<T> {
  success: string;
  err: number;
  msg: string;
  ticket: string;
  version: string;
  data: T;
}

export interface AccountsData {
  items: CurrentAccount[];
}

export interface InventoryItem {
  InventoryCode: string;
  InventoryName: string;
  Thumbnail: string;
}

export interface KoliItem {
  id: number;
  PackageNo: string;
  Explanation: string;
  ReceiptNo?: string;
  SipExp?: string;
}

export interface KoliDetailItem {
  InventoryName: string;
  Quantity: number;
  Thumbnail?: string | null;
}

export interface OrderReceipt {
  RecId: number;
  ReceiptNo: string;
  CurrentAccountName: string;
}

export const api = {
  auth: {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
      console.log("API: Attempting login with", credentials.userCode);
      const apiBaseUrl = await getApiBaseUrl();
      const companyCode = await getCompanyCode();
      const companyPassword = await getCompanyPassword();

      const requestBody: Record<string, string> = {
        userName: credentials.userCode,
        password: credentials.password,
        licenseKey: "16016923",
        companyCode: companyCode || "",
        companyPassword: companyPassword || "",
      };

      console.log("API: Making request to", `${apiBaseUrl}/Login`);

      try {
        const response = await fetch(`${apiBaseUrl}/Login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        console.log("API: Login Request", requestBody);
        console.log(
          "API: Response status",
          response.status,
          response.statusText,
        );
        console.log(
          "API: Response content-type",
          response.headers.get("content-type"),
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Login failed" }));
          throw new Error(errorData.message || "Invalid credentials");
        }

        const text = await response.text();
        console.log(
          "API: Response text (first 200 chars):",
          text.substring(0, 200),
        );

        let data: LoginResponse;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error("API: Failed to parse JSON response:", parseError);
          console.error("API: Response text:", text.substring(0, 500));
          throw new Error(
            "Server returned an invalid response. Please check if the API URL is correct.",
          );
        }
        console.log("API: Received login response", {
          success: data.success,
          code: data.code,
          err: data.err,
        });

        if (data.success === "true" && data.err === 0) {
          await tokenStorage.setToken(data.token);
          console.log("API: Login successful for user", credentials.userCode);
        }

        return data;
      } catch (error) {
        console.error("API: Login request failed", error);
        if (error instanceof Error) {
          if (error.message === "Failed to fetch") {
            throw new Error(
              "Network error: Unable to connect to server. Please check if the API URL is correct in settings, or if you're on web preview, this might be a CORS issue. Try using the mobile app via QR code.",
            );
          }
          throw error;
        }
        throw new Error("An unexpected error occurred during login");
      }
    },

    async logout(): Promise<void> {
      console.log("API: Logging out");
      await tokenStorage.removeToken();
    },

    async checkAuth(): Promise<boolean> {
      const token = await tokenStorage.getToken();
      return !!token;
    },
  },

  accounts: {
    async getList(
      userName: string,
      password: string,
    ): Promise<CurrentAccount[]> {
      console.log("API: Fetching current accounts");
      const apiBaseUrl = await getApiBaseUrl();
      const companyCode = await getCompanyCode();
      const companyPassword = await getCompanyPassword();

      const requestBody: Record<string, string> = {
        userName,
        password,
        licenseKey: "16016923",
        companyCode: companyCode || "",
        companyPassword: companyPassword || "",
        data: '{ "name": "accounts"}',
      };

      const response = await fetch(`${apiBaseUrl}/RunJsonService`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: RunJsonServiceResponse<AccountsData> = await response.json();
      console.log("API: Received accounts response", {
        success: data.success,
        itemsCount: data.data?.items?.length,
      });

      if (data.success !== "true") {
        throw new Error(data.msg || "Failed to fetch accounts");
      }

      return data.data?.items || [];
    },
  },

  inventory: {
    async getList(
      userName: string,
      password: string,
    ): Promise<InventoryItem[]> {
      console.log("API: Fetching inventory items");
      const apiBaseUrl = await getApiBaseUrl();
      const companyCode = await getCompanyCode();
      const companyPassword = await getCompanyPassword();

      const requestBody: Record<string, string> = {
        userName,
        password,
        licenseKey: "16016923",
        companyCode: companyCode || "",
        companyPassword: companyPassword || "",
        data: '{ "name": "inventory"}',
      };

      const response = await fetch(`${apiBaseUrl}/RunJsonService`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: RunJsonServiceResponse<{ items: InventoryItem[] }> =
        await response.json();
      console.log("API: Received inventory response", {
        success: data.success,
        itemsCount: data.data?.items?.length,
      });

      if (data.success !== "true") {
        throw new Error(data.msg || "Failed to fetch inventory");
      }

      return data.data?.items || [];
    },
  },

  koliListesi: {
    async getList(
      userName: string,
      password: string,
      offSet: number = 0,
      pageLen: number = 7,
      searchId?: string,
    ): Promise<KoliItem[]> {
      console.log(
        "API: Fetching koli listesi items with offSet:",
        offSet,
        "pageLen:",
        pageLen,
        "searchId:",
        searchId,
      );
      const apiBaseUrl = await getApiBaseUrl();
      const companyCode = await getCompanyCode();
      const companyPassword = await getCompanyPassword();

      const dataPayload =
        searchId && searchId.trim()
          ? `{ "name": "koliListesi", "id": "${searchId.trim()}" }`
          : '{ "name": "koliListesi" }';

      const requestBody: Record<string, string | number | boolean> = {
        userName,
        password,
        licenseKey: "16016923",
        companyCode: companyCode || "",
        companyPassword: companyPassword || "",
        logout: true,
        data: dataPayload,
        offSet,
        pageLen,
      };

      console.log(
        "API: koliListesi Request:",
        JSON.stringify(requestBody, null, 2),
      );

      const response = await fetch(`${apiBaseUrl}/RunJsonService`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: RunJsonServiceResponse<{ items: KoliItem[] }> =
        await response.json();
      console.log("API: Received koli listesi response", {
        success: data.success,
        itemsCount: data.data?.items?.length,
        offSet,
        pageLen,
      });

      if (data.success !== "true") {
        throw new Error(data.msg || "Failed to fetch koli listesi");
      }

      return data.data?.items || [];
    },

    async getDetail(
      userName: string,
      password: string,
      id: number,
    ): Promise<KoliDetailItem[]> {
      console.log("API: Fetching koli detail for id", id);
      const apiBaseUrl = await getApiBaseUrl();
      const companyCode = await getCompanyCode();
      const companyPassword = await getCompanyPassword();

      const requestBody: Record<string, string> = {
        userName,
        password,
        licenseKey: "16016923",
        companyCode: companyCode || "",
        companyPassword: companyPassword || "",
        data: `{ "name": "koliDetay", "id": "${id}"}`,
      };

      const response = await fetch(`${apiBaseUrl}/RunJsonService`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: RunJsonServiceResponse<{ items: KoliDetailItem[] }> =
        await response.json();

      // EKLENEN LOG: Gelen datayı formatlı bir şekilde konsola basar
      console.log(
        "📦 API DEBUG - Gelen Koli Detay Datası:\n",
        JSON.stringify(data.data?.items, null, 2),
      );

      console.log("API: Received koli detail response", {
        success: data.success,
        itemsCount: data.data?.items?.length,
      });

      if (data.success !== "true" && data.success !== (true as any)) {
        throw new Error(data.msg || "Failed to fetch koli detail");
      }

      return data.data?.items || [];
    },

 async addItemByBarcode(
      userName: string,
      password: string,
      boxId: number,
      barcode: string,
      orderReceiptId?: number,
      shipmentControlType: number = 3,
    ): Promise<{
      success: string;
      msg: string;
      err?: number;
      boxCode?: string;
      resultExplanation?: string;
      resultErrorType?: number;
    }> {
      const apiBaseUrl = await getApiBaseUrl();
      const companyCode = await getCompanyCode();
      const companyPassword = await getCompanyPassword();

      const dataPayload: any = {
        serviceType: 11,
        boxId: boxId,
        boxFieldsValue: [{ name: "SpecialCode", value: "fromExt" }],
        inventoryBarcode: barcode,
        quantity: 1,
        orderConnection: 1,
        orderShipmentControlType: shipmentControlType,
        orderReceiptId: orderReceiptId || 0,
      };

      const response = await fetch(`${apiBaseUrl}Ex/CreateShipmentBoxService`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: JSON.stringify(dataPayload),
          userName,
          password,
          companyCode: companyCode || "",
          companyPassword: companyPassword || "",
          licenseKey: "16016923",
          logout: true,
        }),
      });

      const resData = await response.json();

      // 🚨 1. BÜYÜK LOG: API'den dönen en dıştaki ham cevap
      console.log("=========================================");
      console.log("🚀 [RAW] API'DEN DÖNEN HAM CEVAP (resData):");
      console.log(JSON.stringify(resData, null, 2));
      console.log("=========================================");

      // --- PARSE İŞLEMİ ---
      let innerData: any = {};
      try {
        innerData =
          typeof resData.data === "string"
            ? JSON.parse(resData.data)
            : resData.data;
      } catch (e) {
        console.log("API: Data parse edilemedi");
      }

      // 🚨 2. BÜYÜK LOG: İçerideki gizli datanın (varsa) açılmış hali
      console.log("🧩 [PARSED] İÇERİDEN ÇIKAN DATA (innerData):");
      console.log(JSON.stringify(innerData, null, 2));
      console.log("=========================================");

      // --- ESKİ ÖZET LOGLAR ---
      console.log("KOLİ ÜRÜN EKLEME İŞLEMİ (Service 11)");
      console.log(`Hedef BoxId: ${boxId} | Barkod: ${barcode}`);
      console.log(`Kontrol Tipi (Sent): ${shipmentControlType}`);
      console.log(`ERP Mesajı: ${resData.msg}`);
      console.log(
        `Hata Tipi (resultErrorType): ${innerData?.resultErrorType || resData.resultErrorType || 0}`,
      );
      console.log("-----------------------------------------");

      return {
        success: resData.success,
        msg: resData.msg,
        err: resData.err,
        boxCode: innerData?.resultBoxCode,
        resultExplanation: innerData?.resultExplanation || resData.msg,
        resultErrorType: innerData?.resultErrorType || resData.resultErrorType,
      };
    },

    async createKoliFromOrderReceipt(
      userName: string,
      password: string,
      orderReceiptId: number,
      barcode: string,
      useExistingBox: boolean = false,
      shipmentControlType: number = 3,
    ): Promise<{
      success: string;
      msg: string;
      resultBoxId?: number;
      err?: number;
      boxCode?: string;
      resultErrorType?: number;
    }> {
      console.log("API: Creating koli from order receipt", orderReceiptId);
      const apiBaseUrl = await getApiBaseUrl();
      const companyCode = await getCompanyCode();
      const companyPassword = await getCompanyPassword();

      const dataPayload = {
        serviceType: useExistingBox ? 101 : 1,
        boxType: 2,
        boxId: 0,
        boxCode: "",
        orderReceiptId: orderReceiptId,
        inventoryBarcode: barcode,
        boxFieldsValue: [{ name: "SpecialCode", value: "fromExt" }],
        orderConnection: 1,
        orderShipmentControlType: shipmentControlType,
      };

      const requestBody = {
        data: JSON.stringify(dataPayload),
        userName,
        password,
        companyCode: companyCode || "",
        companyPassword: companyPassword || "",
        licenseKey: "16016923",
        logout: true,
      };

      console.log(
        "API: CreateKoliFromOrderReceipt Request:",
        JSON.stringify(requestBody, null, 2),
      );

      const response = await fetch(`${apiBaseUrl}Ex/CreateShipmentBoxService`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log(
        "YENI KOLI ACMA CEVABI (DEBUG):",
        JSON.stringify(data, null, 2),
      );

      let resultBoxId: number | undefined = data.resultBoxId;
      let boxCode: string | undefined = data.resultBoxCode;
      let resultErrorType: number | undefined = data.resultErrorType;

      if (data.data) {
        try {
          const parsedData =
            typeof data.data === "string" ? JSON.parse(data.data) : data.data;

          resultBoxId =
            resultBoxId ||
            parsedData.resultBoxId ||
            parsedData.boxId ||
            parsedData.id ||
            parsedData.RecId;

          boxCode =
            boxCode ||
            parsedData.resultBoxCode ||
            parsedData.boxCode ||
            parsedData.PackageNo;

          // Hata tipi genelde parse edilen data içinden gelir
          resultErrorType = resultErrorType || parsedData.resultErrorType;
        } catch {
          console.log("API: Could not parse response data");
        }
      }

      console.log(
        "API: CreateKoliFromOrderReceipt resultBoxId:",
        resultBoxId,
        "boxCode:",
        boxCode,
        "resultErrorType:",
        resultErrorType,
      );

      return {
        success: data.success,
        msg: data.msg,
        resultBoxId,
        err: data.err,
        boxCode,
        resultErrorType,
      };
    },

    async createReceipt(
      userName: string,
      password: string,
      boxId: number,
    ): Promise<{
      success: string;
      msg: string;
      resultBoxId?: number;
      err?: number;
    }> {
      console.log("API: Creating receipt for box", boxId);
      const apiBaseUrl = await getApiBaseUrl();
      const companyCode = await getCompanyCode();
      const companyPassword = await getCompanyPassword();
      const warehouseId = await getWarehouseId();

      const dataPayload = {
        serviceType: 100,
        boxId: boxId,
        inventoryReceiptType: 120,
        inventoryReceiptWarehouseId: parseInt(warehouseId, 10) || 3,
        orderConnection: 1,
        orderShipmentControlType: 3,
      };

      const requestBody = {
        data: JSON.stringify(dataPayload),
        userName,
        password,
        companyCode: companyCode || "",
        companyPassword: companyPassword || "",
        licenseKey: "16016923",
        logout: true,
      };

      console.log(
        "API: CreateReceipt Request:",
        JSON.stringify(requestBody, null, 2),
      );

      const response = await fetch(`${apiBaseUrl}Ex/CreateShipmentBoxService`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log(
        "API: CreateReceipt Response:",
        JSON.stringify(data, null, 2),
      );

      let resultBoxId: number | undefined = data.resultBoxId;

      if (!resultBoxId && data.data) {
        try {
          const parsedData =
            typeof data.data === "string" ? JSON.parse(data.data) : data.data;
          resultBoxId =
            parsedData.resultBoxId ||
            parsedData.boxId ||
            parsedData.id ||
            parsedData.RecId;
        } catch {
          console.log("API: Could not parse resultBoxId from response data");
        }
      }

      let finalErr = data.err;
      if (data.data) {
        try {
          const parsedData =
            typeof data.data === "string" ? JSON.parse(data.data) : data.data;
          if (parsedData.err !== undefined) finalErr = parsedData.err;
          if (parsedData.resultError === true) finalErr = finalErr || 99;
        } catch (e) {}
      }

      return {
        success: data.success,
        msg: data.msg,
        resultBoxId,
        err: finalErr,
      };
    },

    async getOrderReceipts(
      userName: string,
      password: string,
    ): Promise<OrderReceipt[]> {
      console.log("API: Fetching order receipts");
      const apiBaseUrl = await getApiBaseUrl();
      const companyCode = await getCompanyCode();
      const companyPassword = await getCompanyPassword();

      const requestBody: Record<string, string> = {
        userName,
        password,
        licenseKey: "16016923",
        companyCode: companyCode || "",
        companyPassword: companyPassword || "",
        data: '{ "name": "orderReceipts"}',
      };

      const response = await fetch(`${apiBaseUrl}/RunJsonService`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: RunJsonServiceResponse<{ items: OrderReceipt[] }> =
        await response.json();
      console.log("API: Received order receipts response", {
        success: data.success,
        itemsCount: data.data?.items?.length,
      });

      if (data.success !== "true") {
        throw new Error(data.msg || "Failed to fetch order receipts");
      }

      return data.data?.items || [];
    },

    async deleteItemByBarcode(
      userName: string,
      password: string,
      boxId: number,
      barcode: string,
    ): Promise<{ success: string; msg: string }> {
      console.log("API: Deleting item by barcode from box", boxId);
      const apiBaseUrl = await getApiBaseUrl();
      const companyCode = await getCompanyCode();
      const companyPassword = await getCompanyPassword();

      const dataPayload = {
        serviceType: 11,
        boxId: boxId,
        boxFieldsValue: [{ name: "SpecialCode", value: "fromExt" }],
        inventoryBarcode: barcode,
        quantity: -1,
        orderConnection: 1,
        orderShipmentControlType: 3,
      };

      const requestBody = {
        data: JSON.stringify(dataPayload),
        userName,
        password,
        companyCode: companyCode || "",
        companyPassword: companyPassword || "",
        licenseKey: "16016923",
        logout: true,
      };

      console.log(
        "API: DeleteItemByBarcode Request:",
        JSON.stringify(requestBody, null, 2),
      );

      const response = await fetch(`${apiBaseUrl}Ex/CreateShipmentBoxService`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log(
        "API: DeleteItemByBarcode Response:",
        JSON.stringify(data, null, 2),
      );

      return { success: data.success, msg: data.msg };
    },

    async openBox(
      userName: string,
      password: string,
      boxId: number,
    ): Promise<{ success: string; msg: string }> {
      console.log("API: Opening box", boxId);
      const apiBaseUrl = await getApiBaseUrl();
      const companyCode = await getCompanyCode();
      const companyPassword = await getCompanyPassword();

      const dataPayload = {
        serviceType: 2,
        boxId: boxId,
        boxFieldsValue: [
          { name: "Status", value: "0" }, // Sadece statüyü 0 olarak gönderiyoruz
        ],
        orderConnection: 1,
        orderShipmentControlType: 3,
      };

      const requestBody = {
        data: JSON.stringify(dataPayload),
        userName,
        password,
        companyCode: companyCode || "",
        companyPassword: companyPassword || "",
        licenseKey: "16016923",
        logout: true,
      };

      // YENİ EKLENEN LOG: İstek atılmadan önce ne gönderildiğini konsola yazdırır
      console.log(
        "API: OpenBox Request:",
        JSON.stringify(requestBody, null, 2),
      );

      const response = await fetch(`${apiBaseUrl}Ex/CreateShipmentBoxService`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("API: OpenBox Response:", JSON.stringify(data, null, 2));

      return { success: data.success, msg: data.msg };
    },
    async closeBox(
      userName: string,
      password: string,
      boxId: number,
      grossWeight: string,
      netWeight: string,
    ): Promise<{ success: string; msg: string }> {
      // 1. Fonksiyonun tetiklendiğini ve aldığı parametreleri gösteren log
      console.log("API: Closing box", boxId, "with weights", {
        grossWeight,
        netWeight,
      });

      const apiBaseUrl = await getApiBaseUrl();
      const companyCode = await getCompanyCode();
      const companyPassword = await getCompanyPassword();

      const dataPayload = {
        serviceType: 2,
        boxId: boxId,
        boxFieldsValue: [
          { name: "GrossWeight", value: grossWeight },
          { name: "NetWeight", value: netWeight },
          { name: "Status", value: "2" },
        ],
        orderConnection: 1,
        orderShipmentControlType: 3,
      };

      const requestBody = {
        data: JSON.stringify(dataPayload),
        userName,
        password,
        companyCode: companyCode || "",
        companyPassword: companyPassword || "",
        licenseKey: "16016923",
        logout: true,
      };

      // 2. İstek (Request) atılmadan önceki JSON verisini gösteren log
      console.log(
        "API: CloseBox Request:",
        JSON.stringify(requestBody, null, 2),
      );

      const response = await fetch(`${apiBaseUrl}Ex/CreateShipmentBoxService`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();

      // 3. API'den dönen cevabı (Response) gösteren log
      console.log("API: CloseBox Response:", JSON.stringify(data, null, 2));

      return { success: data.success, msg: data.msg };
    },

    async getKoliDetailByBarcode(
      userName: string,
      password: string,
      barcode: string,
    ): Promise<{ recId: number; err?: number; msg?: string , success: string}> {
      console.log("API: Fetching koli detail by barcode", barcode);
      const apiBaseUrl = await getApiBaseUrl();
      const companyCode = await getCompanyCode();
      const companyPassword = await getCompanyPassword();

      const requestBody: Record<string, string> = {
        userName,
        password,
        licenseKey: "16016923",
        companyCode: companyCode || "",
        companyPassword: companyPassword || "",
        data: `{ "name": "koliDetayWithBarcode", "val": "${barcode}"}`,
      };

      console.log(
        "API: getKoliDetailByBarcode Request:",
        JSON.stringify(requestBody, null, 2),
      );

      const response = await fetch(`${apiBaseUrl}/RunJsonService`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: RunJsonServiceResponse<{ items: Array<{ RecId: number }> }> =
        await response.json();
      console.log(
        "API: getKoliDetailByBarcode Response:",
        JSON.stringify(data, null, 2),
      );

      if (data.err === 99) {
        return {
          recId: 0,
          err: data.err,
          msg: data.msg,
          success: "false"
        };
      }

    if (data.success !== "true") {
        return {
          recId: 0,
          err: data.err || 1,
          msg: data.msg || "Failed to fetch koli detail",
          success: "false"
        };
      }

      // Extract RecId from items array
      const recId = data.data?.items?.[0]?.RecId || 0;
      console.log("API: Extracted RecId from items:", recId);

   return {
        recId,
        success: "true",
        err: 0,
        msg: data.msg
      };
    },
  },
};

export { tokenStorage };
