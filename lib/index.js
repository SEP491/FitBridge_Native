/**
 * Main index file for utility libraries
 * Provides centralized access to all utility functions
 */

// Location utilities
export * from "./location/locationUtils";

// Date and time utilities
export * from "./formatting/dateTimeUtils";

// Text and formatting utilities
export * from "./formatting/textUtils";

// Validation utilities
export * from "./validation/validationUtils";

// Storage utilities
export * from "./storage/storageUtils";

// Array and object utilities
export * from "./utils/arrayUtils";

// UI utilities
export * from "./ui/uiUtils";

// Async utilities
export * from "./async/asyncUtils";

// Convenience re-exports for commonly used functions
export {
  // Location functions
  calculateDistance,
  isValidCoordinate,
  filterGymsByDistance,

  // Date/time functions
  formatDate,
  formatTime,
  formatDateForAPI,
  isToday,

  // Validation functions
  validateEmail,
  validatePassword,
  validatePhone,
  validateRequired,

  // Storage functions
  storeData,
  getData,
  getUserData,
  getAuthToken,
} from "./storage/storageUtils";

// Import statements for re-export
import {
  calculateDistance,
  isValidCoordinate,
  filterGymsByDistance,
} from "./location/locationUtils";
import {
  formatDate,
  formatTime,
  formatDateForAPI,
  isToday,
} from "./formatting/dateTimeUtils";
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateRequired,
} from "./validation/validationUtils";

import {
  formatPrice,
  formatNumber,
  truncateText,
} from "./formatting/textUtils";
import {
  storeData,
  getData,
  getUserData,
  getAuthToken,
} from "./storage/storageUtils";

// Additional re-exports for specific functions
export { formatPrice, formatNumber, truncateText };
