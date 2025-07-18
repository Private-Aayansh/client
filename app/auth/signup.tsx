import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { apiClient } from '../../utils/api';
import { phoneAuthService } from '../../utils/phoneAuth';
import { ArrowLeft, Mail, Phone } from 'lucide-react-native';
import { Logo } from '../../components/Logo';

export default function Signup() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: 'farmer' | 'labour' }>();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [useEmail, setUseEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [apiError, setApiError] = useState<string>('');

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

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

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');
    
    try {
      const signupData = {
        name: formData.name,
        role: role!,
        ...(useEmail ? { email: formData.email } : { phone: formData.phone }),
      };

      await apiClient.signup(signupData); // First, send signup request

      if (useEmail) {
        // If email signup, send OTP for login
        await apiClient.loginEmail(formData.email);
        router.push({
          pathname: '/auth/otp-verification',
          params: {
            role: role!,
            email: formData.email,
            isSignup: 'true', // Indicate that this is part of a signup flow
          },
        });
      } else {
        // If phone signup, initiate Firebase phone auth
        const result = await phoneAuthService.sendOTP(formData.phone);
        if (result.success) {
          router.push({
            pathname: '/auth/otp-verification',
            params: {
              role: role!,
              phone: formData.phone,
              name: formData.name,
              useFirebase: 'true',
              isSignup: 'true',
            },
          });
        } else {
          setApiError(result.error || 'Failed to send OTP to phone');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.';
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
      </View>
      
      {/* reCAPTCHA container for web phone auth */}
      {Platform.OS === 'web' && !useEmail && (
        <div id="recaptcha-container" style={{ display: 'none' }}></div>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/auth/role-selection')}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Logo size="small" variant="horizontal" />
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{t('auth.signupTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.signupSubtitle')}</Text>
        </View>

        {apiError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{apiError}</Text>
          </View>
        ) : null}

        <Input
          label={t('common.name')}
          placeholder={t('auth.enterName')}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          error={errors.name}
        />

        <View style={styles.contactSection}>
          <View style={styles.contactToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, useEmail && styles.toggleButtonActive]}
              onPress={() => setUseEmail(true)}
              activeOpacity={0.8}
            >
              <Mail size={16} color={useEmail ? '#FFFFFF' : '#6B7280'} />
              <Text style={[styles.toggleText, useEmail && styles.toggleTextActive]}>
                {t('common.email')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !useEmail && styles.toggleButtonActive]}
              onPress={() => setUseEmail(false)}
              activeOpacity={0.8}
            >
              <Phone size={16} color={!useEmail ? '#FFFFFF' : '#6B7280'} />
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
          title={t('common.signup')}
          onPress={handleSignup}
          loading={loading}
          size="large"
          style={styles.signupButton}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.haveAccount')}</Text>
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/auth/login',
              params: { role: role! },
            })}
          >
            <Text style={styles.footerLink}>{t('common.login')}</Text>
          </TouchableOpacity>
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
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(34, 197, 94, 0.06)',
    top: 120,
    right: -20,
  },
  circle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(34, 197, 94, 0.04)',
    bottom: 250,
    left: -10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    zIndex: 1,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  contactSection: {
    marginBottom: 40,
  },
  contactToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  signupButton: {
    width: '100%',
    marginBottom: 32,
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 16,
    color: '#64748B',
    marginRight: 4,
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 16,
    color: '#22C55E',
    fontWeight: '700',
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
  signupButton: {
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