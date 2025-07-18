import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { Globe, Check } from 'lucide-react-native';

export default function LanguageSelector() {
  const router = useRouter();
  const { language, setLanguage, t, supportedLanguages, isLoading: languageLoading } = useLanguage();
  const { setHasSeenLanguageSelector } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  const handleContinue = async () => {
    try {
      setIsChanging(true);
      
      if (selectedLanguage !== language) {
        await setLanguage(selectedLanguage);
      }
      
      await setHasSeenLanguageSelector(true);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Language selection error:', error);
    } finally {
      setIsChanging(false);
    }
  };

  if (languageLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={styles.loadingText}>Loading languages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundDecoration}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>
      
      <View style={styles.header}>
        <Logo size="medium" variant="vertical" />
        <Text style={styles.brandTagline}>{t('brand.tagline')}</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <View style={styles.titleIcon}>
            <Globe size={32} color="#22C55E" />
          </View>
          <Text style={styles.title}>{t('language.title')}</Text>
          <Text style={styles.subtitle}>{t('language.subtitle')}</Text>
        </View>
        
        <ScrollView 
          style={styles.languageScrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.languageList}
        >
          {supportedLanguages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                selectedLanguage === lang.code && styles.languageItemSelected,
              ]}
              onPress={() => handleLanguageSelect(lang.code)}
              activeOpacity={0.8}
              disabled={isChanging}
            >
              <View style={styles.languageContent}>
                <View style={styles.languageInfo}>
                  <Text style={[
                    styles.languageNative,
                    selectedLanguage === lang.code && styles.languageNativeSelected,
                  ]}>
                    {lang.nativeName}
                  </Text>
                  <Text style={[
                    styles.languageEnglish,
                    selectedLanguage === lang.code && styles.languageEnglishSelected,
                  ]}>
                    {lang.name}
                  </Text>
                </View>
                {selectedLanguage === lang.code && (
                  <View style={styles.checkmark}>
                    <Check size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={t('common.continue')}
            onPress={handleContinue}
            loading={isChanging}
            disabled={isChanging}
            size="large"
            style={styles.continueButton}
          />
          
          <Text style={styles.footerNote}>
            {t('language.canChangeInSettings')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    top: -50,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    bottom: 100,
    left: -30,
  },
  circle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    top: '40%',
    right: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    zIndex: 1,
  },
  brandTagline: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    zIndex: 1,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  titleIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  languageScrollView: {
    flex: 1,
    marginBottom: 24,
  },
  languageList: {
    gap: 12,
    paddingBottom: 16,
  },
  languageItem: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  languageItemSelected: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
    shadowColor: '#22C55E',
    shadowOpacity: 0.2,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  languageInfo: {
    flex: 1,
  },
  languageNative: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  languageNativeSelected: {
    color: '#22C55E',
  },
  languageEnglish: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  languageEnglishSelected: {
    color: '#16A34A',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingBottom: 32,
  },
  continueButton: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  footerNote: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
});