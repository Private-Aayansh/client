import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { apiClient } from '../utils/api';
import { getCurrentLocation, requestLocationPermission } from '../utils/location';
import { SERVICE_TYPES } from '../types/service';
import { X, MapPin, DollarSign, Briefcase } from 'lucide-react-native';
import { Logo } from '../components/Logo';

export default function CreateServiceModal() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    service_name: '',
    description: '',
    cost: '',
  });

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [apiError, setApiError] = useState<string>('');
  const [showServiceTypes, setShowServiceTypes] = useState(false);

  const requestLocation = useCallback(async () => {
    setLocationLoading(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'Please allow location access to create services. This helps other farmers find services near them.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: requestLocation },
          ]
        );
        return;
      }

      const currentLocation = await getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
      } else {
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Please try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', onPress: requestLocation },
          ]
        );
      }
    } catch (error) {
      console.error('Location request error:', error);
      Alert.alert('Error', 'Failed to get location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.service_name.trim()) {
      newErrors.service_name = 'Service type is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Service description is required';
    }

    if (!formData.cost.trim()) {
      newErrors.cost = 'Service cost is required';
    } else if (isNaN(Number(formData.cost)) || Number(formData.cost) < 0) {
      newErrors.cost = 'Please enter a valid cost';
    }

    if (!location) {
      newErrors.location = 'Location is required. Please allow location access.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateService = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');
    
    try {
      const serviceData = {
        service_name: formData.service_name.trim(),
        description: formData.description.trim(),
        latitude: location!.latitude,
        longitude: location!.longitude,
        cost: Number(formData.cost),
        status: 1, // Active
      };

      await apiClient.createService(serviceData);
      
      Alert.alert(
        'Success',
        'Service created successfully! Other farmers in your area will now be able to see and book your service.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Create service error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create service. Please try again.';
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceTypeSelect = (serviceType: string) => {
    setFormData(prev => ({ ...prev, service_name: serviceType }));
    setShowServiceTypes(false);
  };

  const selectedServiceType = SERVICE_TYPES.find(type => type.value === formData.service_name);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Logo size="small" variant="horizontal" />
          <Text style={styles.title}>Create Service</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {apiError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{apiError}</Text>
          </View>
        ) : null}

        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <MapPin size={20} color="#22C55E" />
            <Text style={styles.locationTitle}>Service Location</Text>
          </View>
          {locationLoading ? (
            <Text style={styles.locationText}>Getting your location...</Text>
          ) : location ? (
            <Text style={styles.locationText}>
              Location detected: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          ) : (
            <TouchableOpacity style={styles.locationButton} onPress={requestLocation}>
              <Text style={styles.locationButtonText}>Enable Location Access</Text>
            </TouchableOpacity>
          )}
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Briefcase size={20} color="#22C55E" />
            <Text style={styles.sectionTitle}>Service Details</Text>
          </View>

          <View style={styles.serviceTypeContainer}>
            <Text style={styles.inputLabel}>Service Type *</Text>
            <TouchableOpacity 
              style={[styles.serviceTypeButton, errors.service_name && styles.serviceTypeButtonError]}
              onPress={() => setShowServiceTypes(!showServiceTypes)}
            >
              <View style={styles.serviceTypeContent}>
                {selectedServiceType ? (
                  <>
                    <Text style={styles.serviceTypeEmoji}>{selectedServiceType.icon}</Text>
                    <Text style={styles.serviceTypeText}>{selectedServiceType.label}</Text>
                  </>
                ) : (
                  <Text style={styles.serviceTypePlaceholder}>Select service type</Text>
                )}
              </View>
            </TouchableOpacity>
            {errors.service_name && <Text style={styles.errorText}>{errors.service_name}</Text>}

            {showServiceTypes && (
              <View style={styles.serviceTypeDropdown}>
                <ScrollView style={styles.serviceTypeList} nestedScrollEnabled>
                  {SERVICE_TYPES.map((serviceType) => (
                    <TouchableOpacity
                      key={serviceType.value}
                      style={styles.serviceTypeOption}
                      onPress={() => handleServiceTypeSelect(serviceType.value)}
                    >
                      <Text style={styles.serviceTypeEmoji}>{serviceType.icon}</Text>
                      <Text style={styles.serviceTypeOptionText}>{serviceType.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <Input
            label="Service Description *"
            placeholder="Describe your service in detail..."
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
            error={errors.description}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color="#22C55E" />
            <Text style={styles.sectionTitle}>Pricing</Text>
          </View>

          <Input
            label="Service Cost (₹) *"
            placeholder="e.g., 1500"
            value={formData.cost}
            onChangeText={(text) => setFormData({ ...formData, cost: text })}
            keyboardType="numeric"
            error={errors.cost}
          />
        </View>

        <Button
          title="Create Service"
          onPress={handleCreateService}
          loading={loading}
          disabled={!location || locationLoading}
          size="large"
          style={styles.createButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 24,
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
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  locationSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  locationButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  serviceTypeContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  serviceTypeButton: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceTypeButtonError: {
    borderColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOpacity: 0.1,
  },
  serviceTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceTypeEmoji: {
    fontSize: 20,
  },
  serviceTypeText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  serviceTypePlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  serviceTypeDropdown: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 300,
  },
  serviceTypeList: {
    maxHeight: 280,
  },
  serviceTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  serviceTypeOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  createButton: {
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
});