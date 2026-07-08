import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Hassas değerler (şifreler, token'lar) için platforma göre güvenli depolama:
// native'de SecureStore (Keychain/Keystore), web'de localStorage.
// api.ts içindeki tokenStorage ile aynı split mantığının tek, paylaşılan hali.
export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

// Daha önce AsyncStorage'da düz metin duran bir değeri SecureStore'a taşır.
// Mevcut kullanıcıların oturumu/ayarı kaybolmasın diye bir kez çalışır:
// SecureStore'da değer varsa ona döner; yoksa AsyncStorage'daki eski değeri
// SecureStore'a kopyalayıp AsyncStorage'dan siler.
export async function getWithMigration(key: string): Promise<string | null> {
  const secureValue = await secureStorage.getItem(key);
  if (secureValue !== null) {
    return secureValue;
  }
  const legacyValue = await AsyncStorage.getItem(key);
  if (legacyValue !== null) {
    await secureStorage.setItem(key, legacyValue);
    await AsyncStorage.removeItem(key);
  }
  return legacyValue;
}
