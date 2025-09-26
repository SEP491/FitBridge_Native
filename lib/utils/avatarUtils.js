import AsyncStorage from "@react-native-async-storage/async-storage";

// Default fallback avatar URL
const DEFAULT_AVATAR_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNL_ZnOTpXSvhf1UaK7beHey2BX42U6solRA&s";

/**
 * Get the user's avatar URL with fallback
 * @returns {Promise<string>} Avatar URL or default fallback
 */
export const getAvatarUrl = async () => {
  try {
    // Try to get from dedicated avatar storage first
    const storedAvatar = await AsyncStorage.getItem("userAvatar");
    if (storedAvatar) return storedAvatar;

    // Fallback to user object avatar
    const userData = await AsyncStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.avatar || user.avatarUrl) return user.avatar || user.avatarUrl;
    }

    return DEFAULT_AVATAR_URL;
  } catch (error) {
    console.error("Error getting avatar URL:", error);
    return DEFAULT_AVATAR_URL;
  }
};

/**
 * Update user's avatar URL in storage
 * @param {string|null} newAvatarUrl - New avatar URL or null to clear
 */
export const updateAvatar = async (newAvatarUrl) => {
  try {
    if (newAvatarUrl) {
      // Store the new avatar
      await AsyncStorage.setItem("userAvatar", newAvatarUrl);

      // Update user object if it exists
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        user.avatar = newAvatarUrl;
        await AsyncStorage.setItem("user", JSON.stringify(user));
      }
    } else {
      // Clear avatar
      await AsyncStorage.removeItem("userAvatar");

      // Remove from user object
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        delete user.avatar;
        delete user.avatarUrl;
        await AsyncStorage.setItem("user", JSON.stringify(user));
      }
    }
  } catch (error) {
    console.error("Error updating avatar:", error);
  }
};

/**
 * Clear user's avatar
 */
export const clearAvatar = async () => {
  await updateAvatar(null);
};

/**
 * Sync avatar from user data (useful when fetching profile from API)
 * @param {Object} userData - User data from API
 */
export const syncAvatarFromUserData = async (userData) => {
  if (userData?.avatarUrl || userData?.avatar) {
    const currentAvatar = await AsyncStorage.getItem("userAvatar");
    const newAvatar = userData.avatarUrl || userData.avatar;

    if (newAvatar !== currentAvatar) {
      await updateAvatar(newAvatar);
    }
  }
};
