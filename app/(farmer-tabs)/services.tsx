import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/api';
import { getCurrentLocation, requestLocationPermission } from '../../utils/location';
import { firebaseChatService } from '../../utils/firebaseChat';
import { Service, SERVICE_TYPES } from '../../types/service';
import { Search, Plus, Calendar, MapPin, Star, Filter, Trash2, MessageCircle, DollarSign, SquarePlus as PlusSquare, Briefcase, User } from 'lucide-react-native';
import ServiceFilterModal from '../../components/ServiceFilterModal';

export default function FarmerServices() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  
  const [nearbyServices, setNearbyServices] = useState<Service[]>([]);
  const [myServices, setMyServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showMyServices, setShowMyServices] = useState(false);
  const [radius, setRadius] = useState(5);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    initializeServices();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!showMyServices) {
        loadNearbyServices();
      } else {
        loadMyServices();
      }
    }, [showMyServices, radius])
  );

  const initializeServices = async () => {
    try {
      // Initialize Firebase auth for chat functionality
      if (user) {
        await firebaseChatService.initializeAuth();
      }
      
      // Get location and load nearby services
      await loadNearbyServices();
    } catch (error) {
      console.error('Service initialization error:', error);
    }
  };

  const loadNearbyServices = async () => {
    setLoading(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'Please allow location access to see nearby services.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: loadNearbyServices },
          ]
        );
        return;
      }

      const currentLocation = await getCurrentLocation();
      if (!currentLocation) {
        Alert.alert('Error', 'Unable to get your location. Please try again.');
        return;
      }

      setLocation(currentLocation);
      const services = await apiClient.getNearbyServices(
        currentLocation.latitude,
        currentLocation.longitude,
        radius
      );

      // Filter out user's own services from nearby services
      const filteredServices = services.filter(service => 
        user && service.farmer_id !== user.id
      );
      setNearbyServices(filteredServices);
    } catch (error) {
      console.error('Load nearby services error:', error);
      Alert.alert('Error', 'Failed to load nearby services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMyServices = async () => {
    setLoading(true);
    try {
      const services = await apiClient.getMyServices();
      setMyServices(services);
    } catch (error) {
      console.error('Load my services error:', error);
      Alert.alert('Error', 'Failed to load your services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (service: Service) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${service.service_name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.deleteService(service.id);
              // Update the services list after successful deletion
              await loadMyServices();
              Alert.alert('Success', 'Service deleted successfully.');
            } catch (error) {
              console.error('Delete service error:', error);
              Alert.alert('Error', 'Failed to delete service. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleBookService = async (service: Service) => {
    if (!user) {
      Alert.alert('Error', 'Please log in to book services.');
      return;
    }

    if (service.farmer_id === user.id) {
      Alert.alert('Info', 'You cannot book your own service.');
      return;
    }

    try {
      // Create a chat between the current farmer and the service provider
      const chatId = await firebaseChatService.createOrGetChat(
        service.farmer_id.toString(),
        service.farmer_name,
        user.id.toString(),
        user.name || 'Farmer',
        service.id, // Using service ID as job ID for chat context
        `Service: ${service.service_name}`
      );

      router.push({
        pathname: '/chat',
        params: {
          farmerId: service.farmer_id.toString(),
          farmerName: service.farmer_name,
          labourId: user.id.toString(),
          labourName: user.name || 'Farmer',
          jobId: service.id.toString(),
          jobTitle: `Service: ${service.service_name}`,
        },
      });
    } catch (error) {
      console.error('Book service error:', error);
      Alert.alert('Error', 'Failed to start chat. Please try again.');
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (showMyServices) {
      loadMyServices().finally(() => setRefreshing(false));
    } else {
      loadNearbyServices().finally(() => setRefreshing(false));
    }
  }, [showMyServices]);

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    setShowFilterModal(false);
    if (!showMyServices) {
      loadNearbyServices();
    }
  };

  const getServiceIcon = (serviceName: string) => {
    const serviceType = SERVICE_TYPES.find(type => type.value === serviceName);
    return serviceType?.icon || '⚙️';
  };

  const getServiceTypeColor = (serviceName: string) => {
    const colors = {
      'Tractor': '#F0FDF4',
      'Thresher': '#FEF3C7',
      'Harvester': '#EFF6FF',
      'Irrigation': '#F0F9FF',
      'Plowing': '#F5F3FF',
      'Seeding': '#ECFDF5',
      'Fertilizer': '#FDF4FF',
      'Pesticide': '#FEF2F2',
      'Transportation': '#F3F4F6',
      'Storage': '#FFFBEB',
      'End-to-End Contract': '#F0FDF4',
      'Other': '#F9FAFB',
    };
    return colors[serviceName as keyof typeof colors] || '#F9FAFB';
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return '#22C55E'; // Active
      case 0: return '#EF4444'; // Inactive
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return 'Available';
      case 0: return 'Unavailable';
      default: return 'Unknown';
    }
  };

  const currentServices = showMyServices ? myServices : nearbyServices;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('dashboard.farmer.services')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.searchButton}>
            <Search size={24} color="#374151" />
          </TouchableOpacity>
          {!showMyServices && (
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Filter size={24} color="#374151" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, !showMyServices && styles.activeTab]}
          onPress={() => setShowMyServices(false)}
        >
          <Text style={[styles.tabText, !showMyServices && styles.activeTabText]}>
            {t('services.nearbyServices')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, showMyServices && styles.activeTab]}
          onPress={() => setShowMyServices(true)}
        >
          <Text style={[styles.tabText, showMyServices && styles.activeTabText]}>
            {t('services.myServices')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.servicesList} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#22C55E"]} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22C55E" />
            <Text style={styles.loadingText}>
              {showMyServices ? 'Loading your services...' : 'Finding services near you...'}
            </Text>
          </View>
        ) : currentServices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Briefcase size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {showMyServices ? 'No services created yet' : 'No services found nearby'}
            </Text>
            <Text style={styles.emptySubtext}>
              {showMyServices 
                ? 'Create your first service to get started' 
                : `Try increasing the search radius (current: ${radius}km)`}
            </Text>
          </View>
        ) : (
          currentServices.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceGradient} />
              <View style={styles.serviceHeader}>
                <View style={[
                  styles.serviceIconContainer,
                  { backgroundColor: getServiceTypeColor(service.service_name) }
                ]}>
                  <Text style={styles.serviceIcon}>{getServiceIcon(service.service_name)}</Text>
                </View>
                <View style={styles.serviceTitleSection}>
                  <Text style={styles.serviceTitle}>{service.service_name}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(service.status) }
                  ]}>
                    <Text style={styles.statusText}>{getStatusText(service.status)}</Text>
                  </View>
                </View>
                {showMyServices && (
                  <TouchableOpacity 
                    onPress={() => handleDeleteService(service)}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            
            <View style={styles.serviceContent}>
              {!showMyServices && (
                <Text style={styles.serviceProvider}>by {service.farmer_name}</Text>
              )}
              
              {service.description && (
                <Text style={styles.serviceDescription} numberOfLines={2}>
                  {service.description}
                </Text>
              )}

              <View style={styles.serviceDetails}>
                <View style={styles.detailRow}>
                  <MapPin size={14} color="#6B7280" />
                  <Text style={styles.detailText}>{service.location}</Text>
                </View>
                {service.distance && (
                  <View style={styles.detailRow}>
                    <Text style={styles.distanceText}>{service.distance.toFixed(1)} km away</Text>
                  </View>
                )}
              </View>

              <View style={styles.serviceFooter}>
                <View style={styles.priceSection}>
                  <DollarSign size={16} color="#22C55E" />
                  <Text style={styles.price}>₹{service.cost}</Text>
                </View>
                {!showMyServices && service.farmer_id !== user?.id && (
                  <TouchableOpacity 
                    style={styles.bookButton}
                    onPress={() => handleBookService(service)}
                  >
                    <MessageCircle size={16} color="#FFFFFF" />
                    <Text style={styles.bookText}>{t('services.bookNow')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/create-service-modal')}
      >
        <PlusSquare size={30} color="#FFFFFF" />
      </TouchableOpacity>

      <ServiceFilterModal
        isVisible={showFilterModal}
        currentRadius={radius}
        onClose={() => setShowFilterModal(false)}
        onApply={handleRadiusChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  searchButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  filterButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#F0FDF4',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#22C55E',
  },
  servicesList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  serviceCard: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  serviceGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(34, 197, 94, 0.03)',
    transform: [{ translateX: 30 }, { translateY: -30 }],
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  serviceIcon: {
    fontSize: 28,
  },
  serviceTitleSection: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
    lineHeight: 28,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deleteButton: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  serviceContent: {
    flex: 1,
  },
  serviceProvider: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 16,
    fontWeight: '600',
  },
  serviceDescription: {
    fontSize: 17,
    color: '#64748B',
    lineHeight: 26,
    marginBottom: 20,
    fontWeight: '500',
  },
  serviceDetails: {
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 15,
    color: '#64748B',
    flex: 1,
    fontWeight: '600',
  },
  distanceText: {
    fontSize: 13,
    color: '#22C55E',
    fontWeight: '700',
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#22C55E',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  bookText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    right: 24,
    bottom: 24,
    backgroundColor: '#22C55E',
    borderRadius: 34,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
});