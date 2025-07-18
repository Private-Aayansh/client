import React, { createContext, useContext, useEffect, useState } from 'react';
import { I18nManager, Alert } from 'react-native';
import { storage, STORAGE_KEYS } from '../utils/storage';
import i18n, { SUPPORTED_LANGUAGES, getLanguageInfo, isRTL } from '../utils/i18n';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => Promise<void>;
  t: (key: string, options?: any) => string;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  currentLanguageInfo: typeof SUPPORTED_LANGUAGES[0];
  isRTL: boolean;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeLanguage();
  }, []);

  const initializeLanguage = async () => {
    try {
      setIsLoading(true);
      const savedLanguage = await storage.getItem(STORAGE_KEYS.LANGUAGE);
      
      if (savedLanguage && SUPPORTED_LANGUAGES.some(lang => lang.code === savedLanguage)) {
        await applyLanguage(savedLanguage);
      } else {
        // Use device locale or fallback to English
        const deviceLocale = i18n.locale || 'en';
        await applyLanguage(deviceLocale);
      }
    } catch (error) {
      console.error('Language initialization error:', error);
      await applyLanguage('en'); // Fallback to English
    } finally {
      setIsLoading(false);
    }
  };

  const applyLanguage = async (newLanguage: string) => {
    try {
      // Validate language code
      if (!SUPPORTED_LANGUAGES.some(lang => lang.code === newLanguage)) {
        console.warn(`Unsupported language: ${newLanguage}, falling back to English`);
        newLanguage = 'en';
      }

      // Update i18n locale
      i18n.locale = newLanguage;
      
      // Handle RTL layout
      const isRTLLanguage = isRTL(newLanguage);
      if (I18nManager.isRTL !== isRTLLanguage) {
        I18nManager.allowRTL(isRTLLanguage);
        I18nManager.forceRTL(isRTLLanguage);
        
        // Show restart prompt for RTL changes (mobile only)
        if (isRTLLanguage !== I18nManager.isRTL) {
          Alert.alert(
            'Language Changed',
            'Please restart the app to apply the new language direction.',
            [{ text: 'OK' }]
          );
        }
      }
      
      setLanguageState(newLanguage);
    } catch (error) {
      console.error('Apply language error:', error);
      throw error;
    }
  };

  const setLanguage = async (newLanguage: string) => {
    try {
      setIsLoading(true);
      
      // Save to storage
      await storage.setItem(STORAGE_KEYS.LANGUAGE, newLanguage);
      
      // Apply language changes
      await applyLanguage(newLanguage);
      
      // Show success message
      const successMessage = i18n.t('language.languageChanged', { locale: newLanguage });
      console.log(successMessage);
      
    } catch (error) {
      console.error('Set language error:', error);
      Alert.alert('Error', 'Failed to change language. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const t = (key: string, options?: any) => {
    try {
      return i18n.t(key, { ...options, locale: language });
    } catch (error) {
      console.warn(`Translation missing for key: ${key}`, error);
      return key; // Return key as fallback
    }
  };

  const currentLanguageInfo = getLanguageInfo(language);
  const currentIsRTL = isRTL(language);

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t,
    supportedLanguages: SUPPORTED_LANGUAGES,
    currentLanguageInfo,
    isRTL: currentIsRTL,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};