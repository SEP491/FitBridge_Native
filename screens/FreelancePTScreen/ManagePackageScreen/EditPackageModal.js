import React, { useState, useEffect, useRef } from 'react';
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

const EditPackageModal = ({ visible, onClose, packageData, onPackageUpdated }) => {
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

  useEffect(() => {
    if (packageData && visible) {
      setFormData({
        name: packageData.name || '',
        description: packageData.description || '',
        price: packageData.price?.toString() || '',
        durationInDays: packageData.durationInDays?.toString() || '',
        sessionDurationInMinutes: packageData.sessionDurationInMinutes?.toString() || '',
        numOfSessions: packageData.numOfSessions?.toString() || '',
        imageUrl: packageData.imageUrl || '',
      });
      if (packageData.imageUrl && packageData.imageUrl !== 'string') {
        setSelectedImage(packageData.imageUrl);
      }
    }
  }, [packageData, visible]);

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

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const updatedData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        durationInDays: parseInt(formData.durationInDays),
        sessionDurationInMinutes: parseInt(formData.sessionDurationInMinutes),
        numOfSessions: parseInt(formData.numOfSessions),
        imageUrl: formData.imageUrl || 'string',
      };

      const response = await freelancePTPackageService.updateFreelancePTPackage(
        packageData.id,
        updatedData
      );

      if (response.status === "200") {
        Alert.alert(
          t("managePackage.success"),
          t("managePackage.packageUpdated")
        );
        handleClose();
        if (onPackageUpdated) {
          onPackageUpdated();
        }
      } else {
        throw new Error(response.message || "Failed to update package");
      }
    } catch (error) {
      console.error("Error updating package:", error);
      Alert.alert(
        t("managePackage.error"),
        error.message || t("managePackage.failedToUpdate")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Package",
      "Are you sure you want to delete this package? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await freelancePTPackageService.deleteFreelancePTPackage(
                packageData.id
              );

              if (response.status === "200") {
                Alert.alert(
                  t("managePackage.success"),
                  t("managePackage.packageDeleted")
                );
                handleClose();
                if (onPackageUpdated) {
                  onPackageUpdated();
                }
              } else {
                throw new Error(response.message || "Failed to delete package");
              }
            } catch (error) {
              console.error("Error deleting package:", error);
              Alert.alert(
                t("managePackage.error"),
                error.message || t("managePackage.failedToDelete")
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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
              <Text style={styles.modalTitle}>Edit Package</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity 
                  onPress={handleDelete} 
                  style={styles.deleteButton}
                  disabled={loading}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
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
              style={[styles.button, styles.updateButton]}
              onPress={handleUpdate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.updateButtonText}>Update</Text>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
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
  updateButton: {
    backgroundColor: '#ED2A46',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default EditPackageModal;