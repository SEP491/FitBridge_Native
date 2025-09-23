import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
    return false;
  }
};

export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error retrieving data for key ${key}:`, error);
    return null;
  }
};

export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    return false;
  }
};

export const removeMultipleData = async (keys) => {
  try {
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error(`Error removing multiple data:`, error);
    return false;
  }
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error(`Error clearing all data:`, error);
    return false;
  }
};

export const getAllKeys = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys;
  } catch (error) {
    console.error(`Error getting all keys:`, error);
    return [];
  }
};

export const keyExists = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (error) {
    console.error(`Error checking key existence for ${key}:`, error);
    return false;
  }
};

export const storeUserData = async (userData) => {
  return await storeData("user", userData);
};

export const getUserData = async () => {
  return await getData("user");
};

export const storeAuthToken = async (token) => {
  return await storeData("token", token);
};

export const getAuthToken = async () => {
  return await getData("token");
};

export const storeLocationData = async (locationData) => {
  return await storeData("userLocation", locationData);
};

export const getLocationData = async () => {
  return await getData("userLocation");
};

export const logoutUser = async () => {
  return await removeMultipleData(["token", "user", "userAvatar"]);
};

const RECENT_SEARCHES_KEY = "recentSearches";
const MAX_RECENT_SEARCHES = 10;

export const getRecentSearches = async () => {
  try {
    const searches = await getData(RECENT_SEARCHES_KEY);
    return searches || [];
  } catch (error) {
    console.error("Error getting recent searches:", error);
    return [];
  }
};

export const addRecentSearch = async (keyword) => {
  try {
    if (!keyword || typeof keyword !== "string" || !keyword.trim()) {
      return false;
    }

    const trimmedKeyword = keyword.trim();
    let recentSearches = await getRecentSearches();

    // Remove existing occurrence if present (to move to front)
    recentSearches = recentSearches.filter(
      (search) => search.toLowerCase() !== trimmedKeyword.toLowerCase()
    );

    // Add to beginning
    recentSearches.unshift(trimmedKeyword);

    // Limit to maximum number
    if (recentSearches.length > MAX_RECENT_SEARCHES) {
      recentSearches = recentSearches.slice(0, MAX_RECENT_SEARCHES);
    }

    return await storeData(RECENT_SEARCHES_KEY, recentSearches);
  } catch (error) {
    console.error("Error adding recent search:", error);
    return false;
  }
};

export const removeRecentSearch = async (keyword) => {
  try {
    if (!keyword || typeof keyword !== "string") {
      return false;
    }

    const recentSearches = await getRecentSearches();
    const updatedSearches = recentSearches.filter(
      (search) => search.toLowerCase() !== keyword.toLowerCase()
    );

    return await storeData(RECENT_SEARCHES_KEY, updatedSearches);
  } catch (error) {
    console.error("Error removing recent search:", error);
    return false;
  }
};

export const clearRecentSearches = async () => {
  try {
    return await removeData(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.error("Error clearing recent searches:", error);
    return false;
  }
};
