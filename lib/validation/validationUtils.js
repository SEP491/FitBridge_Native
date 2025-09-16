/**
 * Validation utility functions for form inputs and data validation
 */

/**
 * Validate email format
 * @param {string} email - Email string to validate
 * @returns {boolean} True if email format is valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password string to validate
 * @returns {boolean} True if password meets minimum requirements
 */
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validate Vietnamese phone number
 * @param {string} phone - Phone number string to validate
 * @returns {boolean} True if phone number format is valid
 */
export const validatePhone = (phone) => {
  // Vietnamese phone number: starts with 0, followed by 9 digits
  const phoneRegex = /^0[0-9]{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @returns {boolean} True if value is not empty
 */
export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

/**
 * Validate full name
 * @param {string} fullName - Full name string to validate
 * @returns {boolean} True if full name is valid (at least 2 characters)
 */
export const validateFullName = (fullName) => {
  return fullName && fullName.trim().length >= 2;
};

/**
 * Validate if passwords match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {boolean} True if passwords match
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Validate form data with multiple fields
 * @param {Object} formData - Object containing form fields
 * @param {string[]} requiredFields - Array of required field names
 * @returns {Object} Validation result with isValid and errors
 */
export const validateForm = (formData, requiredFields) => {
  const errors = {};
  let isValid = true;

  requiredFields.forEach((field) => {
    if (!validateRequired(formData[field])) {
      errors[field] = `${field} is required`;
      isValid = false;
    }
  });

  // Specific validations
  if (formData.email && !validateEmail(formData.email)) {
    errors.email = "Invalid email format";
    isValid = false;
  }

  if (formData.phone && !validatePhone(formData.phone)) {
    errors.phone = "Invalid phone number format";
    isValid = false;
  }

  if (formData.password && !validatePassword(formData.password)) {
    errors.password = "Password must be at least 6 characters";
    isValid = false;
  }

  if (
    formData.confirmPassword &&
    !validatePasswordMatch(formData.password, formData.confirmPassword)
  ) {
    errors.confirmPassword = "Passwords do not match";
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * Validate number range
 * @param {number} value - Number to validate
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {boolean} True if number is within range
 */
export const validateNumberRange = (value, min, max) => {
  return !isNaN(value) && value >= min && value <= max;
};

/**
 * Validate URL format
 * @param {string} url - URL string to validate
 * @returns {boolean} True if URL format is valid
 */
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
