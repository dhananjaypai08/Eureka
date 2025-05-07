"use client";

import { useState, useEffect } from "react";
import { LocationRequest } from "./components/LocationRequest";
import { 
  Compass, 
  Map, 
  Trophy, 
  Camera, 
  Lock, 
  Coins, 
  Upload, 
  ChevronRight,
  Plus,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
    }, 2000); 
  };

  // Loading screen
  if (loading || !showContent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute w-full h-full rounded-full border-4 border-t-indigo-600 border-r-violet-600 border-b-fuchsia-600 border-l-transparent animate-spin"></div>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <Map className="h-10 w-10 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 animate-pulse">
            INITIALIZING QUEST DATA...
          </h2>
        </div>
      </div>
    );
  }

  // Intro animation screen
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black flex items-center justify-center overflow-hidden relative">
        {/* Particle effects */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-1 h-1 bg-violet-400 rounded-full animate-ping"
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
            <Compass className="w-24 h-24 mx-auto text-violet-500" strokeWidth={1} />
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white mb-4 animate-pulse">
              QUEST ACTIVATED
            </h2>
            <div className="text-xl text-violet-400 font-mono animate-typewriter overflow-hidden whitespace-nowrap border-r-4 border-violet-400 pr-1 inline-block">
              INITIALIZING COORDINATES...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white">
      {!gameStarted ? (
        <div className="flex flex-col items-center justify-center min-h-screen pt-24 pb-8 px-4 text-center relative overflow-hidden">
          {/* Dynamic Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            {/* Ambient glow spots */}
            <div className="absolute top-1/4 left-10 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl opacity-40 animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/5 rounded-full filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: "1s" }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fuchsia-500/5 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "2s" }}></div>
            
            {/* Stars/particles */}
            <div className="stars-container absolute top-0 left-0 w-full h-full">
              {[...Array(30)].map((_, i) => (
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
            
            {/* Grid lines */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5">
              <div className="w-full h-full bg-[radial-gradient(circle,_transparent_20%,_#4f46e5_20%,_#4f46e5_20.5%,_transparent_20.5%,_transparent_30%,_#4f46e5_30%,_#4f46e5_30.5%,_transparent_30.5%)] bg-[length:40px_40px]"></div>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-6xl mx-auto">
            {/* Hero section */}
            <div className="flex flex-col items-center justify-center gap-8 lg:flex-row lg:items-start lg:text-left mb-16">
              <div className="lg:w-1/2 flex flex-col items-center lg:items-start">
                {/* Main heading */}
                <div className="space-y-6 mb-8">
                  <Badge variant="outline" className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-indigo-950/30 text-indigo-300 border-indigo-800/50 mb-4">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" /> New Experience
                  </Badge>
                  
                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-none">
                    <span className="block text-white">Discover The</span>
                    <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 mt-1">
                      Treasure Quest
                    </span>
                  </h1>
                  
                  <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
                    Hunt for real-world treasures, capture proof of your discoveries, and earn exclusive blockchain rewards with privacy-preserving verification.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <Button 
                    onClick={startGameWithIntro}
                    className="h-14 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium transition-all duration-300 shadow-lg shadow-indigo-900/40"
                    size="lg"
                  >
                    <span className="flex items-center gap-2">
                      <Map className="h-5 w-5" />
                      START TREASURE HUNT
                    </span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="h-14 rounded-lg border border-indigo-800 hover:bg-black-900/30 text-white-100 font-medium transition-all group bg-black"
                    size="lg"
                    asChild
                  >
                    <a href="/footprints">
                      <Coins className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                      VIEW FOOTPRINTS
                    </a>
                  </Button>
                </div>
              </div>
              
              {/* Hero image/animation */}
              <div className="lg:w-1/2 flex justify-center lg:justify-end">
                <div className="relative w-72 h-72 md:w-96 md:h-96">
                  {/* Animated rings */}
                  <div className="absolute inset-0 w-full h-full rounded-full border-2 border-indigo-500/20 animate-pulse"></div>
                  <div className="absolute inset-[10%] w-[80%] h-[80%] rounded-full border-2 border-violet-500/20 animate-pulse" style={{ animationDelay: "0.5s" }}></div>
                  <div className="absolute inset-[20%] w-[60%] h-[60%] rounded-full border-2 border-fuchsia-500/20 animate-pulse" style={{ animationDelay: "1s" }}></div>
                  
                  {/* Trophy icon */}
                  <div className="absolute inset-[25%] w-[50%] h-[50%] bg-gradient-to-br from-indigo-600 to-violet-700 rounded-full p-8 shadow-lg shadow-indigo-900/20 flex items-center justify-center group hover:scale-105 transition-all duration-300">
                    <Trophy className="h-full w-full text-white group-hover:rotate-12 transition-transform duration-300" strokeWidth={1.5} />
                  </div>
                  
                  {/* Floating game elements */}
                  <div className="absolute top-[10%] right-[10%] bg-gradient-to-br from-indigo-800/90 to-indigo-900/90 backdrop-blur-lg p-3 rounded-xl shadow-lg border border-indigo-700/50 animate-float" style={{ animationDelay: "0s" }}>
                    <Camera className="h-5 w-5 text-indigo-300" />
                  </div>
                  <div className="absolute bottom-[15%] left-[5%] bg-gradient-to-br from-violet-800/90 to-violet-900/90 backdrop-blur-lg p-3 rounded-xl shadow-lg border border-violet-700/50 animate-float" style={{ animationDelay: "1.5s" }}>
                    <Lock className="h-5 w-5 text-violet-300" />
                  </div>
                  <div className="absolute top-[40%] left-[10%] bg-gradient-to-br from-fuchsia-800/90 to-fuchsia-900/90 backdrop-blur-lg p-3 rounded-xl shadow-lg border border-fuchsia-700/50 animate-float" style={{ animationDelay: "0.7s" }}>
                    <Coins className="h-5 w-5 text-fuchsia-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 text-left mb-16">
              <Card className="bg-gradient-to-b from-gray-900/90 to-gray-950/90 backdrop-blur-sm border-indigo-900/50 shadow-xl hover:shadow-indigo-900/10 transition-all hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="w-14 h-14 bg-indigo-900/50 rounded-lg flex items-center justify-center mb-3">
                    <Camera className="h-8 w-8 text-indigo-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-indigo-300">Capture & Collect</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300/80 leading-relaxed">Take photos at discovery locations to mint exclusive Location POAPs that prove your adventures on-chain.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-b from-gray-900/90 to-gray-950/90 backdrop-blur-sm border-violet-900/50 shadow-xl hover:shadow-violet-900/10 transition-all hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="w-14 h-14 bg-violet-900/50 rounded-lg flex items-center justify-center mb-3">
                    <Lock className="h-8 w-8 text-violet-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-violet-300">Privacy Shield</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300/80 leading-relaxed">Our zero-knowledge proofs verify your location without revealing your coordinates, keeping your movements private.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-b from-gray-900/90 to-gray-950/90 backdrop-blur-sm border-fuchsia-900/50 shadow-xl hover:shadow-fuchsia-900/10 transition-all hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="w-14 h-14 bg-fuchsia-900/50 rounded-lg flex items-center justify-center mb-3">
                    <Coins className="h-8 w-8 text-fuchsia-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-fuchsia-300">Real Crypto Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300/80 leading-relaxed">Earn ETH and exclusive digital collectibles on Base blockchain for each quest you complete - tradable and valuable.</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Custom Quest Creation */}
            <Card className="mb-20 border-indigo-900/50 shadow-xl bg-gradient-to-b from-gray-900/90 to-gray-950/90 backdrop-blur-sm relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] bg-indigo-600/10 rounded-full filter blur-3xl"></div>
              
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-20 h-20 bg-indigo-900/80 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-900/20">
                    <Upload className="h-10 w-10 text-indigo-300" />
                  </div>
                  
                  <div className="text-left max-w-3xl">
                    <h3 className="text-2xl font-bold mb-3 text-indigo-300">Create Your Own Quests</h3>
                    <p className="text-slate-300/80 leading-relaxed mb-6">
                      Upload custom coordinates to create personalized treasure hunts for friends or communities. 
                      Set your own rewards and craft unique challenges based on your favorite locations.
                    </p>
                    <Button className="h-11 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-700/50 shadow-lg shadow-indigo-900/5">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Quest
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Stats */}
          <div className="relative z-10 w-full max-w-6xl mx-auto mb-20">
            <h3 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              QUEST TRACKER
            </h3>
            
            <Separator className="mb-8 bg-gradient-to-r from-indigo-950 via-violet-900 to-indigo-950 opacity-30 h-px" />
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="bg-indigo-950/30 backdrop-blur-sm border-indigo-900/30 hover:border-indigo-700/50 transition-all">
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-indigo-400 mb-2">78</div>
                  <div className="text-indigo-300 text-sm font-medium">Active Quests</div>
                </CardContent>
              </Card>
              <Card className="bg-violet-950/30 backdrop-blur-sm border-violet-900/30 hover:border-violet-700/50 transition-all">
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-violet-400 mb-2">2.5K</div>
                  <div className="text-violet-300 text-sm font-medium">POAPs Minted</div>
                </CardContent>
              </Card>
              <Card className="bg-fuchsia-950/30 backdrop-blur-sm border-fuchsia-900/30 hover:border-fuchsia-700/50 transition-all">
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-fuchsia-400 mb-2">631</div>
                  <div className="text-fuchsia-300 text-sm font-medium">Treasure Hunters</div>
                </CardContent>
              </Card>
              <Card className="bg-indigo-950/30 backdrop-blur-sm border-indigo-900/30 hover:border-indigo-700/50 transition-all">
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-indigo-400 mb-2">12.8</div>
                  <div className="text-indigo-300 text-sm font-medium">ETH Rewarded</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Leaderboard Preview */}
          <div className="relative z-10 w-full max-w-6xl mx-auto mb-20">
            <h3 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              TOP HUNTERS THIS WEEK
            </h3>
            
            <Separator className="mb-8 bg-gradient-to-r from-indigo-950 via-violet-900 to-indigo-950 opacity-30 h-px" />
            
            <Card className="bg-gray-950/80 backdrop-blur-sm border-gray-800 overflow-hidden shadow-xl">
              <div className="grid grid-cols-12 text-sm text-gray-400 py-4 px-6 border-b border-gray-800/80">
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
                <div key={hunter.rank} className="grid grid-cols-12 py-5 px-6 border-b border-gray-800/40 hover:bg-gray-900/20 transition-colors">
                  <div className="col-span-1 font-bold text-amber-500">{hunter.rank}</div>
                  <div className="col-span-5 font-medium text-white flex items-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 mr-3 flex items-center justify-center text-xs shadow-md shadow-indigo-950/50">
                      {hunter.name.substring(0, 2)}
                    </div>
                    {hunter.name}
                  </div>
                  <div className="col-span-3 text-center self-center">{hunter.quests}</div>
                  <div className="col-span-3 text-right self-center font-medium text-emerald-400">{hunter.rewards}</div>
                </div>
              ))}
              
              <div className="px-6 py-4 text-center">
                <Button variant="link" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center justify-center mx-auto">
                  View Full Leaderboard
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Footer */}
          <footer className="w-full text-center text-indigo-400/50 text-sm pt-8 pb-8 relative z-10">
            <p>© 2025 Treasure Quest · Powered by Zero-Knowledge Proofs on Base Blockchain</p>
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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}