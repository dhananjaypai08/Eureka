import React, { useState, useEffect } from "react";
import { ClueHunt } from "./ClueHunt";

export const LocationRequest = () => {
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const requestLocation = () => {
    setStatus("requesting");
    
    if (!navigator.geolocation) {
      setStatus("error");
      setError("Geolocation is not supported by your browser");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Initial user location:", { latitude, longitude });
        setUserLocation({ latitude, longitude });
        setStatus("success");
      },
      (error) => {
        console.error("Error getting location:", error);
        setStatus("error");
        switch(error.code) {
          case 1:
            setError("Location access denied. Please enable location services");
            break;
          case 2:
            setError("Location unavailable. Please try again");
            break;
          case 3:
            setError("Location request timed out. Please try again");
            break;
          default:
            setError("An unknown error occurred");
        }
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="w-full mx-auto">
      {status !== "success" ? (
        <div className="max-w-md mx-auto">
          <div className="p-8 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 shadow-xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Location Access</h2>
              <p className="text-gray-400">
                We need your location to find nearby clues and verify your discoveries
              </p>
            </div>

            {status === "pending" && (
              <button
                onClick={requestLocation}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all shadow-lg hover:shadow-blue-500/20 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10 8 16 12 10 16 10 8"></polygon>
                </svg>
                Share Location
              </button>
            )}

            {status === "requesting" && (
              <div className="w-full py-3 px-4 rounded-lg bg-gray-800 text-gray-300 font-medium flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Getting your location...
              </div>
            )}

            {status === "error" && (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Location Error</h3>
                <p className="text-red-400 mb-6">{error}</p>
                <button
                  onClick={requestLocation}
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.href = "/"}
              className="text-gray-400 hover:text-white text-sm flex items-center justify-center mx-auto transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Home
            </button>
          </div>
        </div>
      ) : (
        // Once we have the initial location, render the ClueHunt component
        userLocation && <ClueHunt initialUserLocation={userLocation} />
      )}
    </div>
  );
};