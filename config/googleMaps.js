// Google Maps API Configuration
// Get your API key from: https://console.cloud.google.com/

export const GOOGLE_MAPS_CONFIG = {
  // Replace with your actual Google Maps API Key
  API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  
  // API endpoints
  PLACES_AUTOCOMPLETE: "https://maps.googleapis.com/maps/api/place/autocomplete/json",
  PLACE_DETAILS: "https://maps.googleapis.com/maps/api/place/details/json",
  GEOCODING: "https://maps.googleapis.com/maps/api/geocode/json",
  
  // Default configuration
  DEFAULT_LANGUAGE: "en",
  DEFAULT_COUNTRY: "vn", // Vietnam
  
  // Debounce delay for search (milliseconds)
  SEARCH_DEBOUNCE_MS: 500,
};

// Helper function to build autocomplete URL
export const buildAutocompleteUrl = (input, language = "en", country = "vn") => {
  return `${GOOGLE_MAPS_CONFIG.PLACES_AUTOCOMPLETE}?input=${encodeURIComponent(
    input
  )}&key=${GOOGLE_MAPS_CONFIG.API_KEY}&language=${language}&components=country:${country}`;
};

// Helper function to build place details URL
export const buildPlaceDetailsUrl = (placeId) => {
  return `${GOOGLE_MAPS_CONFIG.PLACE_DETAILS}?place_id=${placeId}&key=${GOOGLE_MAPS_CONFIG.API_KEY}&fields=geometry,formatted_address,address_components`;
};
