// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import tr from '../locales/tr.json';
import en from '../locales/en.json';

const resources = {
  tr: { translation: tr },
  en: { translation: en },
};

// Uygulama açılırken hafızadaki dili okuyan eklenti
const languageDetector: any = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      if (savedLanguage) {
        return callback(savedLanguage);
      }
      return callback('tr'); // Hafızada bir şey yoksa varsayılan TR başlasın
    } catch (error) {
      console.log('Dil okuma hatası:', error);
      return callback('tr');
    }
  },
  init: () => {},
  cacheUserLanguage: (lng: string) => {
    AsyncStorage.setItem('appLanguage', lng);
  },
};

i18n
  .use(languageDetector) // Önce dedektörü kullan
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;