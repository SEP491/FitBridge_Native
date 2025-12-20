/**
 * Patch to suppress "topSvgLayout" error from react-native-svg
 * This is a known compatibility issue that doesn't affect functionality
 */

import { NativeModules } from 'react-native';

// Patch the event dispatcher if available
if (typeof global !== 'undefined') {
  const originalDispatch = global.__fbBatchedBridge?.callFunction;
  
  if (originalDispatch) {
    global.__fbBatchedBridge.callFunction = function(module, method, args) {
      // Filter out topSvgLayout events
      if (method === 'RCTEventEmitter' && args && args[0] === 'topSvgLayout') {
        return;
      }
      return originalDispatch.apply(this, arguments);
    };
  }
}

// Also patch console methods
const originalError = console.error;
const originalWarn = console.warn;

console.error = function(...args) {
  const message = args.join(' ');
  if (
    message.includes('topSvgLayout') ||
    message.includes('Unsupported top level event type')
  ) {
    return;
  }
  originalError.apply(console, args);
};

console.warn = function(...args) {
  const message = args.join(' ');
  if (
    message.includes('topSvgLayout') ||
    message.includes('Unsupported top level event type')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

