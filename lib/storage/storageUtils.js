/**
 * Storage utility functions for AsyncStorage operations
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Store data in AsyncStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
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

/**
 * Retrieve data from AsyncStorage
 * @param {string} key - Storage key
 * @returns {Promise<*>} Parsed data or null if not found/error
 */
export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error retrieving data for key ${key}:`, error);
    return null;
  }
};

/**
 * Remove data from AsyncStorage
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    return false;
  }
};

/**
 * Remove multiple keys from AsyncStorage
 * @param {string[]} keys - Array of storage keys
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const removeMultipleData = async (keys) => {
  try {
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error(`Error removing multiple data:`, error);
    return false;
  }
};

/**
 * Clear all data from AsyncStorage
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error(`Error clearing all data:`, error);
    return false;
  }
};

/**
 * Get all keys from AsyncStorage
 * @returns {Promise<string[]>} Array of storage keys or empty array on error
 */
export const getAllKeys = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys;
  } catch (error) {
    console.error(`Error getting all keys:`, error);
    return [];
  }
};

/**
 * Check if key exists in AsyncStorage
 * @param {string} key - Storage key to check
 * @returns {Promise<boolean>} True if key exists, false otherwise
 */
export const keyExists = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (error) {
    console.error(`Error checking key existence for ${key}:`, error);
    return false;
  }
};

/**
 * Store user data (commonly used pattern in the app)
 * @param {Object} userData - User data object
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const storeUserData = async (userData) => {
  return await storeData("user", userData);
};

/**
 * Get user data (commonly used pattern in the app)
 * @returns {Promise<Object|null>} User data object or null
 */
export const getUserData = async () => {
  return await getData("user");
};

/**
 * Store auth token (commonly used pattern in the app)
 * @param {string} token - Auth token
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const storeAuthToken = async (token) => {
  return await storeData("token", token);
};

/**
 * Get auth token (commonly used pattern in the app)
 * @returns {Promise<string|null>} Auth token or null
 */
export const getAuthToken = async () => {
  return await getData("token");
};

/**
 * Store location data (commonly used pattern in the app)
 * @param {Object} locationData - Location data object
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const storeLocationData = async (locationData) => {
  return await storeData("userLocation", locationData);
};

/**
 * Get location data (commonly used pattern in the app)
 * @returns {Promise<Object|null>} Location data object or null
 */
export const getLocationData = async () => {
  return await getData("userLocation");
};

/**
 * Logout user by clearing auth-related data
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const logoutUser = async () => {
  return await removeMultipleData(["token", "user", "userAvatar"]);
};
