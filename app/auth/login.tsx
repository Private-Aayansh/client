import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { apiClient } from '../../utils/api';
import { phoneAuthService } from '../../utils/phoneAuth';
import { ArrowLeft, Mail, Phone, Sparkles, Shield } from 'lucide-react-native';
import { Logo } from '../../components/Logo';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
  });
  const [useEmail, setUseEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [apiError, setApiError] = useState<string>('');

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (useEmail) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
    } else {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
        newErrors.phone = 'Phone number is invalid';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');
    
    try {
      if (useEmail) {
        // Email OTP flow (existing)
        await apiClient.loginEmail(formData.email);
        
        // Navigate to OTP verification
        router.push({
          pathname: '/auth/otp-verification',
          params: {
            email: formData.email,
          },
        });
      } else {
        // Phone OTP flow using Firebase
        const result = await phoneAuthService.sendOTP(formData.phone);
        
        if (result.success) {
          // Navigate to OTP verification with phone
          router.push({
            pathname: '/auth/otp-verification',
            params: {
              phone: formData.phone,
              useFirebase: 'true', // Flag to indicate Firebase phone auth
            },
          });
        } else {
          setApiError(result.error || 'Failed to send OTP to phone');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundDecoration}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>
      
      {/* reCAPTCHA container for web phone auth */}
      {Platform.OS === 'web' && !useEmail && (
        <div id="recaptcha-container" style={{ display: 'none' }}></div>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/auth/role-selection')}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerLogo}>
          <Logo size="medium" variant="horizontal" />
          {/* <View style={styles.headerBadge}>
            <Shield size={12} color="#FFFFFF" />
          </View> */}
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.heroSection}>
          <View style={styles.titleContainer}>
            <View style={styles.titleIcon}>
              <Sparkles size={24} color="#22C55E" />
            </View>
            <Text style={styles.title}>{t('auth.loginTitle')}</Text>
          </View>
          <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>
        </View>

        {apiError ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>!</Text>
            </View>
            <Text style={styles.errorText}>{apiError}</Text>
          </View>
        ) : null}

        <View style={styles.formSection}>
          <View style={styles.contactToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, useEmail && styles.toggleButtonActive]}
              onPress={() => setUseEmail(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.toggleIcon, useEmail && styles.toggleIconActive]}>
                <Mail size={16} color={useEmail ? '#FFFFFF' : '#6B7280'} />
              </View>
              <Text style={[styles.toggleText, useEmail && styles.toggleTextActive]}>
                {t('common.email')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !useEmail && styles.toggleButtonActive]}
              onPress={() => setUseEmail(false)}
              activeOpacity={0.8}
            >
              <View style={[styles.toggleIcon, !useEmail && styles.toggleIconActive]}>
                <Phone size={16} color={!useEmail ? '#FFFFFF' : '#6B7280'} />
              </View>
              <Text style={[styles.toggleText, !useEmail && styles.toggleTextActive]}>
                {t('common.phone')}
              </Text>
            </TouchableOpacity>
          </View>

          {useEmail ? (
            <Input
              label={t('common.email')}
              placeholder={t('auth.enterEmail')}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
          ) : (
            <Input
              label={t('common.phone')}
              placeholder="+91 9876543210"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
              error={errors.phone}
            />
          )}
        </View>

        <Button
          title={t('common.login')}
          onPress={handleLogin}
          loading={loading}
          size="large"
          style={styles.loginButton}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.noAccount')}</Text>
          <TouchableOpacity
            onPress={() => router.push('/auth/role-selection')}
          >
            <Text style={styles.footerLink}>{t('common.signup')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    position: 'relative',
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
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    top: 80,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    bottom: 150,
    left: -40,
  },
  circle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(34, 197, 94, 0.03)',
    top: height * 0.4,
    right: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1,
  },
  headerLogo: {
    position: 'relative',
  },
  headerBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    zIndex: 1,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    gap: 12,
  },
  errorIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  formSection: {
    marginBottom: 48,
  },
  contactToggle: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 6,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  toggleButtonActive: {
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  toggleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  loginButton: {
    width: '100%',
    marginBottom: 40,
    borderRadius: 20,
    paddingVertical: 20,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 17,
    color: '#64748B',
    marginRight: 4,
    fontWeight: '600',
  },
  footerLink: {
    fontSize: 17,
    color: '#22C55E',
    fontWeight: '800',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  contactSection: {
    marginBottom: 32,
  },
  contactToggle: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#22C55E',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  loginButton: {
    width: '100%',
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  footerLink: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '600',
  },
});