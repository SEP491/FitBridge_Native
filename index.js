import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

// Import SVG error patch early to suppress topSvgLayout errors
import './utils/svgErrorPatch';

import App from './App';

// Suppress the "topSvgLayout" error which is a known issue with react-native-svg
// This error doesn't affect functionality and can be safely ignored
if (LogBox) {
  LogBox.ignoreLogs([
    'Unsupported top level event type "topSvgLayout" dispatched',
    'topSvgLayout',
  ]);
}

// Handle errors in the global error handler if ErrorUtils is available
// ErrorUtils might be on react-native or on the global object
try {
  let ErrorUtils = null;
  
  // Try to get ErrorUtils from react-native
  try {
    const RN = require('react-native');
    ErrorUtils = RN?.ErrorUtils;
  } catch (e) {
    // Try global object
    ErrorUtils = global?.ErrorUtils;
  }
  
  if (ErrorUtils && typeof ErrorUtils.getGlobalHandler === 'function' && typeof ErrorUtils.setGlobalHandler === 'function') {
    const originalHandler = ErrorUtils.getGlobalHandler();
    if (originalHandler) {
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        // Filter out the topSvgLayout error
        if (
          error?.message?.includes('topSvgLayout') ||
          error?.message?.includes('Unsupported top level event type')
        ) {
          // Silently ignore this error as it doesn't affect functionality
          return;
        }
        // Call original handler for other errors
        originalHandler(error, isFatal);
      });
    }
  }
} catch (e) {
  // ErrorUtils not available or error accessing it, skip silently
  // This is fine - the console.error patch will still work
}

// Patch console.error to filter out SVG layout errors
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (
    message.includes('topSvgLayout') ||
    message.includes('Unsupported top level event type')
  ) {
    // Suppress this specific error
    return;
  }
  originalConsoleError.apply(console, args);
};

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
