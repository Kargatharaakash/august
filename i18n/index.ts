/**
 * August.ai Internationalization (i18n) Configuration
 * Multi-language support with React i18next
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

// Import translation files
import en from './locales/en.json';
import hi from './locales/hi.json';
import gu from './locales/gu.json';

// Language storage key
const LANGUAGE_STORAGE_KEY = '@august_language';

// Language detector
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Try to get saved language first
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }

      // Fallback to device locale
      const deviceLocales = getLocales();
      const deviceLanguage = deviceLocales[0]?.languageCode || 'en';
      
      // Map device language to supported languages
      const supportedLanguages = ['en', 'hi', 'gu'];
      const language = supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'en';
      
      callback(language);
    } catch (error) {
      console.error('Language detection failed:', error);
      callback('en'); // Fallback to English
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    } catch (error) {
      console.error('Failed to cache language:', error);
    }
  },
};

// Initialize i18n
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: __DEV__,
    
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      gu: { translation: gu },
    },
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    react: {
      useSuspense: false, // Important for React Native
    },
    
    // Advanced configuration
    saveMissing: __DEV__, // Save missing translations in development
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (__DEV__) {
        console.warn(`Missing translation: ${lng}:${key}`);
      }
    },
  });

export default i18n;

// Helper functions
export const getSupportedLanguages = () => [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
];

export const changeLanguage = async (language: string) => {
  try {
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Failed to change language:', error);
  }
};

export const getCurrentLanguage = () => i18n.language;

export const isRTL = () => {
  const rtlLanguages: string[] = []; // No RTL languages in our supported set
  return rtlLanguages.includes(i18n.language);
};