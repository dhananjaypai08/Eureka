"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { LocationRequest } from "./components/LocationRequest";
import Image from "next/image";
import Link from "next/link";
import { Compass, Map, Trophy, Camera, Lock, Coins, ChevronRight } from "lucide-react";
import contractData from "../../abi/LocationPOAP.json";

// Contract configuration - maintaining original logic
const CONTRACT_ADDRESS = contractData.address;
const BASE_CHAIN_ID = 84532;
const BASE_RPC = process.env.NEXT_PUBLIC_RPC_URL;
const ABI = contractData.abi;

interface LeaderboardEntry {
  user: string;
  poaps: ethers.BigNumberish;
}

export default function Home() {
  // Keeping all the original state and hooks
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  
  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  // Original loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => {
        setShowContent(true);
      }, 100);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Initialize contract and load leaderboard data - keeping original logic
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

  // Original game starter function
  const startGameWithIntro = () => {
    setShowIntro(true);
    setTimeout(() => {
      setShowIntro(false);
      setTimeout(() => {
        setGameStarted(true);
      }, 500);
    }, 2000);
  };

  // Loading screen - keeping similar feel but with treasure theme
  if (loading || !showContent) {
    return (
      <div className="min-h-screen bg-[#211510] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute w-full h-full rounded-full border-4 border-t-amber-600 border-r-amber-800 border-b-amber-900 border-l-transparent animate-spin"></div>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <Image src="/compass.svg" alt="Compass" width={40} height={40} className="animate-pulse" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-amber-600 animate-pulse">
            UNFOLDING THE MAP...
          </h2>
        </div>
      </div>
    );
  }

  // Intro animation screen - treasure theme
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
            <Image src="/compass.svg" alt="Compass" width={96} height={96} />
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-amber-200 mb-4 animate-pulse">
              ADVENTURE AWAITS
            </h2>
            <div className="text-xl text-amber-400 font-serif animate-typewriter overflow-hidden whitespace-nowrap border-r-4 border-amber-400 pr-1 inline-block">
              PLOTTING YOUR JOURNEY...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main content - transformed to match the treasure map theme
  return (
    <div className="min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center text-[#3A2A18]">
      {!gameStarted ? (
        <div className="flex flex-col items-center min-h-screen py-8 px-4 text-center relative">
          {/* Hero Section */}
          <div className="w-full max-w-6xl mx-auto pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
              <div className="md:w-1/2">
                <Image 
                  src="/home_bg.svg" 
                  alt="Treasure Hunter" 
                  width={450} 
                  height={450} 
                  className="max-w-full h-auto rounded"
                />
              </div>
              
              <div className="md:w-1/2 text-left">
                <h1 className="font-serif text-5xl sm:text-6xl font-bold mb-4 text-[#6D3B00]">
                  <span className="block">Discover The</span>
                  <span className="block text-[#8B4513]">Treasure Quest</span>
                </h1>
                
                <p className="text-lg text-[#5E4B32] max-w-xl mb-8 font-serif">
                  Hunt for real-world treasures, capture proof of your discoveries, and earn exclusive on-chain rewards with privacy-preserving verification.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={startGameWithIntro}
                    className="px-6 py-3 bg-[#6D3B00] text-amber-100 rounded-md font-bold hover:bg-[#8B4513] transition-colors shadow-lg"
                  >
                    Launch Game
                  </button>
                  
                  <Link href="/footprints">
                    <button className="px-6 py-3 bg-[#211510] text-amber-100 rounded-md font-bold hover:bg-[#372213] transition-colors shadow-lg">
                      Watch Footprints
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Scrolls Section */}
          <div className="w-full max-w-6xl mx-auto mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Capture & Collect Scroll */}
              <div className="relative">
                <Image 
                  src="/card.svg" 
                  alt="Scroll background" 
                  width={400} 
                  height={300} 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pt-12">
                  <div className="flex items-center gap-2 mb-2">
                    <Image src="/compass.svg" alt="Compass" width={24} height={24} />
                    <h3 className="text-xl font-serif font-bold text-[#6D3B00]">Capture & Collect</h3>
                  </div>
                  <p className="text-sm text-[#5E4B32] font-serif">
                    Take photos at discovery locations to mint exclusive location POAPs that prove your adventures on-chain.
                  </p>
                </div>
              </div>
              
              {/* Privacy Shield Scroll */}
              <div className="relative">
                <Image 
                  src="/card.svg" 
                  alt="Scroll background" 
                  width={400} 
                  height={300} 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pt-12">
                  <div className="flex items-center gap-2 mb-2">
                    <Image src="/compass.svg" alt="Compass" width={24} height={24} />
                    <h3 className="text-xl font-serif font-bold text-[#6D3B00]">Privacy Shield</h3>
                  </div>
                  <p className="text-sm text-[#5E4B32] font-serif">
                    Our zero-knowledge proofs verify your location without revealing your coordinates, keeping your movements private.
                  </p>
                </div>
              </div>
              
              {/* Real Crypto Rewards Scroll */}
              <div className="relative">
                <Image 
                  src="/card.svg" 
                  alt="Scroll background" 
                  width={400} 
                  height={300} 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pt-12">
                  <div className="flex items-center gap-2 mb-2">
                    <Image src="/compass.svg" alt="Compass" width={24} height={24} />
                    <h3 className="text-xl font-serif font-bold text-[#6D3B00]">Real Crypto Rewards</h3>
                  </div>
                  <p className="text-sm text-[#5E4B32] font-serif">
                    Earn ETH and exclusive digital collectibles on Base for each quest you complete - tradable and valuable.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Create Your Own Quests Section */}
          <div className="w-full max-w-6xl mx-auto mb-16">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px bg-[#5E4B32] w-20"></div>
                <h2 className="text-2xl font-serif font-bold text-[#6D3B00]">Create Your Own Quests</h2>
                <div className="h-px bg-[#5E4B32] w-20"></div>
              </div>
              
              <div className="relative w-full max-w-xl">
                <Image 
                  src="/map-paper.svg" 
                  alt="Create quest background" 
                  width={600} 
                  height={220} 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <p className="text-sm text-[#5E4B32] font-serif text-center mb-6 max-w-lg">
                    Upload custom coordinates to create personalized treasure hunts for friends or communities. Set your own rewards and craft unique challenges based on your favorite locations.
                  </p>
                  
                  <Link href="/createQuest">
                    <button className="px-6 py-3 bg-[#6D3B00] text-amber-100 rounded-md font-bold hover:bg-[#8B4513] transition-colors shadow-lg">
                      Create Quest
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="w-full max-w-6xl mx-auto mb-16">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px bg-[#5E4B32] w-20"></div>
                <h2 className="text-2xl font-serif font-bold text-[#6D3B00]">Leaderboard</h2>
                <div className="h-px bg-[#5E4B32] w-20"></div>
              </div>
              
              <div className="w-full max-w-2xl bg-[#211510]/90 rounded-lg p-4 text-amber-100 shadow-xl">
                <div className="grid grid-cols-12 text-sm border-b border-amber-800/50 py-3 px-4">
                  <div className="col-span-1 font-bold">Rank</div>
                  <div className="col-span-7 font-bold">Hunter</div>
                  <div className="col-span-4 font-bold text-right">Rewards</div>
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
                      <div key={index} className="grid grid-cols-12 py-3 px-4 border-b border-amber-800/20 hover:bg-amber-900/20 transition-colors">
                        <div className="col-span-1 font-bold text-amber-400">{index + 1}</div>
                        <div className="col-span-7 font-medium flex items-center">
                          <div className="w-7 h-7 rounded-full bg-amber-700 mr-3 flex items-center justify-center text-xs">
                            {item.user.substring(0, 2)}
                          </div>
                          {`${item.user.slice(0, 6)}...${item.user.slice(-4)}`}
                        </div>
                        <div className="col-span-4 text-right self-center">
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
          <footer className="w-full text-center text-[#5E4B32] text-sm pt-8 pb-8 font-serif">
            <p>© 2025 Treasure Quest · Powered by Zero-Knowledge Proofs on Base</p>
          </footer>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen p-4 pt-16">
          <LocationRequest />
        </div>
      )}
      
      {/* Custom animations */}
      <style jsx global>{`
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