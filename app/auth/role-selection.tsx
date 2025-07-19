import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { Tractor, HardHat, Sparkles, ArrowRight } from 'lucide-react-native';
import { Logo } from '../../components/Logo';

const { width, height } = Dimensions.get('window');

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
        <View style={styles.circle4} />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Logo size="medium" variant="horizontal" />
          {/* <View style={styles.headerBadge}>
            <Sparkles size={16} color="#FFFFFF" />
          </View> */}
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t('auth.roleSelection')}</Text>
            <View style={styles.titleDecoration}>
              <View style={styles.titleDot} />
              <View style={styles.titleDot} />
              <View style={styles.titleDot} />
            </View>
          </View>
          <Text style={styles.subtitle}>{t('auth.signupSubtitle')}</Text>
        </View>
        
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('farmer')}
            activeOpacity={0.9}
          >
            <View style={styles.cardGradient} />
            <View style={[styles.roleIcon, styles.farmerIcon]}>
              <Tractor size={40} color="#22C55E" />
            </View>
            <View style={styles.roleContent}>
              <Text style={[styles.roleText, styles.farmerText]}>{t('auth.farmer')}</Text>
              <Text style={styles.roleDescription}>Post jobs and find skilled labourers</Text>
            </View>
            <View style={styles.roleArrow}>
              <ArrowRight size={20} color="#22C55E" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('labour')}
            activeOpacity={0.9}
          >
            <View style={styles.cardGradient} />
            <View style={[styles.roleIcon, styles.labourIcon]}>
              <HardHat size={40} color="#8B4513" />
            </View>
            <View style={styles.roleContent}>
              <Text style={[styles.roleText, styles.labourText]}>{t('auth.labour')}</Text>
              <Text style={styles.roleDescription}>Find work opportunities near you</Text>
            </View>
            <View style={styles.roleArrow}>
              <ArrowRight size={20} color="#8B4513" />
            </View>
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
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    top: 40,
    right: -60,
  },
  circle2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(139, 69, 19, 0.06)',
    bottom: 120,
    left: -40,
  },
  circle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    top: height * 0.3,
    left: 30,
  },
  circle4: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 69, 19, 0.04)',
    bottom: height * 0.4,
    right: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 60,
    zIndex: 1,
  },
  headerContent: {
    position: 'relative',
  },
  headerBadge: {
    position: 'absolute',
    top: -8,
    right: -12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    zIndex: 1,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 80,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleDecoration: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  titleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 19,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 28,
  },
  roleContainer: {
    gap: 24,
  },
  roleCard: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(34, 197, 94, 0.03)',
    transform: [{ translateX: 40 }, { translateY: -40 }],
  },
  roleIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  farmerIcon: {
    backgroundColor: '#F0FDF4',
  },
  labourIcon: {
    backgroundColor: '#FEF7ED',
  },
  roleContent: {
    flex: 1,
  },
  roleText: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  farmerText: {
    color: '#22C55E',
  },
  labourText: {
    color: '#8B4513',
  },
  roleDescription: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    lineHeight: 24,
  },
  roleArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});