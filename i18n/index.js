import { I18n } from "i18n-js";
import { getLocales } from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import translation files
import en from "./locales/en.json";
import vi from "./locales/vi.json";

// Create i18n instance
const i18n = new I18n();

// Set translations
i18n.translations = {
  en,
  vi,
};

// Set fallback language
i18n.fallbacks = true;
i18n.defaultLocale = "en";

// Language change listeners
const languageChangeListeners = [];

// Initialize language from storage or device locale
const initializeLanguage = async () => {
  try {
    // First, try to get saved language preference
    const savedLanguage = await AsyncStorage.getItem("selectedLanguage");

    if (savedLanguage && i18n.translations[savedLanguage]) {
      i18n.locale = savedLanguage;
      return;
    }

    // If no saved language, use device locale
    const deviceLocales = getLocales();
    if (deviceLocales.length > 0) {
      const deviceLanguage = deviceLocales[0].languageCode;

      // Check if we support the device language
      if (i18n.translations[deviceLanguage]) {
        i18n.locale = deviceLanguage;
      } else {
        i18n.locale = "en"; // Default to English
      }
    } else {
      i18n.locale = "en"; // Default to English
    }
  } catch (error) {
    console.error("Error initializing language:", error);
    i18n.locale = "en"; // Default to English on error
  }
};

// Initialize language immediately
initializeLanguage();

// Export the configured i18n instance
export default i18n;

// Export translation function for easier usage
export const t = (key, options) => i18n.t(key, options);

// Export function to change language
export const changeLanguage = async (locale) => {
  if (i18n.translations[locale]) {
    i18n.locale = locale;

    // Save language preference
    try {
      await AsyncStorage.setItem("selectedLanguage", locale);
    } catch (error) {
      console.error("Error saving language preference:", error);
    }

    // Notify all listeners about the language change
    languageChangeListeners.forEach((callback) => callback(locale));
  }
};

// Export function to get current language
export const getCurrentLanguage = () => i18n.locale;

// Export function to subscribe to language changes
export const onLanguageChange = (callback) => {
  languageChangeListeners.push(callback);

  // Return unsubscribe function
  return () => {
    const index = languageChangeListeners.indexOf(callback);
    if (index > -1) {
      languageChangeListeners.splice(index, 1);
    }
  };
};

// Export function to get available languages
export const getAvailableLanguages = () => Object.keys(i18n.translations);
