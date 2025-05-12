import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { calculateDistance, getCurrentLocation, detectCity } from "../utils/geoUtils";
import { connectWallet, sendReward, uploadToIPFS, mintNFT } from "../utils/web3Utils";
import { Camera, ArrowLeft, MapPin, Compass, Target, Award, CheckCircle, Trophy, Home } from "lucide-react";
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
  const [currentUserLocation, setCurrentUserLocation] = useState<UserLocationMinimal | null>(null);
  const [ImageUserMintData, setImageUserMintData] = useState<any[]>([]);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'welcome' | 'map' | 'clue' | 'reward' | 'final-reward'>('welcome');
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

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
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(0);

  // Manual wallet input states
  const [manualWalletAddress, setManualWalletAddress] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [showAddressInput, setShowAddressInput] = useState(true);

  // Validate Ethereum address format
  const validateEthAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Update validation on address change
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setManualWalletAddress(address);
    setIsValidAddress(validateEthAddress(address));
  };

  // Handle manual claim when user enters a wallet address
  const handleManualClaim = () => {
    if (isValidAddress) {
      console.log(manualWalletAddress)
      setWalletAddress(manualWalletAddress);
      setShowAddressInput(false);
      // Trigger claim after setting address
      setTimeout(() => {
        handleClaimReward();
      }, 500);
    }
  };

  // Load places from places.json and select random ones for this game
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
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

  // Helper function to shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

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
        // Show the file upload section
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
    
    // Reward view
    setActiveView('reward');
    
    setTimeout(() => {
      // If we're not at the last place, move to the next one
      if (currentPlaceIndex < places.length - 1) {
        setCurrentPlaceIndex(currentPlaceIndex + 1);
        setVerificationResult(null);
        setActiveView('map'); // Show map view after reward
      } else {
        // Last place verified - show reward screen with confetti
        setGameCompleted(true);
        setActiveView('final-reward');
        setConfettiActive(true);
        setTimeout(() => {
          setConfettiActive(false);
        }, 5000);
      }
    }, 5000); // Show reward for 5 seconds
    
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
        const newmetadata = {
          ipfs_url: ipfsUrl,
          latitude: currentUserLocation.latitude.toString(),
          longitude: currentUserLocation.longitude.toString(),
          city: city
        }
        setImageUserMintData(prevItems => [...prevItems, newmetadata]);
        
        // Set imageUploaded to true to trigger the effect that advances to the next clue
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
      setWalletConnected(true);
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
      console.log(walletAddress);
      console.log(ImageUserMintData, ImageUserMintData.length);
      for(let i = 0; i< ImageUserMintData.length; i++){
        console.log(ImageUserMintData)
        const mintResult = await mintNFT(
          walletAddress,
          ImageUserMintData[i].ipfs_url,
          ImageUserMintData[i].latitude,
          ImageUserMintData[i].longitude,
          ImageUserMintData[i].city
        );
        console.log(mintResult);
        if (!mintResult.success) {
          setLocationError("NFT minting failed");
          return;
        }
  
        console.log("NFT minted: ", mintResult);
      }
      const result = await sendReward(walletAddress, REWARD_AMOUNT);
      setRewardResult(result);
      
      // Show confetti on successful claim
      if (result.success) {
        setConfettiActive(true);
        setTimeout(() => {
          setConfettiActive(false);
        }, 5000);
      }
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

  // Start game handler
  const handleStartGame = () => {
    setGameStarted(true);
    setActiveView('map');
    
    // Mock connect wallet for demo
    if (!walletConnected) {
      setWalletAddress("0x....");
      setWalletConnected(true);
    }
  };

  // Handle clue selection from map
  const handleClueSelection = () => {
    setActiveView('clue');
  };

  // Handle collect reward button click
  const handleCollectNow = () => {
    setActiveView('final-reward');
    setConfettiActive(true);
    setTimeout(() => {
      setConfettiActive(false);
    }, 5000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute w-full h-full rounded-full border-4 border-t-[#6D3B00] border-r-[#6D3B00] border-b-[#6D3B00] border-l-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Image src="/compass.svg" alt="Compass" width={32} height={32} />
          </div>
        </div>
        <p className="text-lg text-[#6D3B00] font-serif">Charting the adventure...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center">
        <div className="max-w-md w-full p-8 bg-[url('/map-paper.svg')] bg-cover bg-center rounded-lg shadow-xl">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
              <Image src="/compass.svg" alt="Compass" width={40} height={40} className="opacity-50" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#6D3B00] mb-2">Navigation Error</h3>
            <p className="text-[#8B4513] mb-6 font-serif">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#8B4513] hover:bg-[#6D3B00] text-[#F5E6C8] rounded-lg transition-colors font-serif"
            >
              Rechart Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No places found state
  if (!currentPlace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center">
        <div className="max-w-md w-full p-8 bg-[url('/map-paper.svg')] bg-cover bg-center rounded-lg shadow-xl">
          <p className="text-lg text-[#6D3B00] font-serif text-center">No nearby treasures found on the map.</p>
        </div>
      </div>
    );
  }

  // Welcome screen
  if (!gameStarted && activeView === 'welcome') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center">
        <div className="max-w-md w-full relative">
          <div className="w-full h-full bg-[url('/map-paper.svg')] bg-cover bg-center p-8 pb-20 rounded-lg text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[#2C1206] flex items-center justify-center overflow-hidden border-2 border-[#8B4513]">
                  <Image src="/compass.svg" alt="Compass" width={60} height={60} />
                </div>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32">
                  <div className="w-full py-1 bg-[#2C1206] text-[#D4BE94] font-bold text-center rounded-b-lg border-2 border-t-0 border-[#8B4513]">
                    {walletConnected ? walletAddress.slice(0, 8) : 'Explorer'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-10 font-serif text-[#6D3B00]">
            <h2 className="text-xl font-bold mb-3">Adventure Awaits, Explorer!</h2>
            <p className="mb-4">
              Embark on a thrilling journey through hidden locations, where ancient treasures and crypto rewards await the brave. Each discovery is verified with privacy-preserving zero-knowledge proofs, ensuring your adventure remains yours alone.
            </p>
            <p className="mb-4">
              Follow the map, solve the clues, and capture evidence of your discoveries to earn exclusive on-chain rewards on BASE. With each location you conquer, your digital treasure chest grows!
            </p>
            <p className="text-sm italic">
              Will you be the one to claim the 0.01 ETH bounty and mint rare location-based NFTs that prove your exploits? Your quest begins with a single step...
            </p>
          </div>
            
            <div className="mt-8">
              <button 
                onClick={handleStartGame}
                className="relative focus:outline-none transform hover:scale-105 transition-transform"
              >
                <Image 
                  src="/Start_Button.png"
                  alt="Start Game"
                  width={180}
                  height={60}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Map view
  if (activeView === 'map') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center">
        <div className="max-w-md w-full relative">
          <div className="w-full min-h-[600px] bg-[url('/map-paper.svg')] bg-cover bg-center p-6 rounded-lg">
            {/* Map nodes */}
            <div className="relative h-[500px]">
              {/* Top navigation elements */}
              <div className="flex justify-center gap-4 mb-8">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-10 h-10 rounded-full bg-[#211510] border ${i <= currentPlaceIndex ? 'border-[#D4BE94]' : 'border-[#211510]/50'} flex items-center justify-center`}
                  >
                    {i < currentPlaceIndex && (
                      <span className="text-[#D4BE94] text-xs">✓</span>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Map nodes with connections */}
              <div className="relative h-[350px]">
                {/* Node connections - dotted lines */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <line x1="150" y1="80" x2="250" y2="150" stroke="#211510" strokeWidth="2" strokeDasharray="5,5" />
                  <line x1="250" y1="150" x2="150" y2="220" stroke="#211510" strokeWidth="2" strokeDasharray="5,5" />
                  <line x1="150" y1="220" x2="250" y2="290" stroke="#211510" strokeWidth="2" strokeDasharray="5,5" />
                </svg>
                
                {/* Map nodes */}
                {[
                  { top: 60, left: 150, completed: currentPlaceIndex > 0 },
                  { top: 150, left: 250, completed: currentPlaceIndex > 1, active: currentPlaceIndex === 1 },
                  { top: 220, left: 150, completed: currentPlaceIndex > 2, active: currentPlaceIndex === 2 },
                  { top: 290, left: 250, active: currentPlaceIndex === 3 }
                ].map((node, i) => (
                  <div 
                    key={i}
                    className={`absolute w-14 h-14 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 ${
                      i === currentPlaceIndex ? 'bg-[#6D3B00] border-2 border-[#D4BE94] cursor-pointer' : 
                      i < currentPlaceIndex ? 'bg-[#211510] border-2 border-[#D4BE94]' : 
                      'bg-[#211510]/50 border-2 border-[#211510]/30'
                    }`}
                    style={{ top: node.top, left: node.left }}
                    onClick={i === currentPlaceIndex ? handleClueSelection : undefined}
                  >
                    <Image src="/compass.svg" alt="Compass" width={24} height={24} className={i < currentPlaceIndex ? 'opacity-70' : 'opacity-100'} />
                  </div>
                ))}
              </div>
              
              {/* Map legend/chest icon */}
              <div className="absolute bottom-0 right-0">
                <Image src="/png_clipart_buried_treasure.svg" alt="Treasure" width={60} height={60} />
              </div>
            </div>
            
            {/* Footer with user profile and points */}
            <div className="flex items-center justify-between bg-[#2C1206] rounded-lg p-2 px-4 border border-[#8B4513]">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#211510] border border-[#D4BE94] flex items-center justify-center overflow-hidden">
                  <Image src="/compass.svg" alt="User" width={20} height={20} />
                </div>
                <span className="text-[#D4BE94] font-bold">{walletAddress.slice(0, 8)}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#211510] px-3 py-1 rounded-full border border-[#8B4513]">
                <span className="text-[#D4BE94] font-bold">Decode Quests</span>
                <Image src="/compass.svg" alt="Points" width={16} height={16} />
              </div>
            </div>
          </div>
          
          {/* Home Button - More Visible Quit */}
          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.href = "/"}
              className="px-4 py-2 bg-[#2C1206] text-[#D4BE94] rounded-lg hover:bg-[#8B4513] border border-[#8B4513] transition-colors flex items-center justify-center mx-auto"
            >
              <Home className="h-4 w-4 mr-2" />
              Return to Map
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Clue view
  if (activeView === 'clue') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center">
        <div className="max-w-md w-full relative">
          {/* Clue stone at the top */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <Image src="/clue-stone.svg" alt="Clue Stone" width={120} height={40} />
          </div>
          
          {/* Clue paper */}
          <div className="w-full bg-[url('/map-paper.svg')] bg-cover bg-center p-6 pt-10 rounded-lg relative">
            {/* Clue content */}
            <div className="bg-[#2C1206] border-4 border-[#D4BE94] rounded-lg p-4 text-[#D4BE94] mb-6">
              <div className="flex items-center justify-between border-b border-[#D4BE94]/30 pb-2 mb-4">
                <div className="flex items-center gap-2">
                  <Image src="/compass.svg" alt="Clue" width={20} height={20} />
                  <h3 className="font-bold font-serif text-lg">Clue {currentPlaceIndex + 1}</h3>
                </div>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full bg-[#D4BE94]/30"></div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-5">
                  <div className="mb-4">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[#D4BE94] font-bold">I</span>
                    </div>
                    <p className="text-sm font-serif">{currentPlace.clue}</p>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[#D4BE94] font-bold">II</span>
                    </div>
                    <p className="text-sm font-serif">Look for landmarks or distinctive features near {currentPlace.name}. The treasure is within {currentPlace.thresholdDistance}m radius.</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[#D4BE94] font-bold">III</span>
                    </div>
                    <p className="text-sm font-serif">Current distance: {Math.round(distances[currentPlace.id])}m. Get closer to verify your discovery and earn rewards!</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-4 text-xs border-t border-[#D4BE94]/30 pt-2">
                <p>Clue {currentPlaceIndex + 1} - ({currentPlace.city}, {Math.round(distances[currentPlace.id])}m away)</p>
              </div>
            </div>
            
            {/* Verification result */}
            {verificationResult && (
              <div className={`mb-4 p-3 rounded-lg text-center ${
                verificationResult.success ? "bg-[#2C5E1E]/30 border border-[#4CAF50]" : "bg-[#5E1E1E]/30 border border-[#AF4C4C]"
              }`}>
                <p className={`text-sm ${
                  verificationResult.success ? "text-[#4CAF50]" : "text-[#AF4C4C]"
                }`}>
                  {verificationResult.message}
                </p>
              </div>
            )}
            
            {/* Location error */}
            {locationError && (
              <div className="mb-4 p-3 bg-[#5E1E1E]/30 border border-[#AF4C4C] rounded-lg text-center">
                <p className="text-sm text-[#AF4C4C]">{locationError}</p>
              </div>
            )}
            
            {/* Photo upload section - only show when clue is found */}
            {clueFound && (
              <div className="mt-6 space-y-4">
                {/* Preview section */}
                {previewUrl ? (
                  <div className="bg-[#211510] p-3 rounded-lg border-2 border-[#D4BE94] flex justify-center">
                    <div className="relative w-64 h-64 overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Treasure Evidence"
                        className="w-full h-full object-cover rounded-lg border-2 border-[#8B4513]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#211510] p-4 rounded-lg border-2 border-dashed border-[#D4BE94] flex flex-col items-center justify-center h-40">
                    <Camera className="h-8 w-8 text-[#D4BE94] mb-2" />
                    <p className="text-[#D4BE94] text-sm text-center font-serif">
                      Capture evidence of your discovery
                    </p>
                    <p className="text-[#D4BE94]/60 text-xs text-center mt-1 font-serif">
                      Take a photo to claim your reward
                    </p>
                  </div>
                )}

                {/* Take photo button */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative focus:outline-none transform hover:scale-105 transition-transform"
                    disabled={mintLoader}
                  >
                    {mintLoader ? (
                      <div className="flex items-center justify-center gap-2 w-40 h-10 bg-[#8B4513]/70 text-[#D4BE94] rounded-lg">
                        <div className="w-4 h-4 border-2 border-[#D4BE94] border-t-transparent rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <div className="bg-[#2C1206] text-[#D4BE94] px-6 py-3 rounded-lg border border-[#8B4513] flex items-center justify-center hover:bg-[#8B4513] transition-colors">
                        <Camera className="h-5 w-5 mr-2" />
                        <span className="font-serif">Capture Image</span>
                      </div>
                    )}
                  </button>
                  
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment" /* This forces the camera to open on mobile devices */
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            {!clueFound && (
              <div className="flex justify-center">
                <button
                  onClick={handleVerifyLocation}
                  disabled={verifying}
                  className="relative focus:outline-none transform hover:scale-105 transition-transform"
                >
                  {verifying ? (
                    <div className="flex items-center justify-center gap-2 w-32 h-10 bg-[#8B4513]/70 text-[#D4BE94] rounded-lg">
                      <div className="w-4 h-4 border-2 border-[#D4BE94] border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <Image 
                      src="/Verify_Button.png" 
                      alt="Verify Location" 
                      width={180} 
                      height={60} 
                    />
                  )}
                </button>
              </div>
            )}
            
            {/* Distance indicator */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-[#6D3B00] text-xs mb-1">
                <span>Distance to location:</span>
                <span className="font-medium">
                  {distances[currentPlace.id] < 1000 
                    ? `${Math.round(distances[currentPlace.id])}m` 
                    : `${(distances[currentPlace.id] / 1000).toFixed(2)}km`}
                </span>
              </div>
              <div className="w-full h-2 bg-[#D4BE94]/30 rounded-full">
                <div 
                  className={`h-2 rounded-full ${
                    distances[currentPlace.id] <= currentPlace.thresholdDistance 
                      ? "bg-[#4CAF50]" 
                      : distances[currentPlace.id] <= currentPlace.thresholdDistance * 2 
                        ? "bg-[#FFEB3B]" 
                        : "bg-[#AF4C4C]"
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
            
            {/* Quit Hunt button - More visible */}
            <div className="mt-6 text-center">
              <button
                onClick={() => window.location.href = "/"}
                className="px-4 py-2 bg-[#2C1206] text-[#D4BE94] rounded-lg hover:bg-[#8B4513] border border-[#8B4513] transition-colors flex items-center justify-center mx-auto"
              >
                <Home className="h-4 w-4 mr-2" />
                Return to Map
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reward view after completing a clue
  if (activeView === 'reward') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center">
        <div className="max-w-md w-full">
          <div className="w-full bg-[#2C1206] rounded-xl p-8 text-center">
            <div className="mb-6">
              <Image 
                src="/png_clipart_buried_treasure.svg" 
                alt="Treasure Chest" 
                width={150} 
                height={150} 
                className="mx-auto" 
              />
            </div>
            
            <h2 className="text-[#D4BE94] text-2xl font-serif mb-4">Amazing! You found {currentPlace.name}!</h2>
            
            <div className="text-[#D4BE94] font-serif mb-6 text-lg">
              {currentPlaceIndex < places.length - 1 ? (
                <>You are making great progress! Just {places.length - currentPlaceIndex - 1} more location{places.length - currentPlaceIndex - 1 > 1 ? 's' : ''} to find.</>
              ) : (
                <>You've found all the locations! Time to claim your rewards.</>
              )}
            </div>
            
            {currentPlaceIndex < places.length - 1 ? (
              <p className="text-[#D4BE94]/80 text-sm font-serif mb-4">
                Moving to next location...
              </p>
            ) : (
              <div className="flex justify-center">
                <button 
                  onClick={handleCollectNow}
                  className="bg-[#8B4513] text-[#D4BE94] px-6 py-3 rounded-lg border border-[#D4BE94] flex items-center justify-center hover:bg-[#6D3B00] transition-colors"
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  <span className="font-serif">Collect Rewards</span>
                </button>
              </div>
            )}
            
            {/* Quit Hunt button - more visible */}
            <div className="mt-6 text-center">
              <button
                onClick={() => window.location.href = "/"}
                className="px-4 py-2 bg-[#211510] text-[#D4BE94] rounded-lg hover:bg-[#8B4513] border border-[#8B4513] transition-colors flex items-center justify-center mx-auto"
              >
                <Home className="h-4 w-4 mr-2" />
                Return to Map
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Final reward view - show wallet connection and reward screen
  if (activeView === 'final-reward') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center">
        {/* Confetti animation */}
        {confettiActive && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-3 h-3 rounded-full animate-confetti"
                style={{
                  backgroundColor: ['#FFD700', '#FF8C00', '#FF4500', '#9ACD32', '#00BFFF'][Math.floor(Math.random() * 5)],
                  left: `${Math.random() * 100}vw`,
                  top: `-5vh`,
                  animationDuration: `${1 + Math.random() * 3}s`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              ></div>
            ))}
          </div>
        )}
        
        <div className="max-w-md w-full">
          <div className="w-full bg-[url('/map-bg.svg')] bg-cover bg-center p-8 rounded-lg">
            {/* Completion Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto bg-[#2C1206] rounded-full border-2 border-[#D4BE94] flex items-center justify-center mb-4">
                <Trophy className="h-8 w-8 text-[#FFD700]" />
              </div>
              <h2 className="text-2xl font-bold text-[#6D3B00] mb-2 font-serif">Adventure Completed!</h2>
              <p className="text-[#8B4513] mb-4 font-serif">
                You've successfully discovered all {places.length} treasures! 
              </p>
              <div className="bg-[#2C1206]/20 border border-[#8B4513] rounded-lg p-4 mb-6">
                <p className="text-[#8B4513] font-medium font-serif">
                  You've earned {REWARD_AMOUNT} ETH and {completedPlaces.length} unique NFTs!
                </p>
              </div>
            </div>

            {/* Wallet Connection or Manual Address Input */}
            {!walletAddress || walletAddress === "0x...." ? (
              <div className="space-y-6">
                {walletError && (
                  <div className="p-3 bg-[#5E1E1E]/30 border border-[#AF4C4C] rounded-lg mb-4">
                    <p className="text-sm text-[#AF4C4C]">{walletError}</p>
                  </div>
                )}
                
                {/* Toggle between wallet connect and address input */}
                <div className="mb-4">
                  <div className="flex justify-center space-x-4 mb-4">
                    <button 
                      onClick={() => setShowAddressInput(true)}
                      className={`px-4 py-2 rounded-lg font-serif text-sm ${showAddressInput ? 'bg-[#6D3B00] text-[#D4BE94]' : 'bg-[#2C1206]/30 text-[#8B4513]'}`}
                    >
                      Enter Address
                    </button>
                    <button 
                      onClick={() => setShowAddressInput(false)}
                      className={`px-4 py-2 rounded-lg font-serif text-sm ${!showAddressInput ? 'bg-[#6D3B00] text-[#D4BE94]' : 'bg-[#2C1206]/30 text-[#8B4513]'}`}
                    >
                      Connect Wallet
                    </button>
                  </div>
                </div>
                
                {showAddressInput ? (
                  <div className="space-y-4">
                    {/* Wallet address input field - ENHANCED */}
                    <div className="space-y-2">
                      <label className="block text-[#D4BE94] text-lg font-bold font-serif text-center mb-3">
                        Enter Your Wallet Address
                      </label>
                      
                      <div className="relative">
                        <input
                          type="text"
                          onChange={handleAddressChange}
                          placeholder="0x..."
                          className="w-full p-5 bg-[#211510] border-4 border-[#D4BE94] rounded-lg text-[#F5E6C8] font-mono text-lg placeholder-[#8B4513]/50 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#D4BE94] shadow-lg"
                        />
                        {manualWalletAddress && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isValidAddress ? (
                              <div className="w-7 h-7 rounded-full bg-[#4CAF50]/40 flex items-center justify-center p-1">
                                <CheckCircle className="h-5 w-5 text-[#4CAF50]" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[#AF4C4C]/40 flex items-center justify-center p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#AF4C4C]" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-[#D4BE94]/80 text-sm font-serif text-center">
                        Enter your Ethereum wallet address to receive {REWARD_AMOUNT} ETH and NFT rewards
                      </p>
                    </div>
                    
                    <div className="text-center mt-6">
                      <button
                        onClick={handleManualClaim}
                        disabled={!isValidAddress}
                        className={`bg-[#8B4513] text-[#D4BE94] px-6 py-3 rounded-lg border border-[#D4BE94] flex items-center justify-center hover:bg-[#6D3B00] transition-colors mx-auto ${!isValidAddress ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Trophy className="h-5 w-5 mr-2" />
                        <span className="font-serif">Claim Reward</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-[#6D3B00] text-center mb-4 font-serif">
                      Connect your wallet to claim your rewards
                    </p>
                    
                    <button
                      onClick={handleConnectWallet}
                      disabled={connectingWallet}
                      className="w-full py-3 px-4 rounded-lg bg-[#8B4513] hover:bg-[#6D3B00] text-[#D4BE94] font-medium transition-all flex items-center justify-center disabled:opacity-70"
                    >
                      {connectingWallet ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2 text-[#D4BE94]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-[#2C1206]/20 p-4 rounded-lg flex items-center justify-between mb-4">
                  <span className="text-[#8B4513]">Wallet</span>
                  <span className="text-[#6D3B00] font-mono text-sm">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>
                
                {rewardResult && (
                  <div className={`p-4 rounded-lg ${
                    rewardResult.success 
                      ? "bg-[#2C5E1E]/30 border border-[#4CAF50]" 
                      : "bg-[#5E1E1E]/30 border border-[#AF4C4C]"
                  } mb-4`}>
                    <p className={`text-sm ${
                      rewardResult.success ? "text-[#4CAF50]" : "text-[#AF4C4C]"
                    }`}>
                      {rewardResult.success 
                        ? (
                          <div>
                            <p>Success! Transaction sent: {rewardResult.txHash.slice(0, 10)}...</p>
                            <a 
                              href={`${explorerBaseUrl}${rewardResult.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-[#4CAF50]/80 hover:text-[#4CAF50] mt-2 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              <span>View on Block Explorer</span>
                            </a>
                          </div>
                        )
                        : `Error: ${rewardResult.error}`}
                    </p>
                  </div>
                )}
                
                <button
                  onClick={handleClaimReward}
                  disabled={sendingReward || rewardResult?.success}
                  className={`w-full py-3 px-4 rounded-lg bg-[#8B4513] hover:bg-[#6D3B00] text-[#D4BE94] font-medium transition-all flex items-center justify-center ${sendingReward || rewardResult?.success ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {sendingReward ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-[#D4BE94]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Claiming Reward...
                    </>
                  ) : rewardResult?.success ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Reward Claimed!
                    </>
                  ) : (
                    <>
                      <Trophy className="h-5 w-5 mr-2" />
                      Claim Reward
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
          
          {/* Home button - more visible */}
          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.href = "/"}
              className="px-4 py-2 bg-[#2C1206] text-[#D4BE94] rounded-lg hover:bg-[#8B4513] border border-[#8B4513] transition-colors flex items-center justify-center mx-auto"
            >
              <Home className="h-4 w-4 mr-2" />
              Return to Map
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback/default view - should never reach here with proper state management
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center">
      <button
        onClick={() => window.location.href = "/"}
        className="px-4 py-2 bg-[#2C1206] text-[#D4BE94] rounded-lg hover:bg-[#8B4513] border border-[#8B4513] transition-colors flex items-center justify-center"
      >
        <Home className="h-4 w-4 mr-2" />
        Return to Map
      </button>
    </div>
  );
}

// Add global confetti animation styles
const globalStyles = `
@keyframes confetti {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
.animate-confetti {
  animation: confetti 3s ease-in-out forwards;
}
`;

// Add global styles to the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = globalStyles;
  document.head.appendChild(style);
}