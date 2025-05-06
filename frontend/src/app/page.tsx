"use client";

import { useState, useEffect } from "react";
import { LocationRequest } from "./components/LocationRequest";
import { Camera, Compass, Sparkles, Map, Trophy } from "lucide-react";

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
            LOADING ADVENTURE...
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
            ADVENTURE BEGINS
          </h2>
          <div className="text-xl text-blue-400 font-mono">
            INITIALIZING HUNT SEQUENCE...
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
                <Compass className="h-full w-full text-white" strokeWidth={1.5} />
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
                ZK Location Hunt
              </span>
            </h1>
            
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 w-32 mx-auto my-6 rounded-full"></div>

            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Unlock the world's first privacy-preserving location-based scavenger hunt powered by zero-knowledge proofs and blockchain rewards.
            </p>

            <div className="space-y-5 sm:space-y-0 sm:space-x-6 flex flex-col sm:flex-row justify-center items-center mb-16">
              <button 
                onClick={startGameWithIntro}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center w-full sm:w-auto transform hover:-translate-y-1 group relative overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-50 transform translate-y-full group-hover:translate-y-0 transition-all duration-300"></span>
                <span className="relative flex items-center">
                  <Map className="h-5 w-5 mr-2" />
                  BEGIN ADVENTURE
                </span>
              </button>
              
              <a 
                href="/about" 
                className="px-8 py-4 rounded-xl border border-blue-400 hover:bg-blue-900/30 text-blue-100 font-medium transition-all w-full sm:w-auto flex items-center justify-center group"
              >
                <Compass className="h-5 w-5 mr-2 group-hover:rotate-45 transition-transform" />
                EXPLORE MORE
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
              <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-8 rounded-xl border border-blue-900/50 shadow-xl transform hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 bg-blue-900/50 rounded-lg flex items-center justify-center mb-6">
                  <Camera className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-blue-300">Privacy-First</h3>
                <p className="text-blue-100/80 leading-relaxed">Your location data never leaves your device thanks to zero-knowledge proofs.</p>
              </div>
              
              <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-8 rounded-xl border border-purple-900/50 shadow-xl transform hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 bg-purple-900/50 rounded-lg flex items-center justify-center mb-6">
                  <Compass className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-purple-300">Verified Completion</h3>
                <p className="text-purple-100/80 leading-relaxed">Cryptographic proof of your achievements without revealing your path..</p>
              </div>
              
              <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-8 rounded-xl border border-pink-900/50 shadow-xl transform hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 bg-pink-900/50 rounded-lg flex items-center justify-center mb-6">
                  <Trophy className="h-8 w-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-pink-300">On-Chain Digital Rewards</h3>
                <p className="text-pink-100/80 leading-relaxed">Collect unique digital treasures for each discovery, proven and secured on base blockchain .</p>
              </div>
            </div>
          </div>

          {/* Game Universe Stats */}
          <div className="mt-20 w-full max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/30 rounded-xl py-6 px-4">
                <div className="text-4xl font-bold text-blue-400 mb-2">42</div>
                <div className="text-blue-200 text-sm">Global Quests</div>
              </div>
              <div className="bg-purple-900/20 backdrop-blur-sm border border-purple-800/30 rounded-xl py-6 px-4">
                <div className="text-4xl font-bold text-purple-400 mb-2">1.2K</div>
                <div className="text-purple-200 text-sm">Treasures Found</div>
              </div>
              <div className="bg-pink-900/20 backdrop-blur-sm border border-pink-800/30 rounded-xl py-6 px-4">
                <div className="text-4xl font-bold text-pink-400 mb-2">386</div>
                <div className="text-pink-200 text-sm">Adventurers</div>
              </div>
              <div className="bg-indigo-900/20 backdrop-blur-sm border border-indigo-800/30 rounded-xl py-6 px-4">
                <div className="text-4xl font-bold text-indigo-400 mb-2">24</div>
                <div className="text-indigo-200 text-sm">Cities Explored</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="w-full text-center text-blue-300/60 text-sm pt-16 pb-8 mt-16 relative z-10">
            <p>© 2025 ZK Hunt · Built with Zero-Knowledge Proofs on Base</p>
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