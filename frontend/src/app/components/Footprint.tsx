"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import { Share2, Trophy, Map, User, X, Camera } from "lucide-react";
import "leaflet/dist/leaflet.css";
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
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [userPoaps, setUserPoaps] = useState<POAP[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom, setMapZoom] = useState<number>(2);
  const [shareStatus, setShareStatus] = useState<string>("");

  // Initialize web3 connection
  const initWeb3 = async () => {
    if (typeof window === 'undefined' || typeof (window as any).ethereum === "undefined") {
      setError("Please install MetaMask!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const ethereum = (window as any).ethereum;
      const web3Provider = new ethers.BrowserProvider(ethereum);
      await ethereum.request({ method: "eth_requestAccounts" });
      const web3Signer = await web3Provider.getSigner();
      
      const network = await web3Provider.getNetwork();
      const chainId = Number(network.chainId);
      
      if (chainId !== BASE_CHAIN_ID) {
        await switchToBase();
      }

      const web3Contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, web3Signer);
      const address = await web3Signer.getAddress();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(web3Contract);
      setWalletAddress(address);

      // Load user data first then leaderboard
      await loadUserData(web3Contract, address);
      await loadLeaderboard(web3Contract);

      // Center map on user's most recent POAP if one exists
      centerMapOnRecentPOAP();
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
      
      // Sort by number of POAPs (descending) - Handle different formats safely
      const sorted = [...poapCounts].sort((a, b) => {
        // Get numeric values regardless of format
        const aCount = Number(a.poaps.toString());
        const bCount = Number(b.poaps.toString());
        return bCount - aCount; // Compare as numbers
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
        setMapZoom(11);
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
      
      const tweetText = `I've explored ${locationCount} unique locations on Eureka! My latest discovery: ${latestLocation}. Join the treasure hunt and earn rewards with privacy-preserving verification! #Eureka #ScavengerHunt`;
      
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Your Exploration Footprints
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
            View all the locations you've discovered and verified with zero-knowledge proofs, securely stored on base.
          </p>
          
          {!walletAddress ? (
            <button
              onClick={initWeb3}
              disabled={loading}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center mx-auto"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <User className="h-5 w-5 mr-2" />
                  Connect Wallet
                </>
              )}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="px-4 py-2 rounded-lg bg-gray-800/70 text-blue-300 font-mono text-sm">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
              <button
                onClick={shareOnTwitter}
                className="px-6 py-3 rounded-lg bg-[#1DA1F2] hover:bg-[#1a94e0] text-white font-medium transition-all flex items-center justify-center"
              >
                <X className="h-4 w-4 mr-2" />
                Share on X
              </button>
              {shareStatus && (
                <span className="text-green-400 text-sm animate-pulse">{shareStatus}</span>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mx-auto max-w-md bg-red-900/30 border border-red-700 text-red-200 rounded-lg p-4 mb-8 text-center">
            {error}
          </div>
        )}

        {/* Main content */}
        {walletAddress ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map view */}
            <div className="lg:col-span-2 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl overflow-hidden">
              <div className="h-[500px]" id="map-container">
                {typeof window !== 'undefined' && (
                  <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: "100%", width: "100%" }}
                    className="z-10"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='© OpenStreetMap'
                    />
                    {userPoaps.map((poap, index) => {
                      const lat = parseFloat(poap.latitude);
                      const lng = parseFloat(poap.longitude);
                      if (!isNaN(lat) && !isNaN(lng)) {
                        return (
                          <Circle
                            key={index}
                            center={[lat, lng]}
                            radius={2000}
                            pathOptions={{
                              color: '#6366f1',
                              fillColor: '#8b5cf6',
                              fillOpacity: 0.6
                            }}
                          >
                            <Popup>
                              <div className="text-sm font-medium">{poap.title}</div>
                              <a
                                href={`https://ipfs.io/ipfs/${poap.ipfs}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 text-xs hover:underline"
                              >
                                View on IPFS →
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
              <div className="p-4 bg-gray-800/50 border-t border-gray-700">
                <h3 className="font-medium text-blue-300 flex items-center">
                  <Map className="h-4 w-4 mr-2" />
                  Your Exploration Map
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  You've discovered {userPoaps.length} unique location{userPoaps.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl overflow-hidden">
              <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                <h2 className="font-bold text-xl text-white flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Explorer Leaderboard
                </h2>
              </div>
              <div className="p-4">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    Loading leaderboard data...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.slice(0, 10).map((item, index) => (
                      <div
                        key={index}
                        className={`flex justify-between items-center p-3 rounded-lg ${
                          item.user.toLowerCase() === walletAddress.toLowerCase()
                            ? "bg-blue-900/30 border border-blue-700" 
                            : "bg-gray-800/50"
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 text-xs font-bold ${
                            index === 0 ? "bg-yellow-500 text-yellow-900" :
                            index === 1 ? "bg-gray-300 text-gray-800" :
                            index === 2 ? "bg-amber-700 text-amber-100" :
                            "bg-gray-700 text-gray-300"
                          }`}>
                            {index + 1}
                          </div>
                          <span className="font-medium text-sm">
                            {item.user.toLowerCase() === walletAddress.toLowerCase()
                              ? "You"
                              : `${item.user.slice(0, 6)}...${item.user.slice(-4)}`}
                          </span>
                        </div>
                        <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full">
                          {item.poaps.toString()} POAPs
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
          <div className="text-center p-12 bg-gray-800/20 backdrop-blur-sm rounded-xl border border-gray-800 max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
              <Map className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">Connect Your Wallet</h3>
            <p className="text-gray-400 mb-4">
              Connect your wallet to view your exploration history and POAPs on the map
            </p>
          </div>
        )}

        {/* POAP Gallery */}
        {walletAddress && userPoaps.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              YOUR LOCATION POAPs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPoaps.map((poap, index) => (
                <div 
                  key={index} 
                  className="bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-xl hover:border-blue-600/50 transition-all"
                >
                  <h3 className="text-lg font-bold mb-3 text-blue-300">{poap.title}</h3>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-400 flex items-start">
                      <span className="font-mono text-xs bg-gray-800 rounded px-2 py-1 mr-2 flex-shrink-0">LAT</span>
                      <span className="text-gray-300">{poap.latitude.substring(0, 8)}</span>
                    </p>
                    <p className="text-sm text-gray-400 flex items-start">
                      <span className="font-mono text-xs bg-gray-800 rounded px-2 py-1 mr-2 flex-shrink-0">LNG</span>
                      <span className="text-gray-300">{poap.longitude.substring(0, 8)}</span>
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <a
                      href={`https://ipfs.io/ipfs/${poap.ipfs}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center transition-colors"
                    >
                      View on IPFS
                      <Share2 className="h-3 w-3 ml-1" />
                    </a>
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add screenshot and improved sharing capability */}
        {walletAddress && userPoaps.length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl p-6 max-w-md mx-auto">
              <h3 className="text-xl font-bold mb-3 text-blue-300">Share Your Journey</h3>
              <p className="text-gray-400 mb-6">
                Showcase your exploration achievements with friends and followers
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={shareOnTwitter}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all flex items-center justify-center"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capture & Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}