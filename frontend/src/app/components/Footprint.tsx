"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { MapContainer, TileLayer, Circle, Popup, AttributionControl } from "react-leaflet";
import { Share2, Trophy, Map as MapIcon, X, Camera, ChevronRight, User } from "lucide-react";
import "leaflet/dist/leaflet.css";
import Image from "next/image";
import contractData from "../../../abi/LocationPOAP.json";

// Contract configuration
const CONTRACT_ADDRESS = contractData.address;
const BASE_CHAIN_ID = 84532;
const BASE_RPC = process.env.NEXT_PUBLIC_RPC_URL;

// ABI from imported contract data
const ABI = contractData.abi;

interface POAP {
  title: string;
  latitude: string;
  longitude: string;
  ipfs: string;
}

interface LeaderboardEntry {
  user: string;
  poaps: ethers.BigNumberish;
}

export default function Footprints() {
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [userPoaps, setUserPoaps] = useState<POAP[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom, setMapZoom] = useState<number>(2);
  const [shareStatus, setShareStatus] = useState<string>("");
  const [newAddress, setNewAddress] = useState<string>("");

  // Initialize web3 connection
  const initWeb3 = async () => {
    setLoading(true);
    setError("");

    try {
      console.log('starting..')
      const web3Provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
      const network = await web3Provider.getNetwork();
      const chainId = Number(network.chainId);
      
      if (chainId !== BASE_CHAIN_ID) {
        await switchToBase();
      }

      const web3Contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, web3Provider);
      setProvider(web3Provider);
      setContract(web3Contract);
      setWalletAddress(newAddress);

      // Load user data first then leaderboard
      await loadUserData(web3Contract, newAddress);
      await loadLeaderboard(web3Contract);

      // Center map on user's most recent POAP if one exists
      setTimeout(() => centerMapOnRecentPOAP(), 500); // Add a slight delay to ensure map is initialized
    } catch (error) {
      console.error("Error initializing Web3:", error);
      setError("Failed to connect wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Switch to Base network
  const switchToBase = async () => {
    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
            chainName: "Base Sepolia",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: [BASE_RPC || "https://sepolia.base.org"],
          }],
        });
      } else {
        throw error;
      }
    }
  };

  // Load user's POAPs
  const loadUserData = async (contract: ethers.Contract, address: string) => {
    try {
      console.log("Fetching POAPs for address:", address);
      const poaps = await contract.get_user_poaps(address);
      console.log("POAPs received:", poaps);
      setUserPoaps(poaps);
    } catch (error) {
      console.error("Error loading user data:", error);
      setError("Failed to load your POAPs. Please try again.");
    }
  };

  // Load leaderboard data
  const loadLeaderboard = async (contract: ethers.Contract) => {
    try {
      console.log("Fetching leaderboard data");
      const poapCounts = await contract.get_all_user_poaps_count();
      console.log("Leaderboard data received:", poapCounts);
      
      const sorted = [...poapCounts].sort((a, b) => {
        const aCount = Number(a.poaps.toString());
        const bCount = Number(b.poaps.toString());
        return bCount - aCount;
      });
      
      setLeaderboard(sorted);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      setError("Failed to load leaderboard data.");
    }
  };

  // Center map on most recent POAP
  const centerMapOnRecentPOAP = () => {
    if (userPoaps.length > 0) {
      const mostRecent = userPoaps[userPoaps.length - 1];
      const lat = parseFloat(mostRecent.latitude);
      const lng = parseFloat(mostRecent.longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter([lat, lng]);
        setMapZoom(15); // Higher zoom level for better visibility
      }
    }
  };

  // Share on Twitter/X
  const shareOnTwitter = () => {
    if (userPoaps.length === 0) {
      setError("You don't have any locations to share yet!");
      return;
    }

    try {
      // Create a message about the user's exploration
      const locationCount = userPoaps.length;
      const latestLocation = userPoaps[userPoaps.length - 1].title;
      
      const tweetText = `I've explored ${locationCount} unique locations on Treasure Quest! My latest discovery: ${latestLocation}. Join the adventure and earn rewards with privacy-preserving verification! #TreasureQuest #ZeroKnowledge`;
      
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      window.open(twitterUrl, '_blank');
      
      setShareStatus("Share window opened!");
      setTimeout(() => setShareStatus(""), 3000);
    } catch (error) {
      console.error("Error sharing:", error);
      setError("Failed to open sharing window.");
    }
  };

  return (
    <div className="min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center text-[#3A2A18] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl font-bold mb-4 text-[#6D3B00]">
            Your Exploration Footprints
          </h1>
          <p className="font-serif text-lg max-w-2xl mx-auto mb-8 text-[#5E4B32]">
            View the locations you've discovered on your treasure hunt, securely verified with zero-knowledge proofs
          </p>
          
          {!walletAddress ? (
            <div className="max-w-md mx-auto">
              <div className="relative mb-4">
                <input
                  type="text"
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Enter your wallet address (0x...)"
                  className="w-full p-3 bg-[#FBF6E9] border-2 border-[#8B4513] rounded-md text-[#3A2A18] placeholder-[#8B4513]/50 font-serif"
                />
              </div>
              <button
                onClick={initWeb3}
                disabled={loading}
                className="px-6 py-3 bg-[#6D3B00] text-[#FBF6E9] rounded-md font-bold hover:bg-[#8B4513] transition-colors shadow-lg flex items-center justify-center mx-auto"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#FBF6E9] border-t-transparent rounded-full animate-spin mr-2"></div>
                    Loading Treasures...
                  </>
                ) : (
                  <>
                    <User className="h-5 w-5 mr-2" />
                    View My Adventures
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="px-4 py-2 rounded-md bg-[#211510] text-[#E6C887] font-mono text-sm">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
              <button
                onClick={shareOnTwitter}
                className="px-6 py-3 rounded-md bg-[#6D3B00] hover:bg-[#8B4513] text-[#FBF6E9] font-medium transition-colors flex items-center justify-center"
              >
                <X className="h-4 w-4 mr-2" />
                Share Your Journey
              </button>
              {shareStatus && (
                <span className="text-[#006400] text-sm animate-pulse font-serif">{shareStatus}</span>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mx-auto max-w-md bg-[#5C0000]/20 border-2 border-[#8B0000] text-[#8B0000] rounded-md p-4 mb-8 text-center font-serif">
            {error}
          </div>
        )}

        {/* Main content */}
        {walletAddress ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map view */}
            <div className="lg:col-span-2 bg-[#FBF6E9] rounded-md overflow-hidden border-4 border-[#8B4513] shadow-xl relative">
              {/* Map decorative elements */}
              <div className="absolute top-0 left-0 w-full h-16 bg-[url('/map-border-top.svg')] bg-repeat-x z-10 pointer-events-none opacity-40"></div>
              <div className="absolute bottom-0 left-0 w-full h-16 bg-[url('/map-border-bottom.svg')] bg-repeat-x z-10 pointer-events-none opacity-40"></div>
              <div className="absolute left-0 top-0 w-16 h-full bg-[url('/map-border-left.svg')] bg-repeat-y z-10 pointer-events-none opacity-40"></div>
              <div className="absolute right-0 top-0 w-16 h-full bg-[url('/map-border-right.svg')] bg-repeat-y z-10 pointer-events-none opacity-40"></div>
              
              <div className="absolute top-4 right-4 w-24 h-24 z-10 pointer-events-none">
                <Image src="/compass.svg" alt="Compass Rose" width={96} height={96} className="opacity-70" />
              </div>
              
              <div className="h-[500px]" id="map-container">
                {typeof window !== 'undefined' && (
                  <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{
                      height: "100%", 
                      width: "100%",
                      borderRadius: "0.375rem",
                      boxShadow: "inset 0 0 20px rgba(0,0,0,0.2)"
                    }}
                    className="z-0"
                    minZoom={2}
                    maxZoom={18}
                    attributionControl={false} 
                    zoomControl={true}
                    zoomAnimation={true}
                    markerZoomAnimation={true}
                    fadeAnimation={true}
                  >
                    {/* Add attribution control with custom position */}
                    <AttributionControl position="bottomleft" />
                    
                    {/* Primary tile layer - CartoDB Dark Matter */}
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                      subdomains="abcd"
                      maxZoom={20}
                    />
                    
                    {/* Add a subtle grid layer for the "treasure map" effect */}
                    <TileLayer
                      url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}{r}.png"
                      opacity={0.15}
                      attribution=""
                    />
                    
                    {userPoaps.map((poap, index) => {
                      const lat = parseFloat(poap.latitude);
                      const lng = parseFloat(poap.longitude);
                      if (!isNaN(lat) && !isNaN(lng)) {
                        return (
                          <Circle
                            key={index}
                            center={[lat, lng]}
                            radius={300}
                            pathOptions={{
                              color: '#E6C887',
                              fillColor: '#C28B4B',
                              fillOpacity: 0.7,
                              weight: 2
                            }}
                          >
                            <Popup className="treasure-popup">
                              <div className="font-serif text-[#6D3B00] font-bold">{poap.title}</div>
                              <a
                                href={`https://ipfs.io/ipfs/${poap.ipfs}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#8B4513] text-xs hover:underline font-serif flex items-center"
                              >
                                View Treasure <ChevronRight className="h-3 w-3" />
                              </a>
                            </Popup>
                          </Circle>
                        );
                      }
                      return null;
                    })}
                  </MapContainer>
                )}
              </div>
              <div className="p-4 bg-[#211510] border-t-2 border-[#8B4513]">
                <h3 className="font-serif font-medium text-[#E6C887] flex items-center">
                  <MapIcon className="h-4 w-4 mr-2" />
                  Your Exploration Map
                </h3>
                <p className="text-sm text-[#C28B4B] mt-1 font-serif">
                  You've discovered {userPoaps.length} unique treasure{userPoaps.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-[url('/parchment-bg.svg')] bg-cover bg-center rounded-md border-2 border-[#8B4513] shadow-xl overflow-hidden">
              <div className="p-4 border-b-2 border-[#8B4513]/50">
                <h2 className="font-serif font-bold text-xl text-[#6D3B00] flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-[#C9B037]" />
                  Explorer Leaderboard
                </h2>
              </div>
              <div className="p-4">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-[#5E4B32] font-serif">
                    <div className="w-8 h-8 border-2 border-[#8B4513] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    Consulting the map...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.slice(0, 10).map((item, index) => (
                      <div
                        key={index}
                        className={`flex justify-between items-center p-3 rounded-md ${
                          item.user.toLowerCase() === walletAddress.toLowerCase()
                            ? "bg-[#FBF6E9]/70 border-2 border-[#8B4513]" 
                            : "bg-[#FBF6E9]/40 border border-[#8B4513]/30"
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 text-xs font-bold ${
                            index === 0 ? "bg-[#C9B037] text-[#211510]" :
                            index === 1 ? "bg-[#C0C0C0] text-[#211510]" :
                            index === 2 ? "bg-[#CD7F32] text-[#211510]" :
                            "bg-[#8B4513]/20 text-[#6D3B00]"
                          }`}>
                            {index + 1}
                          </div>
                          <span className="font-serif font-medium text-sm text-[#6D3B00]">
                            {item.user.toLowerCase() === walletAddress.toLowerCase()
                              ? "You"
                              : `${item.user.slice(0, 6)}...${item.user.slice(-4)}`}
                          </span>
                        </div>
                        <span className="bg-[#8B4513] text-[#FBF6E9] text-xs px-2 py-1 rounded-full font-serif">
                          {item.poaps.toString()} treasures
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Placeholder when wallet not connected
          <div className="text-center p-8 bg-[url('/parchment-bg.svg')] bg-cover bg-center rounded-md border-2 border-[#8B4513] max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto">
              <Image src="/compass.svg" alt="Compass" width={80} height={80} className="opacity-80" />
            </div>
            <h3 className="text-xl font-medium text-[#6D3B00] mb-2 font-serif">Add Your Wallet</h3>
            <p className="text-[#5E4B32] mb-4 font-serif">
              Enter your wallet address to view your exploration history and treasures on the map
            </p>
          </div>
        )}

        {/* POAP Gallery */}
        {walletAddress && userPoaps.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px bg-[#8B4513]/50 w-24"></div>
              <h2 className="text-2xl font-bold text-center text-[#6D3B00] font-serif">
                YOUR TREASURES
              </h2>
              <div className="h-px bg-[#8B4513]/50 w-24"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPoaps.map((poap, index) => (
                <div 
                  key={index} 
                  className="bg-[url('/card.svg')] bg-cover bg-center p-6 rounded-md border-2 border-[#8B4513] hover:shadow-xl transition-all relative overflow-hidden"
                >
                  <h3 className="text-lg font-bold mb-4 text-[#6D3B00] font-serif">{poap.title}</h3>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-[#5E4B32] flex items-start font-serif">
                      <span className="font-mono text-xs bg-[#211510] text-[#E6C887] rounded px-2 py-1 mr-2 flex-shrink-0">LAT</span>
                      <span className="text-[#6D3B00]">{poap.latitude.substring(0, 8)}</span>
                    </p>
                    <p className="text-sm text-[#5E4B32] flex items-start font-serif">
                      <span className="font-mono text-xs bg-[#211510] text-[#E6C887] rounded px-2 py-1 mr-2 flex-shrink-0">LNG</span>
                      <span className="text-[#6D3B00]">{poap.longitude.substring(0, 8)}</span>
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <a
                      href={`https://ipfs.io/ipfs/${poap.ipfs}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#8B4513] hover:text-[#6D3B00] text-sm flex items-center transition-colors font-serif"
                    >
                      View Treasure
                      <Share2 className="h-3 w-3 ml-1" />
                    </a>
                    <span className="text-xs text-[#5E4B32] font-serif">#{index + 1}</span>
                  </div>
                  
                  {/* Decorative corner elements */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#8B4513]/50"></div>
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#8B4513]/50"></div>
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#8B4513]/50"></div>
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#8B4513]/50"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Journey Section */}
        {walletAddress && userPoaps.length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-[url('/parchment-bg.svg')] bg-cover bg-center rounded-md border-2 border-[#8B4513] shadow-xl p-6 max-w-md mx-auto">
              <h3 className="text-xl font-bold mb-3 text-[#6D3B00] font-serif">Share Your Journey</h3>
              <p className="text-[#5E4B32] mb-6 font-serif">
                Showcase your exploration achievements with friends and fellow adventurers
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={shareOnTwitter}
                  className="px-6 py-3 rounded-md bg-[#6D3B00] hover:bg-[#8B4513] text-[#FBF6E9] font-medium transition-colors flex items-center justify-center font-serif"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capture & Share
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Back to Home button */}
        <div className="mt-12 text-center">
          <a 
            href="/"
            className="inline-flex items-center text-[#6D3B00] hover:text-[#8B4513] transition-colors font-serif"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Return to the Map
          </a>
        </div>
      </div>
      
      {/* Custom styles */}
      <style jsx global>{`
        .treasure-popup .leaflet-popup-content-wrapper {
          background-color: #FBF6E9;
          border: 2px solid #8B4513;
          border-radius: 4px;
        }
        .treasure-popup .leaflet-popup-tip {
          background-color: #8B4513;
        }
        .leaflet-container {
          font-family: serif;
        }
        
        /* Subtle animation for the map loading */
        @keyframes mapFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        #map-container .leaflet-container {
          animation: mapFadeIn 0.8s ease-in-out;
        }
        
        /* Make the circles pulse gently to draw attention */
        @keyframes circlePulse {
          0% { stroke-opacity: 0.7; }
          50% { stroke-opacity: 1; }
          100% { stroke-opacity: 0.7; }
        }
        .leaflet-interactive {
          animation: circlePulse 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}