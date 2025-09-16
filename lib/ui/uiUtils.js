/**
 * UI utility functions for common React Native patterns
 */

import { Alert } from "react-native";

/**
 * Show confirmation alert with customizable messages
 * @param {Object} options - Alert options
 * @param {string} options.title - Alert title
 * @param {string} options.message - Alert message
 * @param {string} options.confirmText - Confirm button text (default: 'Xác nhận')
 * @param {string} options.cancelText - Cancel button text (default: 'Hủy')
 * @param {Function} options.onConfirm - Callback for confirm action
 * @param {Function} options.onCancel - Callback for cancel action (optional)
 * @param {string} options.confirmStyle - Style for confirm button ('default', 'destructive') (default: 'default')
 */
export const showConfirmAlert = ({
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  confirmStyle = "default",
}) => {
  Alert.alert(title, message, [
    {
      text: cancelText,
      style: "cancel",
      onPress: onCancel,
    },
    {
      text: confirmText,
      style: confirmStyle,
      onPress: onConfirm,
    },
  ]);
};

/**
 * Show simple alert with OK button
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Function} onPress - Callback when OK is pressed (optional)
 */
export const showAlert = (title, message, onPress) => {
  Alert.alert(title, message, [{ text: "OK", onPress }]);
};

/**
 * Show error alert with standard error styling
 * @param {string} message - Error message
 * @param {Function} onPress - Callback when OK is pressed (optional)
 */
export const showErrorAlert = (message, onPress) => {
  showAlert("Lỗi", message, onPress);
};

/**
 * Show success alert with standard success styling
 * @param {string} message - Success message
 * @param {Function} onPress - Callback when OK is pressed (optional)
 */
export const showSuccessAlert = (message, onPress) => {
  showAlert("Thành công", message, onPress);
};

/**
 * Show warning alert
 * @param {string} message - Warning message
 * @param {Function} onPress - Callback when OK is pressed (optional)
 */
export const showWarningAlert = (message, onPress) => {
  showAlert("Cảnh báo", message, onPress);
};

/**
 * Show remove item confirmation alert (common pattern for removing items)
 * @param {Object} options - Alert options
 * @param {string} options.itemName - Name of item to be removed
 * @param {Function} options.onConfirm - Callback for confirm removal
 */
export const showRemoveItemAlert = ({ itemName, onConfirm }) => {
  showConfirmAlert({
    title: `Xóa ${itemName}`,
    message: `Bạn có chắc chắn muốn xóa ${itemName} này?`,
    confirmText: "Xóa",
    confirmStyle: "destructive",
    onConfirm,
  });
};

/**
 * Generate star rating display array
 * @param {number} rating - Rating value (0-5)
 * @param {number} maxStars - Maximum number of stars (default: 5)
 * @returns {Array} Array of star objects with filled/empty status
 */
export const generateStarRating = (rating = 0, maxStars = 5) => {
  const stars = [];
  const filledStars = Math.floor(rating);

  for (let i = 0; i < maxStars; i++) {
    stars.push({
      key: i,
      filled: i < filledStars,
      rating: rating,
    });
  }

  return stars;
};

/**
 * Get star color based on filled status
 * @param {boolean} filled - Whether star is filled
 * @param {string} filledColor - Color for filled stars (default: '#FFD700')
 * @param {string} emptyColor - Color for empty stars (default: '#E5E5E5')
 * @returns {string} Color for the star
 */
export const getStarColor = (
  filled,
  filledColor = "#FFD700",
  emptyColor = "#E5E5E5"
) => {
  return filled ? filledColor : emptyColor;
};

/**
 * Create consistent loading state object
 * @param {boolean} isLoading - Loading state
 * @param {string} message - Loading message (optional)
 * @returns {Object} Loading state object
 */
export const createLoadingState = (isLoading, message = "Đang tải...") => ({
  isLoading,
  message,
});

/**
 * Create consistent error state object
 * @param {string} message - Error message
 * @param {Error} error - Original error object (optional)
 * @returns {Object} Error state object
 */
export const createErrorState = (message, error = null) => ({
  hasError: true,
  message,
  originalError: error,
});

/**
 * Create empty state configuration for lists
 * @param {string} message - Empty state message
 * @param {string} subtitle - Optional subtitle (optional)
 * @returns {Object} Empty state configuration
 */
export const createEmptyState = (message, subtitle = "") => ({
  isEmpty: true,
  message,
  subtitle,
});

/**
 * Truncate text for display with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateForDisplay = (text, maxLength = 20) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Format address for card display (truncated)
 * @param {string} address - Full address
 * @param {number} maxLength - Maximum length (default: 30)
 * @returns {string} Formatted address
 */
export const formatAddressForCard = (address, maxLength = 30) => {
  return truncateForDisplay(address, maxLength);
};
