import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../../../../lib/userGoalHelper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Muscle group images mapping
const muscleGroupImages = {
  Biceps: require('../../../../assets/images/bodyparts/biceps.png'),
  Calf: require('../../../../assets/images/bodyparts/calf.png'),
  Chest: require('../../../../assets/images/bodyparts/chest.png'),
  ForeArm: require('../../../../assets/images/bodyparts/foreArm.png'),
  Hip: require('../../../../assets/images/bodyparts/hip.png'),
  Shoulder: require('../../../../assets/images/bodyparts/shoulder.png'),
  Thigh: require('../../../../assets/images/bodyparts/thigh.png'),
  Waist: require('../../../../assets/images/bodyparts/waist.png'),
  Back: require('../../../../assets/images/bodyparts/back.png'),
  Triceps: require('../../../../assets/images/bodyparts/triceps.png'),
  Glutes: require('../../../../assets/images/bodyparts/glutes.png'),
  FullBody: require('../../../../assets/images/bodyparts/fullbody.png'),
};

export const CreateUserGoalForm = ({
  visible,
  onClose,
  onSubmit,
  customerPurchasedId,
  t,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    customerPurchasedId: customerPurchasedId,
    // Start values
    startHeight: '',
    startWeight: '',
    startBiceps: '',
    startForeArm: '',
    startChest: '',
    startBack: '',
    startShoulder: '',
    startWaist: '',
    startHip: '',
    startThigh: '',
    startCalf: '',
    startGlutes: '',
    // Target values
    targetHeight: '',
    targetWeight: '',
    targetBiceps: '',
    targetForeArm: '',
    targetChest: '',
    targetBack: '',
    targetShoulder: '',
    targetWaist: '',
    targetHip: '',
    targetThigh: '',
    targetCalf: '',
    targetGlutes: '',
    // Image
    imageUrl: null,
  });

  const [imageUri, setImageUri] = useState(null);
  const [activeSection, setActiveSection] = useState('measurements'); // 'measurements', 'targets', 'photo'


    const resetForm = () => {
    setFormData({
      customerPurchasedId: customerPurchasedId,
      startHeight: '',
      startWeight: '',
      startBiceps: '',
      startForeArm: '',
      startChest: '',
      startBack: '',
      startShoulder: '',
      startWaist: '',
      startHip: '',
      startThigh: '',
      startCalf: '',
      startGlutes: '',
      targetHeight: '',
      targetWeight: '',
      targetBiceps: '',
      targetForeArm: '',
      targetChest: '',
      targetBack: '',
      targetShoulder: '',
      targetWaist: '',
      targetHip: '',
      targetThigh: '',
      targetCalf: '',
      targetGlutes: '',
      imageUrl: null,
    });
    setImageUri(null);
    setActiveSection('measurements');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const muscleGroups = [
    { key: 'Height', label: t('userGoals.height', 'Height'), unit: 'cm' },
    { key: 'Weight', label: t('userGoals.weight', 'Weight'), unit: 'kg' },
    { key: 'Biceps', label: t('muscleGroups.biceps', 'Biceps'), unit: 'cm' },
    { key: 'ForeArm', label: t('muscleGroups.foreArm', 'Forearm'), unit: 'cm' },
    { key: 'Chest', label: t('muscleGroups.chest', 'Chest'), unit: 'cm' },
    { key: 'Back', label: t('muscleGroups.back', 'Back'), unit: 'cm' },
    { key: 'Shoulder', label: t('muscleGroups.shoulder', 'Shoulder'), unit: 'cm' },
    { key: 'Waist', label: t('muscleGroups.waist', 'Waist'), unit: 'cm' },
    { key: 'Hip', label: t('muscleGroups.hip', 'Hip'), unit: 'cm' },
    { key: 'Thigh', label: t('muscleGroups.thigh', 'Thigh'), unit: 'cm' },
    { key: 'Calf', label: t('muscleGroups.calf', 'Calf'), unit: 'cm' },
    { key: 'Glutes', label: t('muscleGroups.glutes', 'Glutes'), unit: 'cm' },
  ];

 const handleOnChangeText = (field) => (value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInputBlur = (field, value) => {
    // Sanitize only when user finishes typing (on blur)
    let sanitizedValue = value;
    
    // Remove any non-numeric characters except decimal point
    sanitizedValue = sanitizedValue.replace(/[^0-9.]/g, '');
    
    // Handle multiple decimal points - keep only the first one
    const parts = sanitizedValue.split('.');
    if (parts.length > 2) {
      sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit decimal places to 2
    if (parts.length === 2 && parts[1].length > 2) {
      sanitizedValue = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    // Prevent leading zeros (except for "0" or "0." cases)
    if (sanitizedValue.length > 1 && sanitizedValue[0] === '0' && sanitizedValue[1] !== '.') {
      sanitizedValue = sanitizedValue.substring(1);
    }
    
    // Update with sanitized value
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue,
    }));
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.cancelled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        try {
          const response = await uploadImage(result.assets[0].uri);
          setFormData(prev => ({
            ...prev,
            imageUrl: response.data,
          }));
        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert(
            t('common.error', 'Error'),
            t('userGoals.imageUploadError', 'Failed to upload image')
          );
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('userGoals.imagePicKError', 'Failed to pick image')
      );
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.cancelled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setFormData(prev => ({
          ...prev,
          imageUrl: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('userGoals.cameraError', 'Failed to take photo')
      );
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.startHeight || !formData.startWeight) {
      Alert.alert(
        t('common.validation', 'Validation'),
        t('userGoals.fillRequiredFields', 'Please fill in Height and Weight in Current Measurements')
      );
      return;
    }

    if (!formData.targetHeight || !formData.targetWeight) {
      Alert.alert(
        t('common.validation', 'Validation'),
        t('userGoals.fillTargetFields', 'Please fill in Height and Weight in Target Measurements')
      );
      return;
    }

    // Validate numeric values
    const numericFields = [
      'startHeight', 'startWeight', 'targetHeight', 'targetWeight'
    ];
    
    for (const field of numericFields) {
      const value = parseFloat(formData[field]);
      if (isNaN(value) || value <= 0) {
        Alert.alert(
          t('common.validation', 'Validation'),
          t('userGoals.invalidValue', 'Please enter valid positive numbers for all measurements')
        );
        return;
      }
    }

    // Prepare data for submission - convert strings to numbers
    const submissionData = {
      ...formData,
      startHeight: parseFloat(formData.startHeight) || 0,
      startWeight: parseFloat(formData.startWeight) || 0,
      startBiceps: formData.startBiceps ? parseFloat(formData.startBiceps) : null,
      startForeArm: formData.startForeArm ? parseFloat(formData.startForeArm) : null,
      startChest: formData.startChest ? parseFloat(formData.startChest) : null,
      startBack: formData.startBack ? parseFloat(formData.startBack) : null,
      startShoulder: formData.startShoulder ? parseFloat(formData.startShoulder) : null,
      startWaist: formData.startWaist ? parseFloat(formData.startWaist) : null,
      startHip: formData.startHip ? parseFloat(formData.startHip) : null,
      startThigh: formData.startThigh ? parseFloat(formData.startThigh) : null,
      startCalf: formData.startCalf ? parseFloat(formData.startCalf) : null,
      startGlutes: formData.startGlutes ? parseFloat(formData.startGlutes) : null,
      targetHeight: parseFloat(formData.targetHeight) || 0,
      targetWeight: parseFloat(formData.targetWeight) || 0,
      targetBiceps: formData.targetBiceps ? parseFloat(formData.targetBiceps) : null,
      targetForeArm: formData.targetForeArm ? parseFloat(formData.targetForeArm) : null,
      targetChest: formData.targetChest ? parseFloat(formData.targetChest) : null,
      targetBack: formData.targetBack ? parseFloat(formData.targetBack) : null,
      targetShoulder: formData.targetShoulder ? parseFloat(formData.targetShoulder) : null,
      targetWaist: formData.targetWaist ? parseFloat(formData.targetWaist) : null,
      targetHip: formData.targetHip ? parseFloat(formData.targetHip) : null,
      targetThigh: formData.targetThigh ? parseFloat(formData.targetThigh) : null,
      targetCalf: formData.targetCalf ? parseFloat(formData.targetCalf) : null,
      targetGlutes: formData.targetGlutes ? parseFloat(formData.targetGlutes) : null,
    };

    onSubmit(submissionData);
  };

  const InputField = ({ label, value = '', onChange, onBlur, unit }) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    return (
      <View style={styles.inputFieldContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={[
          styles.inputWithUnit,
          isFocused && styles.inputWithUnitFocused
        ]}>
          <TextInput
            style={styles.textInput}
            placeholder="0"
            value={String(value)}
            onChangeText={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              if (onBlur) onBlur();
            }}
            keyboardType="decimal-pad"
            placeholderTextColor="#ccc"
            maxLength={8}
            editable={true}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="done"
            selectTextOnFocus={true}
          />
          <Text style={styles.unitText}>{unit}</Text>
        </View>
      </View>
    );
  };

  const InputFieldWithImage = ({ muscleKey, label, value = '', onChange, onBlur, unit }) => {
    const muscleImage = muscleGroupImages[muscleKey];
    const [isFocused, setIsFocused] = React.useState(false);
    
    return (
      <View style={[
        styles.inputFieldWithImageContainer,
        isFocused && styles.inputFieldWithImageContainerFocused
      ]}>
        <View style={styles.muscleImageContainer}>
          {muscleImage ? (
            <Image 
              source={muscleImage}
              style={styles.muscleImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.muscleImagePlaceholder}>
              <Ionicons name="image-outline" size={24} color="#ccc" />
            </View>
          )}
        </View>
        <View style={styles.inputFieldWrapper}>
          <Text style={styles.inputLabelWithImage}>{label}</Text>
          <View style={[
            styles.inputWithUnit,
            isFocused && styles.inputWithUnitFocused
          ]}>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                value={value}
                onChangeText={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setIsFocused(false);
                  if (onBlur) onBlur();
                }}
                keyboardType="decimal-pad"
                placeholderTextColor="#ccc"
                maxLength={8}
                editable={true}
                autoCorrect={false}
                autoCapitalize="none"
                selectTextOnFocus={true}
              />
            <Text style={styles.unitText}>{unit}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <>
<View style={styles.coverLayer}>

    </View>
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('userGoals.createGoal', 'Create Goal')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      
        {/* Section Tabs */}
        <View style={styles.sectionTabs}>
          <TouchableOpacity
            style={[
              styles.sectionTab,
              activeSection === 'measurements' && styles.activeSectionTab,
            ]}
            onPress={() => setActiveSection('measurements')}
          >
            <Text
              style={[
                styles.sectionTabText,
                activeSection === 'measurements' && styles.activeSectionTabText,
              ]}
            >
              {t('userGoals.currentMeasurements', 'Current')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sectionTab,
              activeSection === 'targets' && styles.activeSectionTab,
            ]}
            onPress={() => setActiveSection('targets')}
          >
            <Text
              style={[
                styles.sectionTabText,
                activeSection === 'targets' && styles.activeSectionTabText,
              ]}
            >
              {t('userGoals.targetMeasurements', 'Target')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sectionTab,
              activeSection === 'photo' && styles.activeSectionTab,
            ]}
            onPress={() => setActiveSection('photo')}
          >
            <Text
              style={[
                styles.sectionTabText,
                activeSection === 'photo' && styles.activeSectionTabText,
              ]}
            >
              {t('userGoals.photo', 'Photo')}
            </Text>
          </TouchableOpacity>
        </View>
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Measurements Section */}
        {activeSection === 'measurements' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('userGoals.currentMeasurements', 'Current Measurements')}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t('userGoals.enterCurrentValues', 'Enter your current body measurements')}
            </Text>

            {/* Height and Weight Row */}
            <View style={styles.heightWeightRow}>
              <InputField
                label={muscleGroups[0].label}
                value={formData.startHeight}
                onChange={handleOnChangeText('startHeight')}
                onBlur={() => handleInputBlur('startHeight', formData.startHeight)}
                unit={muscleGroups[0].unit}
              />
              <InputField
                label={muscleGroups[1].label}
                value={formData.startWeight}
                onChange={handleOnChangeText('startWeight')}
                onBlur={() => handleInputBlur('startWeight', formData.startWeight)}
                unit={muscleGroups[1].unit}
              />
            </View>

            {/* Muscle Groups with Images */}
            <View style={styles.formGridWithImages}>
              {muscleGroups.slice(2).map(group => (
                <InputFieldWithImage
                  key={`start${group.key}`}
                  muscleKey={group.key}
                  label={group.label}
                  value={formData[`start${group.key}`]}
                  onChange={handleOnChangeText(`start${group.key}`)}
                  onBlur={() => handleInputBlur(`start${group.key}`, formData[`start${group.key}`])}
                  unit={group.unit}
                />
              ))}
            </View>
          </View>
        )}

        {/* Target Measurements Section */}
        {activeSection === 'targets' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('userGoals.targetMeasurements', 'Target Measurements')}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t('userGoals.enterTargetValues', 'Enter your target body measurements')}
            </Text>

            {/* Height and Weight Row */}
            <View style={styles.heightWeightRow}>
              <InputField
                label={muscleGroups[0].label}
                value={formData.targetHeight}
                onChange={handleOnChangeText('targetHeight')}
                onBlur={() => handleInputBlur('targetHeight', formData.targetHeight)}
                unit={muscleGroups[0].unit}
              />
              <InputField
                label={muscleGroups[1].label}
                value={formData.targetWeight}
                onChange={handleOnChangeText('targetWeight')}
                onBlur={() => handleInputBlur('targetWeight', formData.targetWeight)}
                unit={muscleGroups[1].unit}
              />
            </View>

            {/* Muscle Groups with Images */}
            <View style={styles.formGridWithImages}>
              {muscleGroups.slice(2).map(group => (
                <InputFieldWithImage
                  key={`target${group.key}`}
                  muscleKey={group.key}
                  label={group.label}
                  value={formData[`target${group.key}`]}
                  onChange={handleOnChangeText(`target${group.key}`)}
                  onBlur={() => handleInputBlur(`target${group.key}`, formData[`target${group.key}`])}
                  unit={group.unit}
                />
              ))}
            </View>
          </View>
        )}

        {/* Photo Section */}
        {activeSection === 'photo' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('userGoals.photo', 'Body Photo')}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t('userGoals.photoDescription', 'Take or upload a photo of your body for comparison')}
            </Text>

            {/* Photo Preview */}
            {imageUri ? (
              <View style={styles.photoPreviewContainer}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.photoPreview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => {
                    setImageUri(null);
                    setFormData(prev => ({ ...prev, imageUrl: null }));
                  }}
                >
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="image-outline" size={48} color="#ED2A46" />
                <Text style={styles.placeholderText}>
                  {t('userGoals.noPhotoSelected', 'No photo selected')}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.photoButtonsContainer}>
              <TouchableOpacity
                style={styles.photoActionButton}
                onPress={takePhoto}
              >
                <Ionicons name="camera" size={20} color="#ED2A46" />
                <Text style={styles.photoActionButtonText}>
                  {t('userGoals.takePhoto', 'Take Photo')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoActionButton}
                onPress={pickImage}
              >
                <Ionicons name="image" size={20} color="#ED2A46" />
                <Text style={styles.photoActionButtonText}>
                  {t('userGoals.pickPhoto', 'Pick Photo')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleClose}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>
            {t('common.cancel', 'Cancel')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>
                {t('userGoals.createGoal', 'Create Goal')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
    </>
    
  );
};

