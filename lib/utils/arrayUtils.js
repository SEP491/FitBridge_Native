/**
 * Array and object utility functions for data manipulation
 */

/**
 * Remove duplicates from array based on a key
 * @param {Array} array - Array to deduplicate
 * @param {string} key - Key to use for comparison
 * @returns {Array} Array with duplicates removed
 */
export const removeDuplicatesByKey = (array, key) => {
  if (!Array.isArray(array)) return [];

  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

/**
 * Sort array by key in ascending or descending order
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - 'asc' or 'desc' (default: 'asc')
 * @returns {Array} Sorted array
 */
export const sortByKey = (array, key, order = "asc") => {
  if (!Array.isArray(array)) return [];

  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
};

/**
 * Group array items by a key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Object with grouped items
 */
export const groupByKey = (array, key) => {
  if (!Array.isArray(array)) return {};

  return array.reduce((groups, item) => {
    const value = item[key];
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(item);
    return groups;
  }, {});
};

/**
 * Find item in array by key-value pair
 * @param {Array} array - Array to search
 * @param {string} key - Key to search by
 * @param {*} value - Value to match
 * @returns {*} Found item or undefined
 */
export const findByKey = (array, key, value) => {
  if (!Array.isArray(array)) return undefined;
  return array.find((item) => item[key] === value);
};

/**
 * Filter array by multiple conditions
 * @param {Array} array - Array to filter
 * @param {Object} conditions - Object with key-value pairs to match
 * @returns {Array} Filtered array
 */
export const filterByConditions = (array, conditions) => {
  if (!Array.isArray(array) || !conditions) return array;

  return array.filter((item) => {
    return Object.keys(conditions).every((key) => {
      const conditionValue = conditions[key];
      const itemValue = item[key];

      if (Array.isArray(conditionValue)) {
        return conditionValue.includes(itemValue);
      }

      return itemValue === conditionValue;
    });
  });
};

/**
 * Chunk array into smaller arrays of specified size
 * @param {Array} array - Array to chunk
 * @param {number} size - Size of each chunk
 * @returns {Array} Array of chunks
 */
export const chunkArray = (array, size) => {
  if (!Array.isArray(array) || size <= 0) return [];

  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Deep clone an object or array
 * @param {*} obj - Object to clone
 * @returns {*} Deep cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (typeof obj === "object") {
    const cloned = {};
    Object.keys(obj).forEach((key) => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
  return obj;
};

/**
 * Merge objects deeply
 * @param {Object} target - Target object
 * @param {...Object} sources - Source objects to merge
 * @returns {Object} Merged object
 */
export const deepMerge = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
};

/**
 * Check if value is an object
 * @param {*} item - Item to check
 * @returns {boolean} True if item is an object
 */
const isObject = (item) => {
  return item && typeof item === "object" && !Array.isArray(item);
};

/**
 * Get nested property value safely
 * @param {Object} obj - Object to get property from
 * @param {string} path - Dot-separated path to property
 * @param {*} defaultValue - Default value if property not found
 * @returns {*} Property value or default value
 */
export const getNestedProperty = (obj, path, defaultValue = undefined) => {
  if (!obj || !path) return defaultValue;

  const keys = path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result == null || typeof result !== "object") {
      return defaultValue;
    }
    result = result[key];
  }

  return result !== undefined ? result : defaultValue;
};

/**
 * Set nested property value safely
 * @param {Object} obj - Object to set property on
 * @param {string} path - Dot-separated path to property
 * @param {*} value - Value to set
 * @returns {Object} Modified object
 */
export const setNestedProperty = (obj, path, value) => {
  if (!obj || !path) return obj;

  const keys = path.split(".");
  const lastKey = keys.pop();
  let current = obj;

  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
  return obj;
};
