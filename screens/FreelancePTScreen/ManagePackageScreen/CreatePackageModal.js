import React, { useState, useRef, useEffect } from 'react';
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
  Linking,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../../hooks/useTranslation';
import freelancePTPackageService from '../../../services/freelancePTPackageService';
import uploadImageService from '../../../services/uploadImageService';
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
    isDisplayed: true,
  });
  const [selectedImage, setSelectedImage] = useState(null); // Local URI for preview
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null); // API URL after upload
  const [uploadingImage, setUploadingImage] = useState(false);
  const scrollViewRef = useRef(null);
  const inputRefs = useRef({});

  // Clear images when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedImage(null);
      setUploadedImageUrl(null);
    }
  }, [visible]);

  const handleInputChange = (field, value) => {
    if (field === 'price') {
      // Remove all non-numeric characters (dots, commas, spaces)
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [field]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const uploadImage = async (imageUri) => {
    try {
      setUploadingImage(true);
      
      // Create FormData for image upload
      const formDataImg = new FormData();
      
      // Extract filename from URI
      const uriParts = imageUri.split('/');
      let fileName = uriParts[uriParts.length - 1];
      
      // If filename doesn't have an extension, add one
      if (!fileName.includes('.')) {
        fileName = `image_${Date.now()}.jpg`;
      }
      
      // Determine file type from filename or default to jpeg
      const fileExtension = fileName.split('.').pop().toLowerCase();
      let mimeType = 'image/jpeg'; // default
      
      if (fileExtension === 'png') {
        mimeType = 'image/png';
      } else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
        mimeType = 'image/jpeg';
      } else if (fileExtension === 'gif') {
        mimeType = 'image/gif';
      } else if (fileExtension === 'webp') {
        mimeType = 'image/webp';
      }
      
      // For React Native, we need to structure the file object properly
      formDataImg.append('file', {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        name: fileName,
        type: mimeType,
      });

      const uploadResponse = await uploadImageService.uploadImage(formDataImg);
      
      if (uploadResponse.status === "200" && uploadResponse.data) {
        setUploadedImageUrl(uploadResponse.data);
        setSelectedImage(imageUri); // Keep for preview
        Alert.alert(
          t("managePackage.success"),
          "Image uploaded successfully!"
        );
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert(
        t("managePackage.error"),
        "Failed to upload image. Please try again.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: () => uploadImage(imageUri) }
        ]
      );
      setSelectedImage(null);
      setUploadedImageUrl(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          t("managePackage.error"),
          "Permission to access gallery is required to upload an image. Please enable it in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Open Settings", 
              onPress: () => {
                // For iOS and Android, you can use Linking to open settings
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            }
          ]
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
        // Upload image immediately after selection
        await uploadImage(result.assets[0].uri);
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
    if (parseInt(formData.sessionDurationInMinutes) < 60) {
      Alert.alert(t("managePackage.error"), "Session duration must be greater than 60 minutes");
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
      
      // Use uploaded image URL or default
      const imageUrl = uploadedImageUrl || 'string';
      
      const packageData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        durationInDays: parseInt(formData.durationInDays),
        sessionDurationInMinutes: parseInt(formData.sessionDurationInMinutes),
        numOfSessions: parseInt(formData.numOfSessions),
        imageUrl: imageUrl,
        isDisplayed: formData.isDisplayed,
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
      isDisplayed: true,
    });
    setSelectedImage(null);
    setUploadedImageUrl(null);
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
              <TouchableOpacity 
                style={styles.imagePicker} 
                onPress={pickImage}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <View style={styles.imagePickerPlaceholder}>
                    <ActivityIndicator size="large" color="#ED2A46" />
                    <Text style={[styles.imagePickerText, { marginTop: 12 }]}>Uploading image...</Text>
                  </View>
                ) : selectedImage && uploadedImageUrl ? (
                  <View style={{ flex: 1 }}>
                    <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                    <View style={styles.imageSuccessBadge}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                      <Text style={styles.imageSuccessText}>Uploaded</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <Ionicons name="image-outline" size={48} color="#999" />
                    <Text style={styles.imagePickerText}>Tap to select and upload image</Text>
                  </View>
                )}
              </TouchableOpacity>
              {uploadedImageUrl && (
                <TouchableOpacity 
                  style={styles.changeImageButton}
                  onPress={pickImage}
                  disabled={uploadingImage}
                >
                  <Ionicons name="refresh" size={16} color="#ED2A46" />
                  <Text style={styles.changeImageText}>Change Image</Text>
                </TouchableOpacity>
              )}
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

            {/* Expiration in Days */}
            <View 
              style={styles.inputGroup}
              ref={(ref) => (inputRefs.current['durationInDays'] = ref)}
            >
              <Text style={styles.label}>
                {t("managePackage.expiration")} ({t("managePackage.days")}) *
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

            {/* Display Package Toggle */}
            <View style={styles.inputGroup}>
              <View style={styles.switchContainer}>
                <View style={styles.switchLabelContainer}>
                  <Ionicons name="eye-outline" size={20} color="#333" />
                  <Text style={styles.switchLabel}>
                    {t("managePackage.displayPackage") || "Display Package"}
                  </Text>
                </View>
                <Switch
                  value={formData.isDisplayed}
                  onValueChange={(value) => handleInputChange('isDisplayed', value)}
                  trackColor={{ false: '#e5e7eb', true: '#ED2A46' }}
                  thumbColor={formData.isDisplayed ? '#fff' : '#f4f3f4'}
                />
              </View>
              <Text style={styles.switchHelperText}>
                {t("managePackage.displayPackageHelper") || "When enabled, this package will be visible to customers"}
              </Text>
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
  imageSuccessBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  imageSuccessText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
    gap: 6,
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ED2A46',
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  switchHelperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 28,
  },
});

export default CreatePackageModal;