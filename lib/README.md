# FitBridge Utility Library

A collection of reusable utility functions organized by category to improve code maintainability and reduce duplication across the FitBridge application.

## Structure

```
lib/
├── index.js                    # Main entry point with convenient re-exports
├── async/
│   └── asyncUtils.js          # Async data loading patterns
├── formatting/
│   ├── dateTimeUtils.js        # Date and time formatting functions
│   └── textUtils.js           # Text formatting and manipulation
├── location/
│   └── locationUtils.js       # Location and distance calculations
├── storage/
│   └── storageUtils.js        # AsyncStorage wrapper functions
├── ui/
│   └── uiUtils.js             # UI helpers, alerts, and common patterns
├── utils/
│   └── arrayUtils.js          # Array and object manipulation
└── validation/
    └── validationUtils.js     # Form validation functions
```

## Usage

### Import from main index (recommended)

```javascript
import { calculateDistance, formatPrice, validateEmail } from "../../lib";
```

### Import from specific modules

```javascript
import { calculateDistance } from "../../lib/location/locationUtils";
import { formatPrice } from "../../lib/formatting/textUtils";
import { validateEmail } from "../../lib/validation/validationUtils";
```

## Categories

### 🌍 Location Utils (`lib/location/locationUtils.js`)

- `calculateDistance(lat1, lon1, lat2, lon2)` - Calculate distance between coordinates
- `isValidCoordinate(lat, lng)` - Validate coordinate ranges
- `filterGymsByDistance(gyms, coords, radius)` - Filter and sort gyms by distance
- `deg2rad(deg)` - Convert degrees to radians

### 📅 Date & Time Utils (`lib/formatting/dateTimeUtils.js`)

- `formatDate(dateString)` - Format date for display
- `formatTime(timeString)` - Format time to HH:MM
- `formatDateForAPI(date)` - Format date for API calls
- `isToday(date)` - Check if date is today
- `getDayName(date)` - Get Vietnamese day name
- `getWeekDates(weekOffset)` - Get array of week dates

### 📝 Text Utils (`lib/formatting/textUtils.js`)

- `formatPrice(price)` - Format price with Vietnamese currency
- `formatNumber(number)` - Format number with thousand separators
- `truncateText(text, maxLength)` - Truncate text with ellipsis
- `capitalizeWords(text)` - Capitalize first letter of each word
- `removeVietnameseAccents(text)` - Remove Vietnamese accents for search

### ✅ Validation Utils (`lib/validation/validationUtils.js`)

- `validateEmail(email)` - Validate email format
- `validatePassword(password)` - Validate password strength
- `validatePhone(phone)` - Validate Vietnamese phone number
- `validateRequired(value)` - Check if field is not empty
- `validateForm(formData, requiredFields)` - Validate entire form

### 💾 Storage Utils (`lib/storage/storageUtils.js`)

- `storeData(key, value)` - Store data in AsyncStorage
- `getData(key)` - Retrieve data from AsyncStorage
- `getUserData()` - Get user data (common pattern)
- `getAuthToken()` - Get authentication token
- `logoutUser()` - Clear auth-related data

### 🔧 Array Utils (`lib/utils/arrayUtils.js`)

- `sortByKey(array, key, order)` - Sort array by object key
- `filterByConditions(array, conditions)` - Filter with multiple conditions
- `groupByKey(array, key)` - Group array items by key
- `removeDuplicatesByKey(array, key)` - Remove duplicates
- `deepClone(obj)` - Deep clone objects/arrays

### 🎨 UI Utils (`lib/ui/uiUtils.js`)

- `showConfirmAlert(options)` - Show customizable confirmation alert
- `showAlert(title, message)` - Show simple alert with OK button
- `showErrorAlert(message)` - Show error alert with standard styling
- `showSuccessAlert(message)` - Show success alert
- `generateStarRating(rating, maxStars)` - Generate star rating display array
- `getStarColor(filled)` - Get star color based on filled status
- `truncateForDisplay(text, maxLength)` - Truncate text for display

### ⚡ Async Utils (`lib/async/asyncUtils.js`)

- `fetchUserFromStorage()` - Fetch user data with error handling
- `fetchLocationFromStorage()` - Fetch location data with error handling
- `loadDataWithState(fetchFn, setLoading, setData)` - Generic data loader
- `createScreenDataLoader(options)` - Standard data loading pattern for screens
- `handleRefresh(refreshFn, setRefreshing)` - Refresh handler for pull-to-refresh
- `retryWithBackoff(fn, retries, delay)` - Retry function with exponential backoff

## Migration Guide

When refactoring existing code:

1. **Identify duplicate utility functions** across components
2. **Import the equivalent function** from the lib
3. **Replace the local implementation** with the imported function
4. **Test the component** to ensure functionality remains the same

### Example Migration

**Before:**

```javascript
// In HomeScreen.js
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // implementation...
};

const isValidCoordinate = (lat, lng) => {
  // implementation...
};
```

**After:**

```javascript
// In HomeScreen.js
import {
  calculateDistance,
  isValidCoordinate,
} from "../../lib/location/locationUtils";

// Remove local implementations, use imported functions directly
```

## Benefits

- ✅ **Code Reusability** - Write once, use everywhere
- ✅ **Consistency** - Same logic across the app
- ✅ **Maintainability** - Single source of truth for utilities
- ✅ **Testing** - Easier to unit test isolated functions
- ✅ **Bundle Size** - Reduced duplication
- ✅ **Developer Experience** - Clear, documented APIs

## Best Practices

1. **Keep functions pure** - No side effects when possible
2. **Add JSDoc comments** - Document parameters and return values
3. **Handle edge cases** - Validate inputs and provide defaults
4. **Follow naming conventions** - Use clear, descriptive function names
5. **Group related functions** - Organize by functionality
6. **Export individually** - Allow tree-shaking for better performance

## Contributing

When adding new utility functions:

1. Determine the appropriate category/module
2. Add comprehensive JSDoc documentation
3. Include input validation and error handling
4. Update the main index.js file for convenient importing
5. Update this README with the new function
6. Consider adding unit tests for complex functions
