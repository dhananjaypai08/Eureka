import React, { useState, useEffect } from "react";
import { ClueHunt } from "./ClueHunt";
import { getCurrentLocation, detectCity } from "../utils/geoUtils";
import Image from "next/image";

export const LocationRequest = () => {
  // Maintaining original state and functionality
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState<{ 
    latitude: number; 
    longitude: number;
    city: string; 
  } | null>(null);

  // Original location request function - logic unchanged
  const requestLocation = async () => {
    setStatus("requesting");
    
    try {
      // Get user's current location
      const location = await getCurrentLocation();
      
      // Detect city from coordinates
      const city = await detectCity(location.latitude, location.longitude);
      
      console.log("User location:", { ...location, city });
      
      // Save location with city
      setUserLocation({ 
        ...location, 
        city 
      });
      
      setStatus("success");
    } catch (error) {
      console.error("Error getting location:", error);
      setStatus("error");
      setError((error as Error).message);
    }
  };

  return (
    <div className="w-full mx-auto min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center">
      {status !== "success" ? (
        <div className="max-w-md mx-auto pt-20 px-4">
          {/* Back button */}
          <button 
            onClick={() => window.location.href = "/"}
            className="w-12 h-12 rounded-full bg-[#D4BE94] flex items-center justify-center mb-8 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#573516]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-[#3A2112] text-center mb-12 font-serif">
            Welcome to the<br/>quest !
          </h1>
          
          {/* Main content box */}
          <div className="relative">
            {/* Blue border */}
            <div className="absolute inset-0 bg-[#3B6D9E]/40 rounded-xl transform scale-[1.03]"></div>
            
            {/* Brown content box */}
            <div className="relative p-8 rounded-xl bg-[#2C1206] border-2 border-[#3B6D9E]/30 shadow-xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#E8C38D] mb-6 font-serif">Location Required !</h2>
                <p className="text-[#D4BE94] font-serif">
                  We need your location to find nearby clues and verify your discoveries
                </p>
              </div>

              {status === "pending" && (
                <div className="relative flex justify-center">
                  <button
                    onClick={requestLocation}
                    className="relative group focus:outline-none"
                  >
                    <Image 
                      src="/Button.png" 
                      alt="Share Location" 
                      width={240} 
                      height={65} 
                      className="hover:brightness-110 transition-all"
                    />
                    {/* Compass decoration */}
                    <div className="absolute -right-6 -bottom-6">
                      <Image 
                        src="/compass.svg" 
                        alt="Compass" 
                        width={40} 
                        height={40} 
                        className="drop-shadow-lg"
                      />
                    </div>
                  </button>
                </div>
              )}

              {status === "requesting" && (
                <div className="w-full py-3 px-6 bg-[#573516] text-[#D4BE94] font-medium rounded-lg flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-[#D4BE94]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Plotting your coordinates...
                </div>
              )}

              {status === "error" && (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-red-900/40 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-[#E8C38D] mb-2">Map Error</h3>
                  <p className="text-red-400 mb-6">{error}</p>
                  <button
                    onClick={requestLocation}
                    className="px-6 py-2 bg-[#573516] hover:bg-[#6D4523] rounded-lg text-[#D4BE94] transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Once we have the initial location, render the ClueHunt component
        // This part is unchanged from the original
        userLocation && <ClueHunt initialUserLocation={userLocation} />
      )}
    </div>
  );
}