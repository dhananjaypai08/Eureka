// Location record interface for tracking history
interface LocationRecord {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

// Maximum realistic speed in meters per second (about 1000 km/h)
const MAX_REALISTIC_SPEED = 280;

// Store last few location points to detect spoofing
let locationHistory: LocationRecord[] = [];

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

// Add location to history for spoofing detection
export const addLocationToHistory = (location: LocationRecord) => {
  // Keep only the last 10 records
  if (locationHistory.length >= 10) {
    locationHistory.shift();
  }
  locationHistory.push(location);
};

// Clear location history
export const clearLocationHistory = () => {
  locationHistory = [];
};

// Detect potential location spoofing based on the history
export const detectLocationSpoofing = (newLocation: LocationRecord): {spoofDetected: boolean, reason?: string} => {
  // If we don't have enough history, we can't detect spoofing
  if (locationHistory.length < 2) {
    return { spoofDetected: false };
  }

  const previousLocation = locationHistory[locationHistory.length - 1];
  
  // Calculate time difference in seconds
  const timeDiffInSeconds = (newLocation.timestamp - previousLocation.timestamp) / 1000;
  
  // If location updated too quickly, this might be spoofing
  if (timeDiffInSeconds < 1) {
    return { spoofDetected: true, reason: "Location updated too quickly" };
  }
  
  // Calculate distance in meters
  const distance = calculateDistance(
    previousLocation.latitude,
    previousLocation.longitude,
    newLocation.latitude,
    newLocation.longitude
  );
  
  // Calculate speed in meters per second
  const speed = distance / timeDiffInSeconds;
  
  // If speed is unrealistically high, this might be spoofing
  if (speed > MAX_REALISTIC_SPEED) {
    return { 
      spoofDetected: true, 
      reason: `Unrealistic movement detected: ${Math.round(speed)} m/s (${Math.round(speed * 3.6)} km/h)` 
    };
  }
  
  // Check if accuracy is suspiciously high for mobile devices
  if (newLocation.accuracy && newLocation.accuracy < 1) {
    return { spoofDetected: true, reason: "Suspiciously high location accuracy" };
  }
  
  return { spoofDetected: false };
};

// Start continuous location monitoring to detect spoofing attempts in real-time
export const startContinuousLocationMonitoring = (
  onSpoofDetected: (reason: string) => void
): (() => void) => {
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: position.timestamp,
        accuracy: position.coords.accuracy
      };
      
      // Check for spoofing
      const spoofingCheck = detectLocationSpoofing(newLocation);
      
      // Add to history regardless
      addLocationToHistory(newLocation);
      
      if (spoofingCheck.spoofDetected && spoofingCheck.reason) {
        onSpoofDetected(spoofingCheck.reason);
      }
    },
    (error) => {
      console.error("Continuous location monitoring error:", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
  
  // Return a function to stop monitoring
  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
};

// Check if location is consistent with IP geolocation
export const verifyLocationConsistency = async (
  latitude: number,
  longitude: number
): Promise<{consistent: boolean, distance?: number, reason?: string}> => {
  try {
    // Use a free IP geolocation service - replace with a more reliable service in production
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      return { consistent: true }; // Assume consistent if service unavailable
    }
    
    const data = await response.json();
    
    // If IP geolocation failed or returned null values, skip this check
    if (!data.latitude || !data.longitude) {
      return { consistent: true };
    }
    
    // Calculate distance between GPS and IP-based location in meters
    const distance = calculateDistance(
      latitude,
      longitude,
      data.latitude,
      data.longitude
    );
    
    // Set a generous threshold - 100km for IP location can be inaccurate
    // Adjust this value based on your needs
    const THRESHOLD_DISTANCE = 100000; // 100 km
    
    if (distance > THRESHOLD_DISTANCE) {
      return { 
        consistent: false,
        distance,
        reason: `IP location and GPS location are too far apart (${Math.round(distance/1000)} km)` 
      };
    }
    
    return { consistent: true, distance };
  } catch (error) {
    console.error("Error verifying location consistency:", error);
    return { consistent: true }; // Assume consistent if check fails
  }
};

// Check for common VPN/proxy indicators
export const detectVPNorProxy = async (): Promise<{detected: boolean, reason?: string}> => {
  try {
    // Check if timezone offset matches approximately what we expect for the IP location
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      return { detected: false };
    }
    
    const data = await response.json();
    
    // If we can't get timezone data, skip check
    if (!data.timezone) {
      return { detected: false };
    }
    
    // Get local browser timezone
    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Simple check - if timezones don't match, might be using VPN
    if (browserTimeZone && data.timezone && browserTimeZone !== data.timezone) {
      return { 
        detected: true, 
        reason: `Browser timezone (${browserTimeZone}) doesn't match IP timezone (${data.timezone})` 
      };
    }
    
    return { detected: false };
  } catch (error) {
    console.error("Error detecting VPN:", error);
    return { detected: false };
  }
};

// Enhanced getCurrentLocation with anti-spoofing measures
export const getCurrentLocation = async (): Promise<{
  latitude: number, 
  longitude: number,
  timestamp: number,
  accuracy?: number,
  spoofDetected?: boolean,
  spoofReason?: string
}> => {
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
      
      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: position.timestamp,
        accuracy: position.coords.accuracy
      };
      
      // Detect potential spoofing
      const spoofingCheck = detectLocationSpoofing(newLocation);
      
      // Add the new location to history regardless of spoofing detection
      // This helps track patterns of spoofing attempts
      addLocationToHistory(newLocation);
      
      resolve({
        ...newLocation,
        spoofDetected: spoofingCheck.spoofDetected,
        spoofReason: spoofingCheck.reason
      });
    };
    
    const errorCallback = (error: GeolocationPositionError) => {
      clearTimeout(timeoutId);
      console.error("Geolocation error:", error.code, error.message);
      reject(new Error("Could not access your location. Please check your browser permissions."));
    };
    
    // Try to get the actual position with high accuracy
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

// Check for developer tools and mock location indicators
export const detectDevTools = (): boolean => {
  try {
    // Check for Firefox's devtools in a type-safe way
    // We need to use this approach because firebug is not in the Console type definition
    const hasFirebug = (() => {
      try {
        // @ts-ignore - Ignoring TypeScript error for Firefox-specific property
        return typeof window.console.firebug !== 'undefined';
      } catch {
        return false;
      }
    })();
    
    if (hasFirebug) {
      return true;
    }
    
    // Check if debugger statements are ignored (chrome)
    const startTime = new Date().getTime();
    const debuggerFunction = Function('debugger; return new Date().getTime();');
    const endTime = debuggerFunction();
    
    // If debugger is running, this would take noticeably longer
    if (endTime - startTime < 10) {
      return false;
    }
    
    return true;
  } catch (e) {
    return false;
  }
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
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const components = result.components;
      
      // Extract city name - try different possible fields
      let city = components.city || 
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