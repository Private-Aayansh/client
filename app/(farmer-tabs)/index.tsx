import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { User, Bell, Camera, Image as ImageIcon, Play, Pause, Sun, Calendar, Sparkles, Zap } from 'lucide-react-native';
import { Logo } from '../../components/Logo';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

interface DiseaseDetectionResult {
  result: boolean;
  message: string;
  crop?: string;
  disease?: string;
  precautions?: string;
}

interface TTSResponse {
  message: string;
  url: string;
}

export default function FarmerHome() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user } = useAuth();

  // Disease detector states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DiseaseDetectionResult | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Language mapping for API
  const languageMapping: { [key: string]: { fullName: string; speaker: string } } = {
    hi: { fullName: 'hindi', speaker: 'Divya' },
    en: { fullName: 'english', speaker: 'Mary' },
    bn: { fullName: 'bengali', speaker: 'Aditi' },
    mr: { fullName: 'marathi', speaker: 'Sunita' },
    te: { fullName: 'telugu', speaker: 'Lalitha' },
    ta: { fullName: 'tamil', speaker: 'Jaya' },
    gu: { fullName: 'gujarati', speaker: 'Neha' },
    ur: { fullName: 'urdu', speaker: 'Divya' },
    kn: { fullName: 'kannada', speaker: 'Anu' },
    or: { fullName: 'odia', speaker: 'Debjani' },
    ml: { fullName: 'malayalam', speaker: 'Anjali' },
    pa: { fullName: 'punjabi', speaker: 'Divjot' },
  };

  const getCurrentDate = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      day: days[now.getDay()],
      date: `${now.getDate()} ${months[now.getMonth()]}`,
      temperature: '28°C' // Placeholder temperature
    };
  };

  const { day, date, temperature } = getCurrentDate();

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setDetectionResult(null);
      setAudioUrl(null);
    }
  };

  const openGallery = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Media library permission is required to select photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setDetectionResult(null);
      setAudioUrl(null);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to select an image',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const detectDisease = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first.');
      return;
    }

    const currentLanguage = languageMapping[language] || languageMapping['en'];
    setIsDetecting(true);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: 'plant_image.jpg',
      } as any);

      const response = await fetch(
        `https://disease-detector-api.ml.iit-ropar.truefoundry.cloud/predict/${currentLanguage.fullName}`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const result: DiseaseDetectionResult = await response.json();
      setDetectionResult(result);

      // If detection was successful and we have precautions, generate TTS
      if (result.result && result.precautions) {
        generateTTS(result.precautions);
      }
    } catch (error) {
      console.error('Disease detection error:', error);
      Alert.alert('Error', 'Failed to detect disease. Please try again.');
    } finally {
      setIsDetecting(false);
    }
  };

  const generateTTS = async (precautionsText: string) => {
    const currentLanguage = languageMapping[language] || languageMapping['en'];
    setIsGeneratingAudio(true);

    try {
      const response = await fetch(
        'https://text-to-speech-api.ml.iit-ropar.truefoundry.cloud/tts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: precautionsText,
            description: `${currentLanguage.speaker}'s voice is monotone yet slightly fast in delivery, with a very close recording that almost has no background noise.`,
          }),
        }
      );

      const result: TTSResponse = await response.json();
      setAudioUrl(result.url);
    } catch (error) {
      console.error('TTS generation error:', error);
      Alert.alert('Error', 'Failed to generate audio. You can still read the precautions.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const playAudio = async () => {
    if (!audioUrl) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      Alert.alert('Error', 'Failed to play audio.');
    }
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resetDetection = () => {
    setSelectedImage(null);
    setDetectionResult(null);
    setAudioUrl(null);
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
    setIsPlaying(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Logo size="medium" variant="horizontal" />
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color="#374151" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <View style={styles.avatarContainer}>
              <User size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.welcomeContent}>
            <Text style={styles.greeting}>{t('dashboard.welcome')}</Text>
            <Text style={styles.username}>{user?.name || 'Farmer'}</Text>
            <Text style={styles.subtitle}>Let's grow together today</Text>
          </View>
          <View style={styles.heroDecoration}>
            <View style={styles.floatingIcon}>
              <Zap size={20} color="#22C55E" />
            </View>
          </View>
        </View>

        {/* Weather Info Placeholder */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherGradient} />
          <View style={styles.weatherHeader}>
            <View style={styles.weatherInfo}>
              <Text style={styles.weatherDay}>{day}</Text>
              <Text style={styles.weatherDate}>{date}</Text>
              {/* <Text style={styles.weatherLocation}>Your Location</Text> */}
            </View>
            <View style={styles.temperatureSection}>
              {/* <View style={styles.weatherIconContainer}>
                <Sun size={28} color="#F59E0B" />
              </View> */}
              <Text style={styles.temperature}>{temperature}</Text>
              {/* <Text style={styles.temperatureLabel}>Sunny</Text> */}
            </View>
          </View>
        </View>

        {/* Disease Detector Section */}
        <View style={styles.diseaseDetectorSection}>
          <View style={styles.sectionGradient} />
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionIcon}>
                <Camera size={20} color="#22C55E" />
              </View>
              <Text style={styles.sectionTitle}>AI Plant Doctor</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Instant disease detection with AI-powered recommendations
            </Text>
          </View>

          {!selectedImage ? (
            <TouchableOpacity style={styles.imagePickerCard} onPress={showImagePickerOptions}>
              <View style={styles.imagePickerIcon}>
                <Camera size={32} color="#22C55E" />
              </View>
              <Text style={styles.imagePickerTitle}>Scan Your Plant</Text>
              <Text style={styles.imagePickerSubtitle}>
                Get instant AI diagnosis in seconds
              </Text>
              <View style={styles.imagePickerButton}>
                <Text style={styles.imagePickerButtonText}>Start Scan</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.detectionContainer}>
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                <TouchableOpacity style={styles.changeImageButton} onPress={showImagePickerOptions}>
                  <ImageIcon size={16} color="#FFFFFF" />
                  <Text style={styles.changeImageText}>Change</Text>
                </TouchableOpacity>
              </View>

              {!detectionResult && (
                <TouchableOpacity 
                  style={[styles.detectButton, isDetecting && styles.detectButtonDisabled]}
                  onPress={detectDisease}
                  disabled={isDetecting}
                >
                  {isDetecting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.detectButtonText}>Detect Disease</Text>
                  )}
                </TouchableOpacity>
              )}

              {detectionResult && (
                <View style={styles.resultContainer}>
                  {detectionResult.result ? (
                    <View style={styles.successResult}>
                      <Text style={styles.resultTitle}>Detection Results</Text>
                      
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Crop:</Text>
                        <Text style={styles.resultValue}>{detectionResult.crop}</Text>
                      </View>
                      
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Disease:</Text>
                        <Text style={styles.resultValue}>{detectionResult.disease}</Text>
                      </View>
                      
                      <View style={styles.precautionsContainer}>
                        <Text style={styles.precautionsTitle}>Precautions & Treatment:</Text>
                        <Text style={styles.precautionsText}>{detectionResult.precautions}</Text>
                      </View>

                      {/* Audio Controls */}
                      <View style={styles.audioControls}>
                        {isGeneratingAudio ? (
                          <View style={styles.audioGenerating}>
                            <ActivityIndicator size="small" color="#22C55E" />
                            <Text style={styles.audioGeneratingText}>Generating audio...</Text>
                          </View>
                        ) : audioUrl ? (
                          <TouchableOpacity 
                            style={styles.playButton}
                            onPress={isPlaying ? pauseAudio : playAudio}
                          >
                            {isPlaying ? (
                              <Pause size={20} color="#FFFFFF" />
                            ) : (
                              <Play size={20} color="#FFFFFF" />
                            )}
                            <Text style={styles.playButtonText}>
                              {isPlaying ? 'Pause' : 'Play Audio'}
                            </Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  ) : (
                    <View style={styles.errorResult}>
                      <Text style={styles.errorTitle}>Detection Failed</Text>
                      <Text style={styles.errorMessage}>{detectionResult.message}</Text>
                    </View>
                  )}

                  <TouchableOpacity style={styles.resetButton} onPress={resetDetection}>
                    <Text style={styles.resetButtonText}>Try Another Image</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  headerLeft: {
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
  headerActions: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  profileButton: {
    padding: 4,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  welcomeContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  username: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  heroDecoration: {
    position: 'relative',
  },
  floatingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  
  // Weather Card Styles
  weatherCard: {
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
  weatherGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    transform: [{ translateX: 40 }, { translateY: -40 }],
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherInfo: {
    flex: 1,
  },
  weatherDay: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  weatherDate: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  weatherLocation: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  temperatureSection: {
    alignItems: 'center',
  },
  weatherIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  temperature: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F59E0B',
    marginBottom: 2,
  },
  temperatureLabel: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Disease Detector Styles
  diseaseDetectorSection: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  sectionGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(34, 197, 94, 0.03)',
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
    fontWeight: '500',
  },
  imagePickerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  imagePickerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#BBF7D0',
  },
  imagePickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  imagePickerSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  imagePickerButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  imagePickerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  detectionContainer: {
    gap: 16,
  },
  selectedImageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  changeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  detectButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  detectButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  detectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    gap: 16,
  },
  successResult: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  errorResult: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#15803D',
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
  },
  resultItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    width: 80,
  },
  resultValue: {
    fontSize: 14,
    color: '#15803D',
    flex: 1,
    fontWeight: '500',
  },
  precautionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#BBF7D0',
  },
  precautionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  precautionsText: {
    fontSize: 14,
    color: '#15803D',
    lineHeight: 20,
  },
  audioControls: {
    alignItems: 'flex-end',
    marginTop: 12,
  },
  audioGenerating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  audioGeneratingText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resetButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});