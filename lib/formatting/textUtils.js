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
 * Format number with thousand separators
 * @param {number} number - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  if (typeof number !== "number") return "0";
  return number.toLocaleString("vi-VN");
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
