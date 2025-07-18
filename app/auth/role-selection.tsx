import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { Tractor, HardHat } from 'lucide-react-native';
import { Logo } from '../../components/Logo';

export default function RoleSelection() {
  const router = useRouter();
  const { t } = useLanguage();

  const handleRoleSelect = (role: 'farmer' | 'labour') => {
    router.push({
      pathname: '/auth/signup',
      params: { role },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundDecoration}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>
      
      <View style={styles.header}>
        <Logo size="medium" variant="horizontal" />
      </View>
      
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{t('auth.roleSelection')}</Text>
          <Text style={styles.subtitle}>{t('auth.signupSubtitle')}</Text>
        </View>
        
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('farmer')}
            activeOpacity={0.9}
          >
            <View style={[styles.roleIcon, styles.farmerIcon]}>
              <Tractor size={48} color="#22C55E" />
            </View>
            <Text style={[styles.roleText, styles.farmerText]}>{t('auth.farmer')}</Text>
            <Text style={styles.roleDescription}>Post jobs and find skilled labourers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('labour')}
            activeOpacity={0.9}
          >
            <View style={[styles.roleIcon, styles.labourIcon]}>
              <HardHat size={48} color="#8B4513" />
            </View>
            <Text style={[styles.roleText, styles.labourText]}>{t('auth.labour')}</Text>
            <Text style={styles.roleDescription}>Find work opportunities near you</Text>
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
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    top: 50,
    right: -40,
  },
  circle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(139, 69, 19, 0.08)',
    bottom: 150,
    left: -20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    zIndex: 1,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 60,
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
  roleContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    transform: [{ scale: 1 }],
  },
  roleIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  farmerIcon: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  labourIcon: {
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
  },
  roleText: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  farmerText: {
    color: '#22C55E',
  },
  labourText: {
    color: '#8B4513',
  },
  roleDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
});