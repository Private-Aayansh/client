import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe, Check, X } from 'lucide-react-native';

interface LanguageSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  showTitle?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  isVisible,
  onClose,
  showTitle = true,
}) => {
  const { language, setLanguage, t, supportedLanguages, isLoading } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  const handleApply = async () => {
    if (selectedLanguage === language) {
      onClose();
      return;
    }

    try {
      setIsChanging(true);
      await setLanguage(selectedLanguage);
      onClose();
    } catch (error) {
      console.error('Language change error:', error);
      setSelectedLanguage(language); // Reset to current language on error
    } finally {
      setIsChanging(false);
    }
  };

  const handleCancel = () => {
    setSelectedLanguage(language); // Reset selection
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleCancel}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            
            {showTitle && (
              <View style={styles.titleSection}>
                <Globe size={24} color="#22C55E" />
                <Text style={styles.modalTitle}>{t('language.changeLanguage')}</Text>
              </View>
            )}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#22C55E" />
              <Text style={styles.loadingText}>Loading languages...</Text>
            </View>
          ) : (
            <>
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

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  disabled={isChanging}
                >
                  <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.applyButton, isChanging && styles.applyButtonDisabled]}
                  onPress={handleApply}
                  disabled={isChanging}
                >
                  {isChanging ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.applyButtonText}>{t('common.apply')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 16,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  languageScrollView: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  languageList: {
    gap: 8,
  },
  languageItem: {
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  languageItemSelected: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageNative: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  languageNativeSelected: {
    color: '#22C55E',
  },
  languageEnglish: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  languageEnglishSelected: {
    color: '#16A34A',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#22C55E',
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});