import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Slider from '@react-native-community/slider';
import { X } from 'lucide-react-native';

interface ServiceFilterModalProps {
  isVisible: boolean;
  currentRadius: number;
  onClose: () => void;
  onApply: (newRadius: number) => void;
}

export default function ServiceFilterModal({
  isVisible,
  currentRadius,
  onClose,
  onApply,
}: ServiceFilterModalProps) {
  const [selectedRadius, setSelectedRadius] = useState(currentRadius);

  useEffect(() => {
    setSelectedRadius(currentRadius);
  }, [currentRadius]);

  const handleApply = () => {
    onApply(selectedRadius);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Select Search Radius</Text>

          <View style={styles.sliderContainer}>
            <Text style={styles.radiusLabel}>Radius: {selectedRadius} km</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={selectedRadius}
              onValueChange={setSelectedRadius}
              minimumTrackTintColor="#22C55E"
              maximumTrackTintColor="#E5E7EB"
              thumbStyle={styles.sliderThumb}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>1 km</Text>
              <Text style={styles.sliderLabel}>10 km</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

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
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    width: '85%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 32,
    color: '#1F2937',
    textAlign: 'center',
  },
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  radiusLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#22C55E',
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 12,
  },
  sliderThumb: {
    backgroundColor: '#22C55E',
    width: 24,
    height: 24,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 120,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
});