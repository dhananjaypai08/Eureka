// Calculate distance between two coordinates in meters using Haversine formula
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = 
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * 
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

// Fallback location for development/testing
const FALLBACK_LOCATIONS = {
  "Kalyan": {
    latitude: 19.2403,
    longitude: 73.1305,
    city: "Kalyan"
  },
  "Mumbai": {
    latitude: 19.0760,
    longitude: 72.8777,
    city: "Mumbai"
  }
};

// Get the current user location as a Promise
export const getCurrentLocation = (useFallback = false): Promise<{latitude: number, longitude: number}> => {
  // If in development mode or fallback is explicitly requested, use the fallback
  if (useFallback || process.env.NODE_ENV === 'development') {
    console.log("Using fallback location (Kalyan) for development/testing");
    return Promise.resolve(FALLBACK_LOCATIONS.Kalyan);
  }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    
    // Set a timeout in case the location request takes too long
    const timeoutId = setTimeout(() => {
      console.warn("Location request timed out, using fallback location");
      resolve(FALLBACK_LOCATIONS.Kalyan);
    }, 10000); // 10 seconds timeout
    
    const successCallback = (position: GeolocationPosition) => {
      clearTimeout(timeoutId);
      resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    };
    
    const errorCallback = (error: GeolocationPositionError) => {
      clearTimeout(timeoutId);
      console.error("Geolocation error:", error.code, error.message);
      
      // For any geolocation error, use the fallback location for better user experience
      console.warn("Using fallback location due to geolocation error");
      resolve(FALLBACK_LOCATIONS.Kalyan);
    };
    
    // Try to get the actual position with less strict requirements
    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback,
      { 
        enableHighAccuracy: false, // Set to false for faster, less accurate positions
        timeout: 8000,            // Shorter timeout
        maximumAge: 60000         // Accept positions up to 1 minute old
      }
    );
  });
};

// OpenCage API key - Store this in .env file in production
const OPENCAGE_API_KEY = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || 'your_opencage_api_key_here'; 

// Detect city based on coordinates using OpenCage Geocoding API
export const detectCity = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  // If these are our fallback coordinates, return the preset city
  for (const location of Object.values(FALLBACK_LOCATIONS)) {
    if (Math.abs(latitude - location.latitude) < 0.01 && 
        Math.abs(longitude - location.longitude) < 0.01) {
      return location.city;
    }
  }

  try {
    // Use OpenCage Geocoding API instead of Nominatim
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}&language=en&pretty=1`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const components = result.components;
      
      // OpenCage provides a structured components object with various admin levels
      // Extract city name - try different possible fields
      let city = components.city || 
                components.town || 
                components.village || 
                components.county || 
                components.state_district ||
                '';
      
      // Handle hyphenated city names like "Kalyan-Dombivli"
      if (city && city.includes('-')) {
        // Extract the first part (Kalyan from Kalyan-Dombivli)
        city = city.split('-')[0].trim();
      }
      
      // If we still have no city, try to extract from formatted address
      if (!city && result.formatted) {
        const parts = result.formatted.split(',');
        if (parts.length > 1) {
          city = parts[0].trim();
        }
      }
      
      return city || "Kalyan"; // Default to Kalyan if no city found
    }
    
    return "Kalyan"; // Default fallback
  } catch (error) {
    console.error("Error detecting city:", error);
    // Return default city when geocoding fails
    return "Unknown";
  }
};

// Shuffle an array using Fisher-Yates algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}