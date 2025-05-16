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


export const getCurrentLocation = async (): Promise<{latitude: number, longitude: number}> => {

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    
    // Set a timeout in case the location request takes too long
    const timeoutId = setTimeout(() => {
      console.warn("Location request timed out");
      reject(new Error("Location request timed out. Please try again."));
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
      reject(new Error("Could not access your location. Please check your browser permissions."));
    };
    
    // Try to get the actual position
    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback,
      { 
        enableHighAccuracy: true, // Better accuracy
        timeout: 8000,
        maximumAge: 0  // Always get fresh position
      }
    );
  });
};

// OpenCage API key - Store this in .env file in production
const OPENCAGE_API_KEY = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || 'your_opencage_api_key_here'; 

export const detectCity = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    // Use OpenCage Geocoding API
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}&language=en&pretty=1`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }
    
    const data = await response.json();
    console.log("detected data, ", data)
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const components = result.components;
      
      // Extract city name - try different possible fields
      let city = components.suburb ||
                components.city || 
                components.town || 
                components.village || 
                components.county || 
                components.state_district ||
                '';
      
      // Handle hyphenated city names
      if (city && city.includes('-')) {
        city = city.split('-')[0].trim();
      }
      
      // If we still have no city, try to extract from formatted address
      if (!city && result.formatted) {
        const parts = result.formatted.split(',');
        if (parts.length > 1) {
          city = parts[0].trim();
        }
      }
      
      return city || "Unknown City";
    }
    
    return "Unknown City";
  } catch (error) {
    console.error("Error detecting city:", error);
    return "Unknown City";
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