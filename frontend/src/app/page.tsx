"use client";

import { useState, useEffect } from "react";
import { LocationRequest } from "./components/LocationRequest";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  // Add loading effect
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
      // Add a small delay before showing content to ensure smooth transition
      setTimeout(() => {
        setShowContent(true);
      }, 100);
    }, 2500); // 2.5 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  // If we're loading, show ONLY the loading animation
  if (loading || !showContent) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute w-full h-full rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-transparent animate-spin"></div>
            <div className="absolute w-full h-full flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse">
            Loading ZK Hunt...
          </h2>
        </div>
      </div>
    );
  }

  // Once loading is done, show the main content
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Hero Section */}
      {!gameStarted ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 pt-24 text-center">
          {/* Background Gradient Elements */}
          <div className="fixed top-20 left-20 w-72 h-72 bg-blue-200/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="fixed bottom-20 right-20 w-72 h-72 bg-purple-200/20 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200/15 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>

          {/* Content */}
          <div className="relative z-10 max-w-3xl">
            <div className="mb-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-5 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              ZK Location Hunt
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Unlock the world's first privacy-preserving location-based
              scavenger hunt powered by zero-knowledge proofs and blockchain rewards.
            </p>

            <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center items-center">
              <button 
                onClick={() => setGameStarted(true)}
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all shadow-lg hover:shadow-blue-500/20 flex items-center justify-center w-full sm:w-auto transform hover:-translate-y-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10 8 16 12 10 16 10 8"></polygon>
                </svg>
                Start Game
              </button>
              
              <a 
                href="/about" 
                className="px-8 py-4 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium transition-all w-full sm:w-auto flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Learn More
              </a>
            </div>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Privacy-First</h3>
                <p className="text-gray-600 text-sm">Your location data never leaves your device thanks to zero-knowledge proofs.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Verified Completion</h3>
                <p className="text-gray-600 text-sm">Cryptographic proof of your achievements without revealing your path.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">On-Chain Rewards</h3>
                <p className="text-gray-600 text-sm">Earn digital collectibles on Base blockchain for each location you discover.</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="w-full text-center text-gray-500 text-sm pt-16 pb-8 mt-16">
            <p>© 2025 ZK Hunt · Built with Zero-Knowledge Proofs on Base</p>
          </footer>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen p-4">
          <LocationRequest />
        </div>
      )}
    </div>
  );
}