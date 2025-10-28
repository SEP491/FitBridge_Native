import AsyncStorage from "@react-native-async-storage/async-storage";

// Default fallback avatar URL
const DEFAULT_AVATAR_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNL_ZnOTpXSvhf1UaK7beHey2BX42U6solRA&s";

export const getAvatarUrl = async () => {
  try {
    // Try to get from dedicated avatar storage first
    const storedAvatar = await AsyncStorage.getItem("userAvatar");
    if (storedAvatar) return storedAvatar;

    // Fallback to user object avatar
    const userData = await AsyncStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.avatarUrl) return user.avatarUrl;
    }

    return DEFAULT_AVATAR_URL;
  } catch (error) {
    console.error("Error getting avatar URL:", error);
    return DEFAULT_AVATAR_URL;
  }
};

export const updateAvatar = async (newAvatarUrl) => {
  try {
    if (newAvatarUrl) {
      // Store the new avatar
      await AsyncStorage.setItem("userAvatar", newAvatarUrl);

      // Update user object if it exists
      const userData = await AsyncStorage.getItem("user");
      console.log("Updating user avatar in storage", userData);
      if (userData) {
        const user = JSON.parse(userData);
        user.avatarUrl = newAvatarUrl;
        await AsyncStorage.setItem("user", JSON.stringify(user));
      }
    } else {
      // Clear avatar
      await AsyncStorage.removeItem("userAvatar");

      // Remove from user object
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        delete user.avatarUrl;
        await AsyncStorage.setItem("user", JSON.stringify(user));
      }
    }
  } catch (error) {
    console.error("Error updating avatar:", error);
  }
};

export const clearAvatar = async () => {
  await updateAvatar(null);
};
