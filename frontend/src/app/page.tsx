"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { LocationRequest } from "./components/LocationRequest";
import Image from "next/image";
import Link from "next/link";
import { Compass, Map, Trophy, Camera, Lock, Coins, ChevronRight } from "lucide-react";
import contractData from "../../abi/LocationPOAP.json";

// Contract configuration
const CONTRACT_ADDRESS = contractData.address;
const BASE_CHAIN_ID = 84532;
const BASE_RPC = process.env.NEXT_PUBLIC_RPC_URL;
const ABI = contractData.abi;

interface LeaderboardEntry {
  user: string;
  poaps: ethers.BigNumberish;
}

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  
  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  // Loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => {
        setShowContent(true);
      }, 100);
    }, 1200);

    return () => clearTimeout(timer);
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

    if (!loading && showContent) {
      loadLeaderboardData();
    }
  }, [loading, showContent]);

  const startGameWithIntro = () => {
    setShowIntro(true);
    setTimeout(() => {
      setShowIntro(false);
      setTimeout(() => {
        setGameStarted(true);
      }, 500);
    }, 2000);
  };

  // Loading screen
  if (loading || !showContent) {
    return (
      <div className="min-h-screen bg-[#211510] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute w-full h-full rounded-full border-4 border-t-amber-600 border-r-amber-800 border-b-amber-900 border-l-transparent animate-spin"></div>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <Image src="/compass.svg" alt="Compass" width={40} height={40} className="animate-pulse" priority={true} loading="eager" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-amber-600 animate-pulse font-[ElMessiri]">
            UNFOLDING THE MAP...
          </h2>
        </div>
      </div>
    );
  }

  // Intro animation screen
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
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>
      
        <div className="text-center relative z-10">
          <div className="mb-8 scale-150 animate-pulse">
            <Image src="/compass.svg" alt="Compass" width={96} height={96} priority={true} loading="eager" />
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-amber-200 mb-4 animate-pulse font-[ElMessiri]">
              ADVENTURE AWAITS
            </h2>
            <div className="text-xl text-amber-400 font-[ElMessiri] animate-typewriter overflow-hidden whitespace-nowrap border-r-4 border-amber-400 pr-1 inline-block">
              PLOTTING YOUR JOURNEY...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-cover bg-center font-[ElMessiri]" style={{ backgroundImage: "url('/map-bg.svg')" }}>
      {!gameStarted ? (
        <div className="flex flex-col items-center min-h-screen py-8 px-4 text-center relative">
          {/* Hero Section - Full width background image */}
          <div className="w-full h-screen relative mb-16">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image 
                src="/home_bg.svg" 
                alt="Treasure Hunter Background" 
                layout="fill"
                objectFit="cover"
                quality={100}
                priority={true}
                loading="eager"
              />
            </div>
            
            {/* Content overlay */}
            <div className="relative z-10 flex flex-col items-end justify-center h-full pr-16 max-w-6xl mx-auto">
              <div className="md:w-1/2 text-right">
                <h1 className="font-[ElMessiri] text-5xl sm:text-6xl font-bold mb-4 text-[#6D3B00]">
                  <span className="block">Discover The</span>
                  <span className="block text-[#8B4513]">Treasure Quest</span>
                </h1>
                
                <p className="text-lg text-[#5E4B32] max-w-xl mb-8 font-[ElMessiri] ml-auto">
                  Hunt for real-world treasures, capture proof of your discoveries, and earn exclusive on-chain rewards with privacy-preserving verification.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={startGameWithIntro}
                  className="px-6 py-3 ml-6 bg-[#6D3B00] text-amber-100 rounded-md font-bold hover:bg-[#8B4513] transition-colors shadow-lg w-full sm:w-40"
                >
                  Launch Game
                </button>
                
                <Link href="/footprints">
                  <button className="px-6 py-3 ml-6 bg-[#211510] text-amber-100 rounded-md font-bold hover:bg-[#372213] transition-colors shadow-lg w-full sm:w-40">
                    Watch Footprints
                  </button>
                </Link>
              </div>
              </div>
            </div>
          </div>

          {/* Feature Scrolls Section */}
          <div className="w-full max-w-6xl mx-auto mb-16">
            <div className="grid grid-row-1 md:grid-row-3 gap-8">
              {/* Capture & Collect Scroll */}
              <div className="relative left-[-250px]">
                <div className="relative w-full h-64">
                  <Image 
                    src="/map-compass.svg" 
                    alt="Scroll background"
                    layout="fill"
                    objectFit="contain"
                    priority={true}
                    loading="eager"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-20 py-8">
                    <h3 className="text-xl font-[ElMessiri] font-bold text-[#6D3B00] mb-2 text-center">Capture & Collect</h3>
                    <p className="text-sm text-[#5E4B32] font-[ElMessiri] text-center max-w-[160px]">
                      Take photos at discovery locations to mint exclusive Location POAPs that prove your adventures on-chain.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Privacy Shield Scroll */}
              <div className="relative left-[170px]">
                <div className="relative w-full h-64">
                  <Image 
                    src="/map-compass.svg" 
                    alt="Scroll background" 
                    layout="fill"
                    objectFit="contain"
                    priority={true}
                    loading="eager"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-20 py-8">
                    <h3 className="text-xl font-[ElMessiri] font-bold text-[#6D3B00] mb-2 text-center">Privacy Shield</h3>
                    <p className="text-sm text-[#5E4B32] font-[ElMessiri] text-center max-w-[160px]">
                      Our zero-knowledge proofs verify your location without revealing your coordinates, keeping your movements private.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Real Crypto Rewards Scroll */}
              <div className="relative left-[-250px]">
                <div className="relative w-full h-64">
                  <Image 
                    src="/map-compass.svg" 
                    alt="Scroll background" 
                    layout="fill"
                    objectFit="contain"
                    priority={true}
                    loading="eager"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-20 py-8">
                    <h3 className="text-xl font-[ElMessiri] font-bold text-[#6D3B00] mb-2 text-center">Real Crypto Rewards</h3>
                    <p className="text-sm text-[#5E4B32] font-[ElMessiri] text-center max-w-[160px]">
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
                backgroundSize: "500% 500%",
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
                    <div className="relative h-8 w-48">
                      <Image 
                        src="/Group_Divider_left.png" 
                        alt="Divider Left" 
                        layout="fill"
                        objectFit="contain"
                        priority={true}
                        loading="eager"
                      />
                    </div>
                    <h2 className="text-2xl font-[ElMessiri] font-bold text-[#6D3B00] whitespace-nowrap">Create Your Own Quests</h2>
                    <div className="relative h-8 w-48">
                      <Image 
                        src="/Group_Divider.png" 
                        alt="Divider Right" 
                        layout="fill"
                        objectFit="contain"
                        priority={true}
                        loading="eager"
                      />
                    </div>
                  </div>
                  
                  <div className="w-full max-w-xl mx-auto">
                    <div className="bg-[#F8EFE0]/70 backdrop-blur-sm rounded-xl shadow-inner shadow-amber-900/20 p-8 border border-amber-800/10">
                      <p className="text-sm text-[#5E4B32] font-[ElMessiri] text-center mb-8 max-w-lg mx-auto">
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
                    <div className="relative h-8 w-48">
                      <Image 
                        src="/Group_Divider_left.png" 
                        alt="Divider Left" 
                        layout="fill"
                        objectFit="contain"
                        priority={true}
                        loading="eager"
                      />
                    </div>
                    <h2 className="text-2xl font-[ElMessiri] font-bold text-[#6D3B00] whitespace-nowrap">Leaderboard</h2>
                    <div className="relative h-8 w-48">
                      <Image 
                        src="/Group_Divider.png" 
                        alt="Divider Right" 
                        layout="fill"
                        objectFit="contain"
                        priority={true}
                        loading="eager"
                      />
                    </div>
                  </div>
                  
                  <div className="w-full max-w-2xl mx-auto bg-[#211510]/90 rounded-lg p-4 text-amber-100 shadow-xl border border-amber-900/30">
                    <div className="grid grid-cols-12 text-sm border-b border-amber-800/50 py-3 px-4">
                      <div className="col-span-1 font-bold">RANK</div>
                      <div className="col-span-7 font-bold">PLAYER</div>
                      <div className="col-span-4 font-bold text-right">REWARDS</div>
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
                          <div key={index} className={`grid grid-cols-12 py-3 px-4 border-b border-amber-800/20 hover:bg-amber-900/20 transition-colors ${index === 0 ? 'bg-amber-900/30' : index === 1 ? 'bg-amber-800/20' : index === 2 ? 'bg-amber-700/20' : ''}`}>
                            <div className="col-span-1 font-bold text-amber-400">{index + 1}</div>
                            <div className="col-span-7 font-medium flex items-center">
                              <div className="w-7 h-7 rounded-full bg-amber-700 mr-3 flex items-center justify-center text-xs">
                                {item.user.substring(0, 2)}
                              </div>
                              {`${item.user.slice(0, 6)}...${item.user.slice(-4)}`}
                            </div>
                            <div className="col-span-4 text-right self-center text-amber-400">
                              {(Number(item.poaps.toString()) * 0.01).toFixed(2)} ETH
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
        <div className="flex items-center justify-center min-h-screen p-4 pt-16">
          <LocationRequest />
        </div>
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