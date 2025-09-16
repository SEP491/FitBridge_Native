/**
 * Formatting utility functions for prices, currency, and display text
 */

/**
 * Format price for display with Vietnamese currency formatting
 * @param {number} price - Price value to format
 * @returns {string} Formatted price string with VND currency
 */
export const formatPrice = (price) => {
  if (typeof price !== "number") return "0 VND";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

/**
 * Format price with custom currency symbol
 * @param {number} price - Price value to format
 * @param {string} currency - Currency symbol (default: 'VND')
 * @returns {string} Formatted price string
 */
export const formatPriceWithSymbol = (price, currency = "VND") => {
  if (typeof price !== "number") return `0 ${currency}`;
  return `${price.toLocaleString("vi-VN")} ${currency}`;
};

/**
 * Format number with thousand separators
 * @param {number} number - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  if (typeof number !== "number") return "0";
  return number.toLocaleString("vi-VN");
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== "number") return "0%";
  return `${value.toFixed(decimals)}%`;
};

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength) => {
  if (!text || typeof text !== "string") return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text || typeof text !== "string") return "";
  return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

/**
 * Capitalize first letter only
 * @param {string} text - Text to capitalize
 * @returns {string} Text with first letter capitalized
 */
export const capitalizeFirst = (text) => {
  if (!text || typeof text !== "string") return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Format file size in human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted file size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Format duration in minutes to hours and minutes
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
export const formatDuration = (minutes) => {
  if (typeof minutes !== "number" || minutes < 0) return "0 phút";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} phút`;
  } else if (remainingMinutes === 0) {
    return `${hours} giờ`;
  } else {
    return `${hours} giờ ${remainingMinutes} phút`;
  }
};

/**
 * Remove Vietnamese accents from text for search/comparison
 * @param {string} text - Text to remove accents from
 * @returns {string} Text without Vietnamese accents
 */
export const removeVietnameseAccents = (text) => {
  if (!text || typeof text !== "string") return "";

  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};
