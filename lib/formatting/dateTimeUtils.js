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

/**
 * Format time with period (AM/PM equivalent in Vietnamese)
 * @param {string} timeString - Time string in HH:MM format
 * @returns {string} Formatted time with period
 */
export const formatTimeWithPeriod = (timeString) => {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const minute = parseInt(minutes);
  const period = hour >= 12 ? "CH" : "SA";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${period}`;
};

/**
 * Get Vietnamese day name from date
 * @param {Date} date - Date object
 * @returns {string} Vietnamese day name
 */
export const getDayName = (date) => {
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return days[date.getDay()];
};

/**
 * Check if date is today
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Check if date is in the past
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Get current week dates
 * @param {number} weekOffset - Offset from current week (0 = current week, 1 = next week, etc.)
 * @returns {Date[]} Array of 7 dates for the week
 */
export const getWeekDates = (weekOffset = 0) => {
  const today = new Date();
  const currentDay = today.getDay();
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - currentDay + 1 + weekOffset * 7);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(currentMonday);
    day.setDate(currentMonday.getDate() + i);
    days.push(day);
  }
  return days;
};

export const getYearsFromDob = (dob) => {
  const date = new Date(dob);
  return date.getFullYear();
};
