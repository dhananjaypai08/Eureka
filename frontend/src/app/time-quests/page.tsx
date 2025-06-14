"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Trophy, 
  MapPin, 
  Clock, 
  Plus, 
  Target, 
  User, 
  CheckCircle, 
  XCircle, 
  Compass,
  Calendar,
  Award,
  AlertCircle,
  Copy,
  ExternalLink,
  Home
} from "lucide-react";
import { 
  getAllQuests, 
  createQuest, 
  changeWinner, 
  sendReward, 
  checkWhitelist,
  connectWallet 
} from "../utils/web3Utils";
import { getCurrentLocation, calculateDistance } from "../utils/geoUtils";

interface Quest {
  id: number;
  title: string;
  creator: string;
  clue: string;
  expiresAt: number;
  isActive: boolean;
  latitude: string;
  longitude: string;
  winner: string;
}

interface QuestFormData {
  title: string;
  clue: string;
  expirySeconds: number;
  latitude: string;
  longitude: string;
  rewardAmount: string;
}

export default function QuestManager() {
  // State management
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  
  // UI state
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'list' | 'create' | 'quest'>('list');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  
  // Form data
  const [questForm, setQuestForm] = useState<QuestFormData>({
    title: '',
    clue: '',
    expirySeconds: 86400, // 24 hours in seconds
    latitude: '',
    longitude: '',
    rewardAmount: '5'
  });
  
  // Action states
  const [creatingQuest, setCreatingQuest] = useState<boolean>(false);
  const [verifyingLocation, setVerifyingLocation] = useState<boolean>(false);
  const [updatingWinner, setUpdatingWinner] = useState<boolean>(false);
  const [winnerAddress, setWinnerAddress] = useState<string>("");
  const [rewardResults, setRewardResults] = useState<{[key: number]: any}>({});

  // Load initial data
  useEffect(() => {
    loadQuests();
    // Auto-refresh quests every 30 seconds
    const interval = setInterval(loadQuests, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get user location on component mount
  useEffect(() => {
    getCurrentLocation()
      .then(location => setUserLocation(location))
      .catch(err => console.log("Location access denied:", err));
  }, []);

  // Check expired quests and send rewards
  useEffect(() => {
    checkExpiredQuests();
  }, [quests]);

  const loadQuests = async () => {
    try {
      setLoading(true);
      const result = await getAllQuests();
      if (result.success && result.quests) {
        setQuests(result.quests);
      } else {
        setError(result.error || "Failed to load quests");
      }
    } catch (error) {
      console.error("Error loading quests:", error);
      setError("Failed to load quests");
    } finally {
      setLoading(false);
    }
  };

  const checkExpiredQuests = async () => {
    const now = Math.floor(Date.now() / 1000);
    const expiredQuests = quests.filter(quest => 
      !quest.isActive && 
      quest.expiresAt < now && 
      quest.winner !== quest.creator && 
      !rewardResults[quest.id]
    );

    for (const quest of expiredQuests) {
      try {
        console.log(`Sending reward for expired quest ${quest.id} to winner ${quest.winner}`);
        const result = await sendReward(quest.winner, questForm.rewardAmount);
        setRewardResults(prev => ({
          ...prev,
          [quest.id]: result
        }));
      } catch (error) {
        console.error(`Failed to send reward for quest ${quest.id}:`, error);
      }
    }
  };

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      
      // Check if whitelisted
    //   const whitelistResult = await checkWhitelist(address);
    //   if (whitelistResult.success) {
    //     setIsWhitelisted(whitelistResult.isWhitelisted || false);
    //   }
    setIsWhitelisted(true); // For testing, assume user is whitelisted
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError("Failed to connect wallet");
    }
  };

  const handleCreateQuest = async () => {
    if (!isWhitelisted) {
      setError("You must be whitelisted to create quests");
      return;
    }

    try {
      setCreatingQuest(true);
      setError("");
      
      const result = await createQuest(
        questForm.clue,
        questForm.title,
        questForm.expirySeconds,
        questForm.latitude,
        questForm.longitude
      );
      
      if (result.success) {
        console.log("Quest created successfully!");
        setShowCreateForm(false);
        setActiveView('list');
        setQuestForm({
          title: '',
          clue: '',
          expirySeconds: 86400, // 24 hours in seconds
          latitude: '',
          longitude: '',
          rewardAmount: '5'
        });
        await loadQuests(); // Refresh quest list
      } else {
        setError(result.error || "Failed to create quest");
      }
    } catch (error) {
      console.error("Error creating quest:", error);
      setError("Failed to create quest");
    } finally {
      setCreatingQuest(false);
    }
  };

  const handleVerifyLocation = async (quest: Quest) => {
    if (!userLocation) {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
      } catch (error) {
        setError("Please enable location access to verify your position");
        return;
      }
    }

    try {
      setVerifyingLocation(true);
      setError("");
      
      const distance = calculateDistance(
        userLocation!.latitude,
        userLocation!.longitude,
        parseFloat(quest.latitude),
        parseFloat(quest.longitude)
      );
      
      // Check if within 100 meters
      if (distance <= 100) {
        console.log(`Location verified! Distance: ${Math.round(distance)}m`);
        setSelectedQuest(quest);
        setActiveView('quest');
      } else {
        setError(`You are ${Math.round(distance)}m away. You need to be within 100m of the location.`);
      }
    } catch (error) {
      console.error("Error verifying location:", error);
      setError("Failed to verify location");
    } finally {
      setVerifyingLocation(false);
    }
  };

  const handleUpdateWinner = async (questId: number) => {
    if (!winnerAddress) {
      setError("Please enter a winner address");
      return;
    }

    try {
      setUpdatingWinner(true);
      setError("");
      
      const result = await changeWinner(questId, winnerAddress);
      
      if (result.success) {
        console.log("Winner updated successfully!");
        setWinnerAddress("");
        await loadQuests(); // Refresh quest list
      } else {
        setError(result.error || "Failed to update winner");
      }
    } catch (error) {
      console.error("Error updating winner:", error);
      setError("Failed to update winner");
    } finally {
      setUpdatingWinner(false);
    }
  };

  const formatTimeRemaining = (expiresAt: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = expiresAt - now;
    
    if (remaining <= 0) return "Expired";
    
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute w-full h-full rounded-full border-4 border-t-[#6D3B00] border-r-[#6D3B00] border-b-[#6D3B00] border-l-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Image src="/compass.svg" alt="Compass" width={32} height={32} priority />
            </div>
          </div>
          <p className="text-lg text-[#6D3B00] font-serif">Loading quests...</p>
        </div>
      </div>
    );
  }

  // Quest List View
  if (activeView === 'list') {
    return (
      <div className="min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center text-[#3A2A18] py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-5xl font-bold mb-4 text-[#6D3B00]">
              Quest Manager
            </h1>
            <p className="font-serif text-lg max-w-2xl mx-auto mb-8 text-[#5E4B32]">
              Manage blockchain-verified treasure quests with automated rewards
            </p>
            
            {/* Wallet Connection */}
            {!walletAddress ? (
              <button
                onClick={handleConnectWallet}
                className="px-6 py-3 bg-[#6D3B00] text-[#FBF6E9] rounded-md font-bold hover:bg-[#8B4513] transition-colors shadow-lg flex items-center justify-center mx-auto font-serif"
              >
                <User className="h-5 w-5 mr-2" />
                Connect Wallet
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="px-4 py-2 rounded-md bg-[#211510] text-[#E6C887] font-mono text-sm">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isWhitelisted ? 'bg-[#2C5E1E] text-[#4CAF50]' : 'bg-[#5E1E1E] text-[#AF4C4C]'
                }`}>
                  {isWhitelisted ? 'Whitelisted' : 'Not Whitelisted'}
                </div>
                {isWhitelisted && (
                  <button
                    onClick={() => setActiveView('create')}
                    className="px-6 py-3 bg-[#6D3B00] text-[#FBF6E9] rounded-md font-bold hover:bg-[#8B4513] transition-colors flex items-center font-serif"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Quest
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="max-w-md mx-auto bg-[#5C0000]/20 border-2 border-[#8B0000] text-[#8B0000] rounded-md p-4 mb-8 text-center font-serif">
              {error}
            </div>
          )}

          {/* Quests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quests.map((quest) => (
              <div 
                key={quest.id}
                className="bg-[url('/map-paper.svg')] bg-cover bg-center p-6 rounded-md border-2 border-[#8B4513] shadow-xl relative"
              >
                {/* Status indicator */}
                <div className={`absolute top-4 right-4 w-4 h-4 rounded-full ${
                  quest.isActive ? 'bg-[#4CAF50] animate-pulse' : 'bg-[#AF4C4C]'
                }`}></div>
                
                <h3 className="text-xl font-bold mb-3 text-[#6D3B00] font-serif pr-8">
                  {quest.title}
                </h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-[#5E4B32] font-serif">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Expires: {formatTimeRemaining(quest.expiresAt)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-[#5E4B32] font-serif">
                    <User className="h-4 w-4 mr-2" />
                    <span>Creator: {quest.creator.slice(0, 8)}...</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-[#5E4B32] font-serif">
                    <Trophy className="h-4 w-4 mr-2" />
                    <span>Winner: {quest.winner.slice(0, 8)}...</span>
                  </div>
                </div>

                {/* Quest actions */}
                {quest.isActive ? (
                  <div className="space-y-3">
                    <div className="bg-[#2C1206]/20 p-3 rounded border border-[#8B4513]/30">
                      <p className="text-sm text-[#6D3B00] font-serif mb-2 font-bold">Clue:</p>
                      <p className="text-sm text-[#5E4B32] font-serif">{quest.clue}</p>
                    </div>
                    
                    <button
                      onClick={() => handleVerifyLocation(quest)}
                      disabled={verifyingLocation}
                      className="w-full px-4 py-2 bg-[#6D3B00] text-[#FBF6E9] rounded-md hover:bg-[#8B4513] transition-colors flex items-center justify-center font-serif"
                    >
                      {verifyingLocation ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#FBF6E9] border-t-transparent rounded-full animate-spin mr-2"></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Target className="h-4 w-4 mr-2" />
                          Verify Location
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-serif">
                      <XCircle className="h-4 w-4 mr-2 text-[#AF4C4C]" />
                      <span className="text-[#AF4C4C]">Quest Expired</span>
                    </div>
                    {rewardResults[quest.id] && (
                      <div className="text-xs text-[#4CAF50] font-serif">
                        Reward sent: {rewardResults[quest.id].success ? 'Success' : 'Failed'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty state */}
          {quests.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6">
                <Image src="/compass.svg" alt="Compass" width={80} height={80} className="opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-[#6D3B00] mb-2 font-serif">No Quests Found</h3>
              <p className="text-[#5E4B32] font-serif">Create your first quest to get started!</p>
            </div>
          )}

          {/* Back to Home */}
          <div className="mt-12 text-center">
            <a 
              href="/"
              className="inline-flex items-center text-[#6D3B00] hover:text-[#8B4513] transition-colors font-serif"
            >
              <Home className="h-4 w-4 mr-2" />
              Return to Main Hunt
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Create Quest View
  if (activeView === 'create') {
    return (
      <div className="min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center text-[#3A2A18] py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[url('/map-paper.svg')] bg-cover bg-center p-8 rounded-md border-2 border-[#8B4513] shadow-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#6D3B00] font-serif mb-2">Create New Quest</h2>
              <p className="text-[#5E4B32] font-serif">Design a treasure hunt for other explorers</p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-[#5C0000]/20 border-2 border-[#8B0000] text-[#8B0000] rounded-md p-4 mb-6 text-center font-serif">
                {error}
              </div>
            )}

            {/* Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#6D3B00] mb-2 font-serif">
                  Quest Title
                </label>
                <input
                  type="text"
                  value={questForm.title}
                  onChange={(e) => setQuestForm({...questForm, title: e.target.value})}
                  className="w-full p-3 bg-[#FBF6E9] border-2 border-[#8B4513] rounded-md text-[#3A2A18] font-serif"
                  placeholder="Enter quest title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6D3B00] mb-2 font-serif">
                  Clue
                </label>
                <textarea
                  value={questForm.clue}
                  onChange={(e) => setQuestForm({...questForm, clue: e.target.value})}
                  rows={3}
                  className="w-full p-3 bg-[#FBF6E9] border-2 border-[#8B4513] rounded-md text-[#3A2A18] font-serif"
                  placeholder="Write a cryptic clue that leads to the location"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#6D3B00] mb-2 font-serif">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0000001"
                    value={questForm.latitude}
                    onChange={(e) => setQuestForm({...questForm, latitude: e.target.value})}
                    className="w-full p-3 bg-[#FBF6E9] border-2 border-[#8B4513] rounded-md text-[#3A2A18] font-serif"
                    placeholder="0.000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6D3B00] mb-2 font-serif">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0000001"
                    value={questForm.longitude}
                    onChange={(e) => setQuestForm({...questForm, longitude: e.target.value})}
                    className="w-full p-3 bg-[#FBF6E9] border-2 border-[#8B4513] rounded-md text-[#3A2A18] font-serif"
                    placeholder="0.000000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#6D3B00] mb-2 font-serif">
                    Expiry (Seconds)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={questForm.expirySeconds}
                    onChange={(e) => setQuestForm({...questForm, expirySeconds: parseInt(e.target.value)})}
                    className="w-full p-3 bg-[#FBF6E9] border-2 border-[#8B4513] rounded-md text-[#3A2A18] font-serif"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6D3B00] mb-2 font-serif">
                    Reward (USDC)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={questForm.rewardAmount}
                    onChange={(e) => setQuestForm({...questForm, rewardAmount: e.target.value})}
                    className="w-full p-3 bg-[#FBF6E9] border-2 border-[#8B4513] rounded-md text-[#3A2A18] font-serif"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveView('list')}
                  className="flex-1 px-6 py-3 bg-[#8B4513]/30 text-[#6D3B00] rounded-md hover:bg-[#8B4513]/50 transition-colors font-serif"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleCreateQuest}
                  disabled={creatingQuest || !questForm.title || !questForm.clue || !questForm.latitude || !questForm.longitude}
                  className="flex-1 px-6 py-3 bg-[#6D3B00] text-[#FBF6E9] rounded-md hover:bg-[#8B4513] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-serif"
                >
                  {creatingQuest ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#FBF6E9] border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Quest'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quest Detail/Winner Update View
  if (activeView === 'quest' && selectedQuest) {
    return (
      <div className="min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center text-[#3A2A18] py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[url('/map-paper.svg')] bg-cover bg-center p-8 rounded-md border-2 border-[#8B4513] shadow-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#2C1206] rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-[#4CAF50]" />
              </div>
              <h2 className="text-3xl font-bold text-[#6D3B00] font-serif mb-2">Location Verified!</h2>
              <p className="text-[#5E4B32] font-serif">You found: {selectedQuest.title}</p>
            </div>

            {/* Quest Details */}
            <div className="bg-[#2C1206]/20 p-4 rounded border border-[#8B4513]/30 mb-6">
              <h3 className="text-lg font-bold text-[#6D3B00] font-serif mb-3">Quest Details</h3>
              <div className="space-y-2 text-sm font-serif">
                <div className="flex justify-between">
                  <span className="text-[#5E4B32]">Quest ID:</span>
                  <span className="text-[#6D3B00] font-mono">{selectedQuest.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5E4B32]">Creator:</span>
                  <span className="text-[#6D3B00] font-mono">{selectedQuest.creator.slice(0, 10)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5E4B32]">Current Winner:</span>
                  <span className="text-[#6D3B00] font-mono">{selectedQuest.winner.slice(0, 10)}...</span>
                </div>
              </div>
            </div>

            {/* Winner Update Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#6D3B00] font-serif">Update Winner</h3>
              
              <div>
                <label className="block text-sm font-medium text-[#6D3B00] mb-2 font-serif">
                  Winner Wallet Address
                </label>
                <input
                  type="text"
                  value={winnerAddress}
                  onChange={(e) => setWinnerAddress(e.target.value)}
                  className="w-full p-3 bg-[#FBF6E9] border-2 border-[#8B4513] rounded-md text-[#3A2A18] font-mono text-sm"
                  placeholder="0x..."
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-[#5C0000]/20 border-2 border-[#8B0000] text-[#8B0000] rounded-md p-3 text-center font-serif text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveView('list')}
                  className="flex-1 px-6 py-3 bg-[#8B4513]/30 text-[#6D3B00] rounded-md hover:bg-[#8B4513]/50 transition-colors font-serif"
                >
                  Back to Quests
                </button>
                
                <button
                  onClick={() => handleUpdateWinner(selectedQuest.id)}
                  disabled={updatingWinner || !winnerAddress}
                  className="flex-1 px-6 py-3 bg-[#6D3B00] text-[#FBF6E9] rounded-md hover:bg-[#8B4513] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-serif"
                >
                  {updatingWinner ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#FBF6E9] border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Winner'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}