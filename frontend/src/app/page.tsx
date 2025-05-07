"use client";

import { useState, useEffect } from "react";
import { LocationRequest } from "./components/LocationRequest";
import { Camera, Compass, Map, Trophy, Coins, Lock, Upload } from "lucide-react";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => {
        setShowContent(true);
      }, 100);
    }, 1200); // 1.2 seconds loading time

    return () => clearTimeout(timer);
  }, []);

 
  const startGameWithIntro = () => {
    setShowIntro(true);
    setTimeout(() => {
      setShowIntro(false);
      setTimeout(() => {
        setGameStarted(true);
      }, 500);
    }, 3000); // Show intro for 3 seconds
  };

  // If we're loading, show ONLY the loading animation
  if (loading || !showContent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute w-full h-full rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-transparent animate-spin"></div>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <Map className="h-10 w-10 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse">
            LOADING QUEST DATA...
          </h2>
        </div>
      </div>
    );
  }

  // Intro animation when starting game
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8 scale-150 animate-pulse">
            <Compass className="w-24 h-24 mx-auto text-blue-500" strokeWidth={1} />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 animate-pulse">
            QUEST ACTIVATED
          </h2>
          <div className="text-xl text-blue-400 font-mono">
            INITIALIZING TREASURE COORDINATES...
          </div>
        </div>
      </div>
    );
  }

  // Once loading is done, show the main content
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      {!gameStarted ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 pt-24 text-center relative overflow-hidden">
          {/* Dynamic Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full filter blur-3xl opacity-40 animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: "1s" }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "2s" }}></div>
            
            {/* Animated stars/particles */}
            <div className="stars-container absolute top-0 left-0 w-full h-full">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${2 + Math.random() * 3}s`
                  }}
                ></div>
              ))}
            </div>
            
            {/* Map grid lines */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <div className="w-full h-full bg-[radial-gradient(circle,_transparent_20%,_#2563eb_20%,_#2563eb_20.5%,_transparent_20.5%,_transparent_30%,_#2563eb_30%,_#2563eb_30.5%,_transparent_30.5%)] bg-[length:50px_50px]"></div>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-4xl">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-5 mb-6 shadow-lg shadow-blue-500/20 transform hover:rotate-12 transition-all">
                <Trophy className="h-full w-full text-white" strokeWidth={1.5} />
              </div>
            </div>

            {/* Gradient text heading matching the image */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold mb-10 text-center">
              <span style={{
                background: "linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
                display: "inline-block",
                textShadow: "0px 2px 30px rgba(168, 85, 247, 0.3)"
              }}>
                Treasure Quest
              </span>
            </h1>
            
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 w-32 mx-auto my-6 rounded-full"></div>

            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Hunt for real-world treasures, capture proof of your discoveries, and earn exclusive blockchain rewards with privacy-preserving location verification.
            </p>

            <div className="space-y-5 sm:space-y-0 sm:space-x-6 flex flex-col sm:flex-row justify-center items-center mb-16">
              <button 
                onClick={startGameWithIntro}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center w-full sm:w-auto transform hover:-translate-y-1 group relative overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-50 transform translate-y-full group-hover:translate-y-0 transition-all duration-300"></span>
                <span className="relative flex items-center">
                  <Map className="h-5 w-5 mr-2" />
                  START TREASURE HUNT
                </span>
              </button>
              
              <a 
                href="/footprints" 
                className="px-8 py-4 rounded-xl border border-blue-400 hover:bg-blue-900/30 text-blue-100 font-medium transition-all w-full sm:w-auto flex items-center justify-center group"
              >
                <Coins className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                VIEW FOOTPRINTS
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
              <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-8 rounded-xl border border-blue-900/50 shadow-xl transform hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 bg-blue-900/50 rounded-lg flex items-center justify-center mb-6">
                  <Camera className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-blue-300">Capture & Collect</h3>
                <p className="text-blue-100/80 leading-relaxed">Take photos at discovery locations to mint exclusive Location POAPs that prove your adventures on-chain.</p>
              </div>
              
              <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-8 rounded-xl border border-purple-900/50 shadow-xl transform hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 bg-purple-900/50 rounded-lg flex items-center justify-center mb-6">
                  <Lock className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-purple-300">Privacy Shield</h3>
                <p className="text-purple-100/80 leading-relaxed">Our zero-knowledge proofs verify your location without revealing your coordinates, keeping your movements private.</p>
              </div>
              
              <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-8 rounded-xl border border-pink-900/50 shadow-xl transform hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 bg-pink-900/50 rounded-lg flex items-center justify-center mb-6">
                  <Coins className="h-8 w-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-pink-300">Real Crypto Rewards</h3>
                <p className="text-pink-100/80 leading-relaxed">Earn ETH and exclusive digital collectibles on Base blockchain for each quest you complete - tradable and valuable.</p>
              </div>
            </div>
            
            {/* Custom Quest Creation */}
            <div className="mt-16 p-8 rounded-xl bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-indigo-900/50 shadow-xl">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 bg-indigo-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Upload className="h-10 w-10 text-indigo-400" />
                </div>
                
                <div className="text-left">
                  <h3 className="text-2xl font-bold mb-3 text-indigo-300">Create Your Own Quests</h3>
                  <p className="text-indigo-100/80 leading-relaxed mb-4">
                    Upload custom coordinates to create personalized treasure hunts for friends or communities. 
                    Set your own rewards and craft unique challenges based on your favorite locations.
                  </p>
                  <button className="px-5 py-2.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-colors inline-flex items-center">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Create Quest
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Game Stats */}
          <div className="mt-20 w-full max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              QUEST TRACKER
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/30 rounded-xl py-6 px-4">
                <div className="text-4xl font-bold text-blue-400 mb-2">78</div>
                <div className="text-blue-200 text-sm">Active Quests</div>
              </div>
              <div className="bg-purple-900/20 backdrop-blur-sm border border-purple-800/30 rounded-xl py-6 px-4">
                <div className="text-4xl font-bold text-purple-400 mb-2">2.5K</div>
                <div className="text-purple-200 text-sm">POAPs Minted</div>
              </div>
              <div className="bg-pink-900/20 backdrop-blur-sm border border-pink-800/30 rounded-xl py-6 px-4">
                <div className="text-4xl font-bold text-pink-400 mb-2">631</div>
                <div className="text-pink-200 text-sm">Treasure Hunters</div>
              </div>
              <div className="bg-indigo-900/20 backdrop-blur-sm border border-indigo-800/30 rounded-xl py-6 px-4">
                <div className="text-4xl font-bold text-indigo-400 mb-2">12.8</div>
                <div className="text-indigo-200 text-sm">ETH Rewarded</div>
              </div>
            </div>
          </div>

          {/* Leaderboard Preview */}
          <div className="mt-16 w-full max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              TOP HUNTERS THIS WEEK
            </h3>
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 text-sm text-gray-400 py-3 px-4 border-b border-gray-800">
                <div className="col-span-1 font-medium">#</div>
                <div className="col-span-5 font-medium">Hunter</div>
                <div className="col-span-3 font-medium text-center">Quests</div>
                <div className="col-span-3 font-medium text-right">Rewards</div>
              </div>
              
              {[
                { rank: 1, name: "CryptoExplorer", quests: 17, rewards: "0.85 ETH" },
                { rank: 2, name: "TreasureSeeker", quests: 15, rewards: "0.76 ETH" },
                { rank: 3, name: "QuestMaster", quests: 12, rewards: "0.64 ETH" },
              ].map((hunter) => (
                <div key={hunter.rank} className="grid grid-cols-12 py-4 px-4 border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <div className="col-span-1 font-bold text-yellow-500">{hunter.rank}</div>
                  <div className="col-span-5 font-medium text-white flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mr-3 flex items-center justify-center text-xs">
                      {hunter.name.substring(0, 2)}
                    </div>
                    {hunter.name}
                  </div>
                  <div className="col-span-3 text-center self-center">{hunter.quests}</div>
                  <div className="col-span-3 text-right self-center font-medium text-green-400">{hunter.rewards}</div>
                </div>
              ))}
              
              <div className="px-4 py-3 text-center">
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors inline-flex items-center">
                  View Full Leaderboard
                  <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="w-full text-center text-blue-300/60 text-sm pt-16 pb-8 mt-16 relative z-10">
            <p>© 2025 Treasure Quest · Powered by Zero-Knowledge Proofs on Base Blockchain</p>
          </footer>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen p-4">
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
      `}</style>
    </div>
  );
}