import uploadImageService from '../services/uploadImageService';
import UserGoalService from '../services/user-goalService';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Upload image and get URL
 * @param {string} imageUri - Local image URI
 * @returns {Promise<string>} - Image URL from server
 */
const uploadImage = async (imageUri) => {
  if (!imageUri) {
    return null;
  }

  try {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type,
    });

    const uploadResponse = await uploadImageService.uploadImage(formData);
    
    if (uploadResponse?.status === '200' || uploadResponse?.status === 200) {
      return uploadResponse?.data || imageUri;
    }
    
    return imageUri;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Create user goal with image upload
 * @param {object} goalData - Goal form data
 * @returns {Promise<object>} - Created goal response
 */
const createUserGoalWithImage = async (goalData) => {
  try {
    let imageUrl = null;

    // Upload image if provided
    if (goalData.imageUrl && goalData.imageUrl.includes('file://')) {
      imageUrl = await uploadImage(goalData.imageUrl);
    } else if (goalData.imageUrl) {
      imageUrl = goalData.imageUrl;
    }

    // Prepare goal data for submission
    const submissionData = {
      customerPurchasedId: goalData.customerPurchasedId,
      // Start measurements
      startHeight: parseFloat(goalData.startHeight) || 0,
      startWeight: parseFloat(goalData.startWeight) || 0,
      startBiceps: parseFloat(goalData.startBiceps) || 0,
      startForeArm: parseFloat(goalData.startForeArm) || 0,
      startChest: parseFloat(goalData.startChest) || 0,
      startBack: parseFloat(goalData.startBack) || 0,
      startShoulder: parseFloat(goalData.startShoulder) || 0,
      startWaist: parseFloat(goalData.startWaist) || 0,
      startHip: parseFloat(goalData.startHip) || 0,
      startThigh: parseFloat(goalData.startThigh) || 0,
      startCalf: parseFloat(goalData.startCalf) || 0,
      startGlutes: parseFloat(goalData.startGlutes) || 0,
      // Target measurements
      targetHeight: parseFloat(goalData.targetHeight) || 0,
      targetWeight: parseFloat(goalData.targetWeight) || 0,
      targetBiceps: parseFloat(goalData.targetBiceps) || 0,
      targetForeArm: parseFloat(goalData.targetForeArm) || 0,
      targetChest: parseFloat(goalData.targetChest) || 0,
      targetBack: parseFloat(goalData.targetBack) || 0,
      targetShoulder: parseFloat(goalData.targetShoulder) || 0,
      targetWaist: parseFloat(goalData.targetWaist) || 0,
      targetHip: parseFloat(goalData.targetHip) || 0,
      targetThigh: parseFloat(goalData.targetThigh) || 0,
      targetCalf: parseFloat(goalData.targetCalf) || 0,
      targetGlutes: parseFloat(goalData.targetGlutes) || 0,
      // Image
      imageUrl: imageUrl || null,
    };

    // Create goal
    const response = await UserGoalService.createUserGoals(submissionData);

    if (response?.status === '200' || response?.status === 200) {
      return response.data;
    }

    return response;
  } catch (error) {
    console.error('Error creating user goal:', error);
    throw error;
  }
};

export { uploadImage, createUserGoalWithImage };
