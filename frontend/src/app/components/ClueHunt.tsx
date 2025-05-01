import React, { useState, useEffect } from "react";

// Define the place type based on your places.json structure
interface Place {
  id: number;
  name: string;
  clue: string;
  latitude: number;
  longitude: number;
  thresholdDistance: number;
}

// Calculate distance between two coordinates in meters using Haversine formula
const calculateDistance = (
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

export const ClueHunt = ({ initialUserLocation }: { initialUserLocation: { latitude: number; longitude: number } }) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [distances, setDistances] = useState<{[key: number]: number}>({});
  const [verifying, setVerifying] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Load places using initial location
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        // In a real app, you would fetch this from an API
        // For now, we'll use the data directly from the provided places
        const placesData = [
          {
            "id": 1,
            "name": "Eesha Krupa Building",
            "clue": "Total : 2 Words.  The building is named after a famous Indian actress who played in Jannat2 + the second word for the building is a common hindi term which signifies blessing/favor in India.",
            "latitude": 19.242284696517313,
            "longitude": 73.13484960148622,
            "thresholdDistance": 50
          },
          {
            "id": 2,
            "name": "Example Location 2",
            "clue": "This place has the best view of the sunrise in the entire city(Chicken Ghar).",
            "latitude": 19.248736,
            "longitude": 73.140214,
            "thresholdDistance": 50
          },
          {
            "id": 3,
            "name": "Sweeets Place madhurima",
            "clue": "This place is famous for its sweets and is located near rambaug 4.",
            "latitude": 19.242199638157526,
            "longitude": 73.13656040841443,
            "thresholdDistance": 50
          },
          {
            "id": 4,
            "name": "Maxi Ground",
            "clue": "This place is famous for its cricket ground and is located near rambaug",
            "latitude": 19.24206398976848,
            "longitude": 73.13971732162364,
            "thresholdDistance": 50
          },
          {
            "id": 5,
            "name": "Kala Talav Entry gate",
            "clue": "This place is famous for its lake and is located near rambaug, entry gate",
            "latitude": 19.244546664001724,
            "longitude": 73.13150821451312,
            "thresholdDistance": 50
          },
          {
            "id": 6,
            "name": "Mangya Shop",
            "clue": "This place is behind kala talav and is famous for its ciggarettes and is located near rambaug",
            "latitude": 19.24689932040889,
            "longitude": 73.13326772461596,
            "thresholdDistance": 50
          },
        ];

        // Calculate initial distances to each place
        const distanceMap: {[key: number]: number} = {};
        placesData.forEach(place => {
          const distance = calculateDistance(
            initialUserLocation.latitude,
            initialUserLocation.longitude,
            place.latitude,
            place.longitude
          );
          distanceMap[place.id] = distance;
        });

        // Sort places by distance
        const sortedPlaces = [...placesData].sort((a, b) => 
          distanceMap[a.id] - distanceMap[b.id]
        );

        setPlaces(sortedPlaces);
        setDistances(distanceMap);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching places:", error);
        setError("Failed to load location data. Please try again.");
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [initialUserLocation]);

  // Function to get current user location
  const getCurrentUserLocation = (): Promise<{latitude: number, longitude: number}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          let errorMessage = "Unknown error occurred while getting your location";
          switch(error.code) {
            case 1:
              errorMessage = "Location access denied. Please enable location services";
              break;
            case 2:
              errorMessage = "Location unavailable. Please try again";
              break;
            case 3:
              errorMessage = "Location request timed out. Please try again";
              break;
          }
          reject(new Error(errorMessage));
        },
        { enableHighAccuracy: true }
      );
    });
  };

  const currentPlace = places[currentPlaceIndex];
  
  const handleVerifyLocation = async () => {
    setVerifying(true);
    setLocationError("");
    setVerificationResult(null);
    
    try {
      // Get the CURRENT user location when they click verify
      const currentUserLocation = await getCurrentUserLocation();
      
      // Calculate the distance between the current user location and the target place
      const currentDistance = calculateDistance(
        currentUserLocation.latitude,
        currentUserLocation.longitude,
        currentPlace.latitude,
        currentPlace.longitude
      );
      
      // Update the displayed distance for the current place
      setDistances(prev => ({
        ...prev,
        [currentPlace.id]: currentDistance
      }));
      
      // Check if user is within the threshold distance
      if (currentDistance <= currentPlace.thresholdDistance) {
        setVerificationResult({
          success: true,
          message: `Location verified! You are ${Math.round(currentDistance)}m from the target.`
        });
        
        // Wait a moment to show success before moving to next place
        setTimeout(() => {
          // If we're not at the last place, move to the next one
          if (currentPlaceIndex < places.length - 1) {
            setCurrentPlaceIndex(currentPlaceIndex + 1);
            setVerificationResult(null);
          } else {
            // Last place verified - would show reward screen here
            setVerificationResult({
              success: true,
              message: "Congratulations! You've completed all locations!"
            });
          }
        }, 2000);
      } else {
        setVerificationResult({
          success: false,
          message: `Too far away: ${Math.round(currentDistance)}m. Need to be within ${currentPlace.thresholdDistance}m.`
        });
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      setLocationError((error as Error).message);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg text-gray-300">Loading nearby locations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 shadow-xl">
        <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
        <p className="text-red-400 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!currentPlace) {
    return (
      <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 shadow-xl">
        <p className="text-lg text-gray-300">No nearby locations found.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress indicator */}
      <div className="mb-6 w-full bg-gray-800 rounded-full h-2.5">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${((currentPlaceIndex) / places.length) * 100}%` }}
        ></div>
      </div>
      
      <div className="p-8 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 shadow-xl">
        {/* Clue Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Clue {currentPlaceIndex + 1} of {places.length}</h2>
          <p className="text-gray-400">
            Find this location and verify your presence to unlock the next clue
          </p>
        </div>

        {/* Clue Content */}
        <div className="mb-8">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-blue-400 mb-3">Your Clue:</h3>
            <p className="text-xl text-white font-medium leading-relaxed">
              {currentPlace.clue}
            </p>
          </div>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className={`mb-6 p-4 rounded-lg ${
            verificationResult.success ? "bg-green-900/30 border border-green-700" : "bg-red-900/30 border border-red-700"
          }`}>
            <div className="flex items-start">
              <div className={`mt-0.5 mr-3 ${
                verificationResult.success ? "text-green-400" : "text-red-400"
              }`}>
                {verificationResult.success ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                )}
              </div>
              <p className={`text-sm ${
                verificationResult.success ? "text-green-300" : "text-red-300"
              }`}>
                {verificationResult.message}
              </p>
            </div>
          </div>
        )}
        
        {/* Location Error */}
        {locationError && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
            <div className="flex items-start">
              <div className="mt-0.5 mr-3 text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <p className="text-sm text-red-300">
                {locationError}
              </p>
            </div>
          </div>
        )}

        {/* Distance Indicator (for demo purposes - in a real ZK app you wouldn't show this) */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Approximate Distance:</span>
            <span className="text-sm font-medium">
              {distances[currentPlace.id] < 1000 
                ? `${Math.round(distances[currentPlace.id])}m` 
                : `${(distances[currentPlace.id] / 1000).toFixed(2)}km`}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full mt-2">
            <div 
              className={`h-2 rounded-full ${
                distances[currentPlace.id] <= currentPlace.thresholdDistance 
                  ? "bg-green-500" 
                  : distances[currentPlace.id] <= currentPlace.thresholdDistance * 2 
                    ? "bg-yellow-500" 
                    : "bg-red-500"
              }`}
              style={{ 
                width: `${Math.max(
                  5, 
                  Math.min(
                    100, 
                    100 - (distances[currentPlace.id] / (currentPlace.thresholdDistance * 5) * 100)
                  )
                )}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleVerifyLocation}
            disabled={verifying}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all shadow-lg hover:shadow-blue-500/20 flex items-center justify-center disabled:opacity-70"
          >
            {verifying ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying Location...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Verify My Location
              </>
            )}
          </button>
          
          <button 
            className="w-full py-3 px-4 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300 font-medium transition-all flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v4M12 16h.01"></path>
            </svg>
            Get Hint
          </button>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <button
          onClick={() => window.location.href = "/"}
          className="text-gray-400 hover:text-white text-sm flex items-center justify-center mx-auto transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Quit Hunt
        </button>
      </div>
    </div>
  );
};