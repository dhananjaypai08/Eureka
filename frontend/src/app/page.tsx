"use client";

import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { LocationRequest } from "./components/LocationRequest";
import Image from "next/image";
import Link from "next/link";
import { Compass, Map, Trophy, Camera, Lock, Coins, ChevronRight } from "lucide-react";
import contractData from "../../abi/LocationPOAP.json";

// Contract configuration
const CONTRACT_ADDRESS = contractData.address;
const BASE_CHAIN_ID = process.env.NEXT_PUBLIC_BASE_CHAIN_ID;
const BASE_RPC = process.env.NEXT_PUBLIC_RPC_URL;
const ABI = contractData.abi;
const REWARD_AMOUNT = Number(process.env.NEXT_PUBLIC_REWARD_AMOUNT) || 5;

interface LeaderboardEntry {
  user: string;
  poaps: ethers.BigNumberish;
}

export default function Home() {
  // Assets loaded state
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  // Assets to preload
  const criticalAssets = [
    '/map-bg.svg',
    '/home_bg.svg',
    '/compass.svg',
    '/map-paper.svg',
    '/clue-stone.svg',
    '/Group_Divider.png',
    '/Group_Divider_left.png',
    '/png_clipart_buried_treasure.svg'
  ];
  
  const assetRefs = useRef<{[key: string]: boolean}>({});

  // Load critical assets and then show content
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadAsset = (src: string) => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          assetRefs.current[src] = true;
          resolve(true);
        };
        img.onerror = () => {
          console.error(`Failed to load asset: ${src}`);
          resolve(false);
        };
        img.src = src;
      });
    };

    const loadAllAssets = async () => {
      const loadPromises = criticalAssets.map(src => loadAsset(src));
      await Promise.all(loadPromises);
      setAssetsLoaded(true);
    };

    loadAllAssets();
  }, []);

  // Initialize contract and load leaderboard data
  useEffect(() => {
    const loadLeaderboardData = async () => {
      try {
        setLeaderboardLoading(true);
        setLeaderboardError(null);
        
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        
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
        setLeaderboardError("Failed to load leaderboard data. Please try again later.");
      } finally {
        setLeaderboardLoading(false);
      }
    };

    if (assetsLoaded) {
      loadLeaderboardData();
    }
  }, [assetsLoaded]);

  // Direct transition to LocationRequest with minimal delay
  const startGameWithIntro = () => {
    setIsRedirecting(true);
    // Very brief intro animation (500ms) before redirecting
    setShowIntro(true);
    setTimeout(() => {
      setShowIntro(false);
      setGameStarted(true);
    }, 500);
  };

  // Loading screen - now waits for assets
  if (!assetsLoaded) {
    return (
      <div className="min-h-screen bg-[#211510] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute w-full h-full rounded-full border-4 border-t-amber-600 border-r-amber-800 border-b-amber-900 border-l-transparent animate-spin"></div>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <div className="w-10 h-10 text-amber-600 animate-pulse">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-amber-600 animate-pulse font-[ElMessiri]">
            UNFOLDING THE MAP...
          </h2>
        </div>
      </div>
    );
  }

  // Intro animation screen - now shorter and with better mobile view
  if (showIntro) {
    return (
      <div className="min-h-screen bg-[#211510] flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-1 h-1 bg-amber-400 rounded-full animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${0.5 + Math.random() * 1}s`
              }}
            ></div>
          ))}
        </div>
      
        <div className="text-center relative z-10">
          <div className="mb-4 scale-150 animate-pulse">
            <Image 
              src="/compass.svg" 
              alt="Compass" 
              width={96} 
              height={96} 
              priority 
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-amber-200 animate-pulse font-[ElMessiri]">
              ADVENTURE AWAITS
            </h2>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-cover bg-center font-[ElMessiri]" 
         style={{ backgroundImage: "url('/map-bg.svg')" }}>
      {!gameStarted ? (
        <div className="flex flex-col items-center min-h-screen py-8 px-4 text-center relative">
          {/* Hero Section - Full width background image */}
          <div className="w-full h-screen sm:h-screen relative mb-8 sm:mb-16">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <div className="relative w-full h-full">
                <Image 
                  src="/home_bg.svg" 
                  alt="Treasure Hunter Background" 
                  fill
                  style={{ objectFit: "cover" }}
                  quality={90}
                  priority
                />
              </div>
            </div>
            
            {/* Content overlay */}
            <div className="relative z-10 flex flex-col items-center sm:items-end justify-center h-full px-4 sm:pr-16 max-w-6xl mx-auto">
              <div className="w-full sm:w-1/2 text-center sm:text-right bg-[#211510]/40 sm:bg-transparent p-6 sm:p-0 rounded-lg sm:rounded-none">
                <h1 className="font-[ElMessiri] text-4xl sm:text-6xl font-bold mb-4 text-[#6D3B00]">
                  <span className="block">Discover The</span>
                  <span className="block text-[#8B4513]">Treasure Quest</span>
                </h1>
                
                <p className="text-base sm:text-lg text-[#5E4B32] max-w-xl mb-8 font-[ElMessiri] mx-auto sm:ml-auto">
                  Hunt for real-world treasures, capture proof of your discoveries, and earn exclusive on-chain rewards with privacy-preserving verification.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-end">
                  <button 
                    onClick={startGameWithIntro}
                    disabled={isRedirecting}
                    className={`px-6 py-3 bg-[#6D3B00] text-amber-100 rounded-md font-bold hover:bg-[#8B4513] transition-colors shadow-lg w-full sm:w-auto ${isRedirecting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isRedirecting ? 'Starting...' : 'Launch Game'}
                  </button>
                  
                  <Link href="/footprints">
                    <button className="px-6 py-3 bg-[#211510] text-amber-100 rounded-md font-bold hover:bg-[#372213] transition-colors shadow-lg w-full sm:w-auto">
                      Watch Footprints
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Scrolls Section - Optimized for mobile */}
          <div className="w-full max-w-6xl mx-auto mb-8 sm:mb-16 px-4">
            <h2 className="text-2xl font-bold text-[#6D3B00] mb-6 text-center">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Capture & Collect */}
              <div className="relative">
                <div className="relative w-full h-64">
                  <Image 
                    src="/map-compass.svg" 
                    alt="Scroll background"
                    width={300}
                    height={200}
                    style={{ objectFit: "contain", width: "100%", height: "100%" }}
                    priority
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 sm:px-20 py-8">
                    <h3 className="text-xl font-[ElMessiri] font-bold text-[#6D3B00] mb-2 text-center">Capture & Collect</h3>
                    <p className="text-sm text-[#5E4B32] font-[ElMessiri] text-center max-w-[200px]">
                      Take photos at discovery locations to mint exclusive Location POAPs that prove your adventures on-chain.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Privacy Shield */}
              <div className="relative">
                <div className="relative w-full h-64">
                  <Image 
                    src="/map-compass.svg" 
                    alt="Scroll background" 
                    width={300}
                    height={200}
                    style={{ objectFit: "contain", width: "100%", height: "100%" }}
                    priority
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 sm:px-20 py-8">
                    <h3 className="text-xl font-[ElMessiri] font-bold text-[#6D3B00] mb-2 text-center">AI + Privacy</h3>
                    <p className="text-sm text-[#5E4B32] font-[ElMessiri] text-center max-w-[200px]">
                      AI-generated clues unlock adventures anywhere, while zero-knowledge proofs verify your location without exposing it.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Real Crypto Rewards */}
              <div className="relative">
                <div className="relative w-full h-64">
                  <Image 
                    src="/map-compass.svg" 
                    alt="Scroll background" 
                    width={300}
                    height={200}
                    style={{ objectFit: "contain", width: "100%", height: "100%" }}
                    priority
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 sm:px-20 py-8">
                    <h3 className="text-xl font-[ElMessiri] font-bold text-[#6D3B00] mb-2 text-center">Real Crypto Rewards</h3>
                    <p className="text-sm text-[#5E4B32] font-[ElMessiri] text-center max-w-[200px]">
                      Earn ETH and exclusive digital collectibles on Base for each quest you complete - tradable and valuable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section with Map Paper Background */}
          <div className="w-full relative">
            {/* Map paper background covering everything below */}
            <div className="absolute inset-0 w-full h-full bg-center bg-cover bg-no-repeat" 
              style={{ 
                backgroundImage: "url('/map-paper.svg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "800px"
              }}>
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
              {/* Create Your Own Quests Section */}
              <div className="mb-16">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-8 w-full justify-center">
                    <div className="relative h-8 w-20 sm:w-48">
                      <Image 
                        src="/Group_Divider_left.png" 
                        alt="Divider Left" 
                        width={192}
                        height={32}
                        priority
                      />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-[ElMessiri] font-bold text-[#6D3B00] whitespace-nowrap">Create Your Own Quests</h2>
                    <div className="relative h-8 w-20 sm:w-48">
                      <Image 
                        src="/Group_Divider.png" 
                        alt="Divider Right" 
                        width={192}
                        height={32}
                        priority
                      />
                    </div>
                  </div>
                  
                  <div className="w-full max-w-xl mx-auto">
                    <div className="bg-[#F8EFE0]/70 backdrop-blur-sm rounded-xl shadow-inner shadow-amber-900/20 p-6 sm:p-8 border border-amber-800/10">
                      <p className="text-sm text-[#5E4B32] font-[ElMessiri] text-center mb-6 sm:mb-8 max-w-lg mx-auto">
                        Upload custom coordinates to create personalized treasure hunts for friends or communities. Set your own rewards and craft unique challenges based on your favorite locations.
                      </p>
                      
                      <div className="text-center">
                        <Link href="/createQuest">
                          <button className="px-6 py-3 bg-[#6D3B00] text-amber-100 rounded-md font-bold hover:bg-[#8B4513] transition-colors shadow-lg border border-amber-700">
                            Create Quest
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leaderboard Section */}
              <div className="mb-16">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-8 w-full justify-center">
                    <div className="relative h-8 w-20 sm:w-48">
                      <Image 
                        src="/Group_Divider_left.png" 
                        alt="Divider Left" 
                        width={192}
                        height={32}
                        priority
                      />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-[ElMessiri] font-bold text-[#6D3B00] whitespace-nowrap">Leaderboard</h2>
                    <div className="relative h-8 w-20 sm:w-48">
                      <Image 
                        src="/Group_Divider.png" 
                        alt="Divider Right" 
                        width={192}
                        height={32}
                        priority
                      />
                    </div>
                  </div>
                  
                  <div className="w-full max-w-2xl mx-auto bg-[#211510]/90 rounded-lg p-4 text-amber-100 shadow-xl border border-amber-900/30">
                    <div className="grid grid-cols-12 text-sm border-b border-amber-800/50 py-3 px-2 sm:px-4">
                      <div className="col-span-2 sm:col-span-1 font-bold">RANK</div>
                      <div className="col-span-6 sm:col-span-7 font-bold">PLAYER</div>
                      <div className="col-span-4 font-bold text-right">EARNED POAPS</div>
                    </div>
                    
                    {leaderboardLoading ? (
                      <div className="py-8 text-center">
                        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-amber-400/80">Loading leaderboard data...</p>
                      </div>
                    ) : leaderboardError ? (
                      <div className="py-8 text-center">
                        <p className="text-red-400">{leaderboardError}</p>
                        <button 
                          className="text-amber-400 hover:text-amber-300 mt-4 underline"
                          onClick={() => window.location.reload()}
                        >
                          Try Again
                        </button>
                      </div>
                    ) : (
                      <>
                        {leaderboard.slice(0, 5).map((item, index) => (
                          <div key={index} className={`grid grid-cols-12 py-3 px-2 sm:px-4 border-b border-amber-800/20 hover:bg-amber-900/20 transition-colors ${index === 0 ? 'bg-amber-900/30' : index === 1 ? 'bg-amber-800/20' : index === 2 ? 'bg-amber-700/20' : ''}`}>
                            <div className="col-span-2 sm:col-span-1 font-bold text-amber-400">{index + 1}</div>
                            <div className="col-span-6 sm:col-span-7 font-medium flex items-center text-xs sm:text-sm">
                              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-700 mr-2 sm:mr-3 flex items-center justify-center text-xs">
                                {item.user.substring(0, 2)}
                              </div>
                              <span className="truncate">
                                {`${item.user.slice(0, 4)}...${item.user.slice(-4)}`}
                              </span>
                            </div>
                            <div className="col-span-4 text-right self-center text-amber-400 text-xs sm:text-sm">
                              {(Number(item.poaps.toString()) * 1).toFixed(0)}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <footer className="text-center text-[#5E4B32] text-sm pt-8 pb-16 font-[ElMessiri]">
                <p>© 2025 EUREKA · Powered by Zero-Knowledge Proofs on Base</p>
              </footer>
            </div>
          </div>
        </div>
      ) : (
        <LocationRequest />
      )}
      
      {/* Custom animations */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&display=swap');
      
        body {
          font-family: 'El Messiri', sans-serif;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        .animate-twinkle {
          animation: twinkle ease-in-out infinite;
        }
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        .animate-typewriter {
          animation: typewriter 3s steps(40) 0.5s forwards;
        }
      `}</style>
    </div>
  );
}