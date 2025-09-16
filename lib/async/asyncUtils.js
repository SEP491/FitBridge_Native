/**
 * Async utility functions for common data fetching patterns
 */

import {
  getUserData,
  getLocationData,
  getAuthToken,
} from "../storage/storageUtils";

/**
 * Fetch user data from storage with error handling
 * @returns {Promise<Object|null>} User data object or null
 */
export const fetchUserFromStorage = async () => {
  try {
    const userData = await getUserData();
    return userData;
  } catch (error) {
    console.error("Error fetching user from storage:", error);
    return null;
  }
};

/**
 * Fetch location data from storage with error handling
 * @returns {Promise<Object|null>} Location data object or null
 */
export const fetchLocationFromStorage = async () => {
  try {
    const locationData = await getLocationData();
    return locationData?.coords || null;
  } catch (error) {
    console.error("Error fetching location from storage:", error);
    return null;
  }
};

/**
 * Fetch auth token from storage with error handling
 * @returns {Promise<string|null>} Auth token or null
 */
export const fetchAuthTokenFromStorage = async () => {
  try {
    const token = await getAuthToken();
    return token;
  } catch (error) {
    console.error("Error fetching auth token from storage:", error);
    return null;
  }
};

/**
 * Generic data loader with loading state management
 * @param {Function} fetchFunction - Async function to fetch data
 * @param {Function} setLoading - Loading state setter
 * @param {Function} setData - Data state setter
 * @param {Function} setError - Error state setter (optional)
 * @param {string} errorMessage - Custom error message (optional)
 */
export const loadDataWithState = async (
  fetchFunction,
  setLoading,
  setData,
  setError = null,
  errorMessage = "Có lỗi xảy ra khi tải dữ liệu"
) => {
  if (setLoading) setLoading(true);

  try {
    const result = await fetchFunction();
    if (setData) setData(result);
    return result;
  } catch (error) {
    console.error("Error in loadDataWithState:", error);
    if (setError) {
      setError(errorMessage);
    }
    return null;
  } finally {
    if (setLoading) setLoading(false);
  }
};

/**
 * Load multiple data sources in parallel
 * @param {Array<Function>} fetchFunctions - Array of async fetch functions
 * @param {Function} setLoading - Loading state setter (optional)
 * @returns {Promise<Array>} Array of results from all fetch functions
 */
export const loadMultipleData = async (fetchFunctions, setLoading = null) => {
  if (setLoading) setLoading(true);

  try {
    const results = await Promise.all(fetchFunctions.map((fn) => fn()));
    return results;
  } catch (error) {
    console.error("Error loading multiple data:", error);
    throw error;
  } finally {
    if (setLoading) setLoading(false);
  }
};

/**
 * Refresh handler for pull-to-refresh functionality
 * @param {Function} refreshFunction - Function to call for refresh
 * @param {Function} setRefreshing - Refreshing state setter
 */
export const handleRefresh = async (refreshFunction, setRefreshing) => {
  setRefreshing(true);
  try {
    await refreshFunction();
  } catch (error) {
    console.error("Error during refresh:", error);
  } finally {
    setRefreshing(false);
  }
};

/**
 * Create a standard data loading pattern for screens
 * @param {Object} options - Configuration options
 * @param {Function} options.fetchUser - Function to fetch user data (optional)
 * @param {Function} options.fetchLocation - Function to fetch location data (optional)
 * @param {Function} options.fetchMainData - Function to fetch main screen data
 * @param {Function} options.setLoading - Loading state setter
 * @param {Object} options.setters - Object with state setters { setUser, setLocation, setMainData }
 * @returns {Promise<Object>} Object with loaded data
 */
export const createScreenDataLoader = async ({
  fetchUser = false,
  fetchLocation = false,
  fetchMainData,
  setLoading,
  setters = {},
}) => {
  const fetchFunctions = [];

  // Add optional fetch functions
  if (fetchUser) {
    fetchFunctions.push(fetchUserFromStorage);
  }

  if (fetchLocation) {
    fetchFunctions.push(fetchLocationFromStorage);
  }

  // Add main data fetch function
  if (fetchMainData) {
    fetchFunctions.push(fetchMainData);
  }

  try {
    const results = await loadMultipleData(fetchFunctions, setLoading);

    // Set state with results
    let resultIndex = 0;

    if (fetchUser && setters.setUser) {
      setters.setUser(results[resultIndex++]);
    }

    if (fetchLocation && setters.setLocation) {
      setters.setLocation(results[resultIndex++]);
    }

    if (fetchMainData && setters.setMainData) {
      setters.setMainData(results[resultIndex++]);
    }

    return {
      user: fetchUser ? results[0] : null,
      location: fetchLocation ? results[fetchUser ? 1 : 0] : null,
      mainData: fetchMainData ? results[results.length - 1] : null,
    };
  } catch (error) {
    console.error("Error in screen data loader:", error);
    throw error;
  }
};

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} retries - Number of retries (default: 3)
 * @param {number} delay - Initial delay in ms (default: 1000)
 * @returns {Promise} Result of the function
 */
export const retryWithBackoff = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts remaining`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};
