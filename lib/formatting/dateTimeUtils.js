/**
 * Date and time utility functions for formatting and manipulation
 */

/**
 * Format date for API calls (yyyy-mm-dd format)
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string in yyyy-mm-dd format
 */
export const formatDateForAPI = (date) => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

/**
 * Alternative format date for API calls (dd-mm-yyyy format)
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string in dd-mm-yyyy format
 */
export const formatDateForAPIAlt = (date) => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Format date for display (dd/mm/yyyy format)
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string for display
 */
export const formatDateDisplay = (date) => {
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
};

/**
 * Format date for full display (dd/mm/yyyy format)
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string for display
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Format time string to HH:MM format
 * @param {string} timeString - Time string in HH:MM:SS format
 * @returns {string} Time in HH:MM format
 */
export const formatTime = (timeString) => {
  if (!timeString) return "";
  return timeString.substring(0, 5);
};

export const getYearsFromDob = (dob) => {
  const date = new Date(dob);
  return date.getFullYear();
};
