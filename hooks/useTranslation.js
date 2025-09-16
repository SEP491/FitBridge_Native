import { useState, useEffect } from "react";
import i18n, {
  t,
  changeLanguage,
  getCurrentLanguage,
  onLanguageChange,
} from "../i18n";

/**
 * Custom hook for handling translations and language changes
 * @returns {object} Translation utilities
 */
export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    // Subscribe to language changes
    const unsubscribe = onLanguageChange((newLanguage) => {
      setCurrentLanguage(newLanguage);
      forceUpdate((prev) => prev + 1);
    });

    // Update current language in case it was loaded from storage
    setCurrentLanguage(getCurrentLanguage());

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Force re-render when language changes
  const handleLanguageChange = async (locale) => {
    await changeLanguage(locale);
    setCurrentLanguage(locale);
    forceUpdate((prev) => prev + 1);
  };

  return {
    t, // Translation function
    currentLanguage,
    changeLanguage: handleLanguageChange,
    i18n,
  };
};

/**
 * HOC for components that need automatic re-rendering on language change
 * @param {React.Component} Component - Component to wrap
 * @returns {React.Component} Wrapped component
 */
export const withTranslation = (Component) => {
  return (props) => {
    const translation = useTranslation();
    return <Component {...props} {...translation} />;
  };
};