const SCREEN_HEIGHT = Dimensions.get('window').height;  
const styles = StyleSheet.create({
    coverLayer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
    },
  container: {
    position: 'absolute',
    top: SCREEN_HEIGHT - 900,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 1000,
    maxHeight: SCREEN_HEIGHT,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginHorizontal: 10,
    paddingHorizontal: 10,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
    maxHeight: SCREEN_HEIGHT - 450, // Adjust based on header and footer height
  },
  sectionTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 4,
    marginTop: 8,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeSectionTab: {
    backgroundColor: '#ED2A46',
  },
  sectionTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeSectionTabText: {
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formGridWithImages: {
    gap: 12,
  },
  inputFieldContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputFieldWithImageContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  inputFieldWithImageContainerFocused: {
    borderColor: '#ED2A46',
    backgroundColor: '#FFF5F7',
  },
  muscleImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  muscleImage: {
    width: 50,
    height: 50,
  },
  muscleImagePlaceholder: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputFieldWrapper: {
    flex: 1,
  },
  heightWeightRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputLabelWithImage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  inputWithUnitFocused: {
    borderColor: '#ED2A46',
    backgroundColor: '#fff',
    borderWidth: 2,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  unitText: {
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  photoPreviewContainer: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  photoPreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ED2A46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    height: 200,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ED2A46',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFF0F2',
  },
  placeholderText: {
    fontSize: 14,
    color: '#ED2A46',
    marginTop: 8,
    fontWeight: '600',
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  photoActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#ED2A46',
    borderRadius: 8,
  },
  photoActionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ED2A46',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ED2A46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#ED2A46',
    fontWeight: '600',
    fontSize: 14,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ED2A46',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
