import React, { useState, useEffect, useRef } from "react";
import { calculateDistance, getCurrentLocation, shuffleArray, detectCity } from "../utils/geoUtils";
import { connectWallet, sendReward, uploadToIPFS, mintNFT } from "../utils/web3Utils";
import { ExternalLink, Camera } from "lucide-react";
import { Place, UserLocation, VerificationResult, RewardResult, UserLocationMinimal } from "../types";

// Get the number of clues per game from environment variables
const CLUES_PER_GAME = parseInt(process.env.NEXT_PUBLIC_CLUES_PER_GAME || "4");
const REWARD_AMOUNT = process.env.NEXT_PUBLIC_REWARD_AMOUNT || "0.01";

export const ClueHunt = ({ initialUserLocation }: { initialUserLocation: UserLocation }) => {
  // Game state
  const [places, setPlaces] = useState<Place[]>([]);
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState<number>(0);
  const [completedPlaces, setCompletedPlaces] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mintLoader, setMintLoader] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [imageUploaded, setImageUploaded] = useState<boolean>(false);
  const [currentUserLocation, setCurrentUserLocation] = useState<UserLocationMinimal| null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const explorerBaseUrl = "https://sepolia.basescan.org/tx/";

  // Location state
  const [distances, setDistances] = useState<{[key: number]: number}>({});
  const [verifying, setVerifying] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  
  // Wallet state
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [connectingWallet, setConnectingWallet] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string>("");
  const [sendingReward, setSendingReward] = useState<boolean>(false);
  const [rewardResult, setRewardResult] = useState<RewardResult | null>(null);
  const [clueFound, setClueFound] = useState<boolean>(false);

  // Load places from places.json and select random ones for this game
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        // Fetch places from the JSON file with the correct path
        const response = await fetch('/data/places.json');
        const allPlaces: Place[] = await response.json();
        
        // Filter places by user's city
        const cityPlaces = allPlaces.filter(place => 
          place.city.toLowerCase() === initialUserLocation.city.toLowerCase()
        );
        
        // If no places found in user's city, use nearby places as fallback
        let selectedPlaces: Place[] = [];
        
        if (cityPlaces.length >= CLUES_PER_GAME) {
          // If we have enough places in the city, randomly select the required number
          selectedPlaces = shuffleArray(cityPlaces).slice(0, CLUES_PER_GAME);
        } else if (cityPlaces.length > 0) {
          // If we have some places in the city but not enough, use all of them
          selectedPlaces = cityPlaces;
        } else {
          // If no places in the city, calculate distances and use the closest ones
          const distanceMap: {[key: number]: number} = {};
          
          allPlaces.forEach(place => {
            const distance = calculateDistance(
              initialUserLocation.latitude,
              initialUserLocation.longitude,
              place.latitude,
              place.longitude
            );
            distanceMap[place.id] = distance;
          });
          
          // Sort places by distance and take the closest ones
          selectedPlaces = [...allPlaces]
            .sort((a, b) => distanceMap[a.id] - distanceMap[b.id])
            .slice(0, CLUES_PER_GAME);
        }
        
        // Calculate initial distances to each place
        const distanceMap: {[key: number]: number} = {};
        selectedPlaces.forEach(place => {
          const distance = calculateDistance(
            initialUserLocation.latitude,
            initialUserLocation.longitude,
            place.latitude,
            place.longitude
          );
          distanceMap[place.id] = distance;
        });
    
        setPlaces(selectedPlaces);
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

  const currentPlace = places[currentPlaceIndex];
  
  // Verify user's current location against the target place
  const handleVerifyLocation = async () => {
    setVerifying(true);
    setLocationError("");
    setVerificationResult(null);
    try {
      // Get the current user location when they click verify
      const currentUserLocation = await getCurrentLocation();
      setCurrentUserLocation(currentUserLocation);
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
        
        setClueFound(true);
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

  useEffect(() => {
    if (!imageUploaded || !currentPlace) return;
    setCompletedPlaces(prev => [...prev, currentPlace.id]);
    // Wait a moment to show success before moving to next place
    setClueFound(false);
    setImageUploaded(false);
    setTimeout(() => {
      // If we're not at the last place, move to the next one
      if (currentPlaceIndex < places.length - 1) {
        setCurrentPlaceIndex(currentPlaceIndex + 1);
        setVerificationResult(null);
      } else {
        // Last place verified - show reward screen
        setGameCompleted(true);
      }
    }, 2000);
    
  }, [imageUploaded]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMintLoader(true);
      setPreviewUrl(URL.createObjectURL(file));
      try {
        const ipfsUrl = await uploadToIPFS(file);
        console.log("File uploaded to IPFS:", ipfsUrl);
  
        if (!currentUserLocation) {
          setLocationError("Please verify your location first");
          return;
        }
  
        const city = await detectCity(
          currentUserLocation.latitude,
          currentUserLocation.longitude
        );
  
        const mintResult = await mintNFT(
          "0xc4D54642fCb41dCBe9c065c855cB3138eDf5db6C",
          ipfsUrl,
          currentUserLocation.latitude.toString(),
          currentUserLocation.longitude.toString(),
          city
        );
  
        if (!mintResult.success) {
          setLocationError("NFT minting failed");
          return;
        }
  
        console.log("NFT minted: ", mintResult);
        setImageUploaded(true);
      } catch (error) {
        console.error("Error uploading file to IPFS:", error);
        setLocationError("An unexpected error occurred");
      } finally {
        setMintLoader(false); // Always stop loader
      }
    }
  };  

  // Connect to user's wallet
  const handleConnectWallet = async () => {
    setConnectingWallet(true);
    setWalletError("");
    
    try {
      const address = await connectWallet();
      setWalletAddress(address);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setWalletError((error as Error).message);
    } finally {
      setConnectingWallet(false);
    }
  };

  // Send reward to user's wallet
  const handleClaimReward = async () => {
    if (!walletAddress) {
      setWalletError("Please connect your wallet first");
      return;
    }
    
    setSendingReward(true);
    setRewardResult(null);
    
    try {
      const result = await sendReward(walletAddress, REWARD_AMOUNT);
      setRewardResult(result);
    } catch (error) {
      console.error("Error sending reward:", error);
      setRewardResult({
        success: false,
        txHash: "",
        error: (error as Error).message
      });
    } finally {
      setSendingReward(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg text-gray-300">Loading nearby locations...</p>
      </div>
    );
  }

  // Error state
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

  // No places found state
  if (!currentPlace) {
    return (
      <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 shadow-xl">
        <p className="text-lg text-gray-300">No nearby locations found.</p>
      </div>
    );
  }

  // Game completed - show wallet connection and reward screen
  if (gameCompleted) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="p-8 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 shadow-xl">
          {/* Completion Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Congratulations!</h2>
            <p className="text-gray-400 mb-4">
              You've successfully completed all {places.length} locations! 
            </p>
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-6">
              <p className="text-green-300 font-medium">
                You've earned {REWARD_AMOUNT} ETH as a reward!
              </p>
            </div>
          </div>

          {/* Wallet Connection */}
          {!walletAddress ? (
            <div className="space-y-6">
              <p className="text-gray-300 text-center mb-4">
                Connect your wallet to claim your rewards
              </p>
              
              {walletError && (
                <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg mb-4">
                  <p className="text-sm text-red-300">{walletError}</p>
                </div>
              )}
              
              <button
                onClick={handleConnectWallet}
                disabled={connectingWallet}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all shadow-lg hover:shadow-blue-500/20 flex items-center justify-center disabled:opacity-70"
              >
                {connectingWallet ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting Wallet...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Connect Wallet
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between mb-4">
                <span className="text-gray-400">Wallet</span>
                <span className="text-white font-mono text-sm">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
              
              {rewardResult && (
                <div className={`p-4 rounded-lg ${
                  rewardResult.success 
                    ? "bg-green-900/30 border border-green-700" 
                    : "bg-red-900/30 border border-red-700"
                } mb-4`}>
                  <p className={`text-sm ${
                    rewardResult.success ? "text-green-300" : "text-red-300"
                  }`}>
                    {rewardResult.success 
                      ? `Success! Transaction sent: ${rewardResult.txHash.slice(0, 10)}...` &&
                      <a 
                        href={`${explorerBaseUrl}${rewardResult.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 mt-2 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View on Block Explorer</span>
                      </a>
                      : `Error: ${rewardResult.error}`}
                  </p>
                </div>
              )}
              
              <button
                onClick={handleClaimReward}
                disabled={sendingReward || rewardResult?.success}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all shadow-lg flex items-center justify-center ${
                  rewardResult?.success
                    ? "bg-green-600 text-white opacity-70 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:shadow-blue-500/20 disabled:opacity-70"
                }`}
              >
                {sendingReward ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Reward...
                    </>
                ) : rewardResult?.success ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Reward Claimed!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="16"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    Claim {REWARD_AMOUNT} ETH Reward
                  </>
                )}
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
    );
  }

  // Regular clue hunt UI
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

      {clueFound && <div className="flex flex-col items-center gap-3">
          {/* Preview */}
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-64 h-64 object-cover rounded-xl border border-gray-300 shadow-md"
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-xl text-gray-400 text-sm">
              No image selected
            </div>
          )}

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 rounded-lg shadow-sm border border-gray-300 transition"
          >
          {mintLoader && (
            <span className="absolute left-3">
              <svg
                className="animate-spin h-5 w-5 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            </span>
          )}
          <Camera className="w-5 h-5" />
          <span className={mintLoader ? "ml-4" : ""}>Take Photo</span>
        </button>


          {/* Hidden input */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>}

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