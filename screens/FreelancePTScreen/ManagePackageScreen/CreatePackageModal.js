import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../../hooks/useTranslation';
import freelancePTPackageService from '../../../services/freelancePTPackageService';
import * as ImagePicker from 'expo-image-picker';

const CreatePackageModal = ({ visible, onClose, onPackageCreated }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    durationInDays: '',
    sessionDurationInMinutes: '',
    numOfSessions: '',
    imageUrl: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const scrollViewRef = useRef(null);
  const inputRefs = useRef({});

  const handleInputChange = (field, value) => {
    if (field === 'price') {
      // Remove all non-numeric characters (dots, commas, spaces)
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [field]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          t("managePackage.error"),
          "Permission to access gallery is required!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setFormData(prev => ({ ...prev, imageUrl: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t("managePackage.error"), "Failed to pick image");
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert(t("managePackage.error"), "Package name is required");
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert(t("managePackage.error"), "Valid price is required");
      return false;
    }
    if (!formData.durationInDays || parseInt(formData.durationInDays) <= 0) {
      Alert.alert(t("managePackage.error"), "Valid duration is required");
      return false;
    }
    if (!formData.sessionDurationInMinutes || parseInt(formData.sessionDurationInMinutes) <= 0) {
      Alert.alert(t("managePackage.error"), "Valid session duration is required");
      return false;
    }
    if (!formData.numOfSessions || parseInt(formData.numOfSessions) <= 0) {
      Alert.alert(t("managePackage.error"), "Valid number of sessions is required");
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const packageData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        durationInDays: parseInt(formData.durationInDays),
        sessionDurationInMinutes: parseInt(formData.sessionDurationInMinutes),
        numOfSessions: parseInt(formData.numOfSessions),
        imageUrl: formData.imageUrl || 'string', // Use 'string' as default if no image
      };

      const response = await freelancePTPackageService.createFreelancePTPackage(packageData);

      if (response.status === "200" || response.status === "201") {
        Alert.alert(
          t("managePackage.success"),
          t("managePackage.packageCreated")
        );
        handleClose();
        if (onPackageCreated) {
          onPackageCreated();
        }
      } else {
        throw new Error(response.message || "Failed to create package");
      }
    } catch (error) {
      console.error("Error creating package:", error);
      Alert.alert(
        t("managePackage.error"),
        error.message || t("managePackage.failedToCreate")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      durationInDays: '',
      sessionDurationInMinutes: '',
      numOfSessions: '',
      imageUrl: '',
    });
    setSelectedImage(null);
    onClose();
  };

  const scrollToInput = (inputKey) => {
    if (inputRefs.current[inputKey]) {
      inputRefs.current[inputKey].measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
        },
        () => {}
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("managePackage.createNewPackage")}
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView 
              ref={scrollViewRef}
              style={styles.formContainer} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
            {/* Image Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Package Image</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <Ionicons name="image-outline" size={48} color="#999" />
                    <Text style={styles.imagePickerText}>Tap to select image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Package Name */}
            <View 
              style={styles.inputGroup}
              ref={(ref) => (inputRefs.current['name'] = ref)}
            >
              <Text style={styles.label}>
                {t("managePackage.packageName")} *
              </Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                onFocus={() => scrollToInput('name')}
                placeholder="Enter package name"
                placeholderTextColor="#999"
              />
            </View>

            {/* Description */}
            <View 
              style={styles.inputGroup}
              ref={(ref) => (inputRefs.current['description'] = ref)}
            >
              <Text style={styles.label}>
                {t("managePackage.description")}
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                onFocus={() => scrollToInput('description')}
                placeholder="Enter package description"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Price */}
            <View 
              style={styles.inputGroup}
              ref={(ref) => (inputRefs.current['price'] = ref)}
            >
              <Text style={styles.label}>
                {t("managePackage.price")} (VND) *
              </Text>
              <TextInput
                style={styles.input}
                value={formData.price ? parseInt(formData.price).toLocaleString('vi-VN') : ''}
                onChangeText={(value) => handleInputChange('price', value)}
                onFocus={() => scrollToInput('price')}
                placeholder="Enter price"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            {/* Duration in Days */}
            <View 
              style={styles.inputGroup}
              ref={(ref) => (inputRefs.current['durationInDays'] = ref)}
            >
              <Text style={styles.label}>
                {t("managePackage.duration")} ({t("managePackage.days")}) *
              </Text>
              <TextInput
                style={styles.input}
                value={formData.durationInDays}
                onChangeText={(value) => handleInputChange('durationInDays', value)}
                onFocus={() => scrollToInput('durationInDays')}
                placeholder="Enter duration in days"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            {/* Session Duration */}
            <View 
              style={styles.inputGroup}
              ref={(ref) => (inputRefs.current['sessionDurationInMinutes'] = ref)}
            >
              <Text style={styles.label}>
                {t("managePackage.sessionDuration")} ({t("managePackage.minutes")}) *
              </Text>
              <TextInput
                style={styles.input}
                value={formData.sessionDurationInMinutes}
                onChangeText={(value) => handleInputChange('sessionDurationInMinutes', value)}
                onFocus={() => scrollToInput('sessionDurationInMinutes')}
                placeholder="Enter session duration"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            {/* Number of Sessions */}
            <View 
              style={styles.inputGroup}
              ref={(ref) => (inputRefs.current['numOfSessions'] = ref)}
            >
              <Text style={styles.label}>
                {t("managePackage.numberOfSessions")} *
              </Text>
              <TextInput
                style={styles.input}
                value={formData.numOfSessions}
                onChangeText={(value) => handleInputChange('numOfSessions', value)}
                onFocus={() => scrollToInput('numOfSessions')}
                placeholder="Enter number of sessions"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.createButton]}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  imagePicker: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    overflow: 'hidden',
    height: 180,
  },
  imagePickerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  imagePickerText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  createButton: {
    backgroundColor: '#ED2A46',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default CreatePackageModal;