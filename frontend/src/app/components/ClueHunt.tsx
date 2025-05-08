import React, { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { calculateDistance, getCurrentLocation, shuffleArray, detectCity } from "../utils/geoUtils";
import { connectWallet, sendReward, uploadToIPFS, mintNFT } from "../utils/web3Utils";
import { 
  ExternalLink, 
  Camera, 
  MapPin, 
  Sparkles, 
  Trophy, 
  Map, 
  Compass, 
  Star, 
  Lock, 
  RotateCcw 
} from "lucide-react";
import { Place, UserLocation, VerificationResult, RewardResult, UserLocationMinimal } from "../types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent } from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@/components/ui/tooltip";

// Type definitions
type TreasureChestProps = {
  isOpen: boolean;
  treasuresCount: number;
};

type ExplorerAvatarProps = {
  level: number;
};

type TreasureMapProps = {
  places: Place[];
  completedPlaces: number[];
  currentPlaceIndex: number;
};

type MintMetadata = {
  ipfs_url: string;
  latitude: string;
  longitude: string;
  city: string;
};

type ExplorerLevel = {
  name: string;
  threshold: number;
  badge: string;
};

// Character progression levels
const EXPLORER_LEVELS: ExplorerLevel[] = [
  { name: "Novice Explorer", threshold: 0, badge: "🔍" },
  { name: "Adventurer", threshold: 1, badge: "🧭" },
  { name: "Treasure Hunter", threshold: 2, badge: "💎" },
  { name: "Master Explorer", threshold: 3, badge: "🏆" }
];

// Environment variables
const CLUES_PER_GAME = parseInt(process.env.NEXT_PUBLIC_CLUES_PER_GAME || "4");
const REWARD_AMOUNT = process.env.NEXT_PUBLIC_REWARD_AMOUNT || "0.01";

// 3D Models to represent treasures
const TREASURE_MODELS = [
  { name: "Quest 1", description: "A rare coin from a forgotten era" },
  { name: "Quest 2", description: "Grants the wearer enhanced perception" },
  { name: "Quest 3", description: "Once adorned the crown of royalty" },
  { name: "Quest 4", description: "Always points to hidden treasures" }
];

// Simple 3D Treasure Chest component built with primitives
const TreasureChest: React.FC<TreasureChestProps> = ({ isOpen, treasuresCount }) => {
  const chestRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Mesh>(null);
  
  // Handle chest opening animation
  useEffect(() => {
    if (lidRef.current) {
      lidRef.current.rotation.x = isOpen ? -Math.PI * 0.4 : 0;
    }
  }, [isOpen]);
  
  useFrame((state) => {
    if (chestRef.current) {
      chestRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });
  
  return (
    <group>
      <group ref={chestRef}>
        {/* Base of the chest */}
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[1, 0.4, 0.7]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Lid of the chest */}
        <mesh ref={lidRef} position={[0, 0.1, -0.35]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1, 0.2, 0.7]} />
          <meshStandardMaterial color="#A0522D" />
        </mesh>
        
        {/* Decorative elements */}
        <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.1, 0.03, 16, 32, Math.PI]} />
          <meshStandardMaterial color="#DAA520" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Display treasures when chest is open */}
        {isOpen && treasuresCount > 0 && (
          <group position={[0, 0.2, 0]}>
            {Array.from({ length: treasuresCount }).map((_, i) => (
              <mesh 
                key={i} 
                position={[
                  Math.sin(i * Math.PI * 2 / treasuresCount) * 0.25, 
                  0.2 + i * 0.1, 
                  Math.cos(i * Math.PI * 2 / treasuresCount) * 0.25
                ]}
                rotation={[0, i * Math.PI * 0.5, 0]}
              >
                <sphereGeometry args={[0.1, 32, 32]} />
                <meshStandardMaterial 
                  color={`hsl(${i * 60}, 100%, 75%)`} 
                  metalness={1}
                  roughness={0.3}
                  emissive={`hsl(${i * 60}, 100%, 50%)`}
                  emissiveIntensity={0.5}
                />
              </mesh>
            ))}
          </group>
        )}
      </group>
    </group>
  );
};

// Simple 3D Explorer Avatar component built with primitives
const ExplorerAvatar: React.FC<ExplorerAvatarProps> = ({ level }) => {
  const avatarRef = useRef<THREE.Group>(null);
  
  // Equipment upgrades based on level
  const equipmentByLevel = [
    { // Level 0: Basic explorer
      hat: false,
      backpack: false,
      compass: false,
      map: false,
    },
    { // Level 1: Adventurer
      hat: true,
      backpack: false,
      compass: false,
      map: false,
    },
    { // Level 2: Treasure Hunter
      hat: true,
      backpack: true,
      compass: false,
      map: false,
    },
    { // Level 3: Master Explorer
      hat: true,
      backpack: true,
      compass: true,
      map: true,
    }
  ];
  
  const currentEquipment = equipmentByLevel[Math.min(level, equipmentByLevel.length - 1)];
  
  useFrame((state) => {
    if (avatarRef.current) {
      avatarRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });
  
  return (
    <group ref={avatarRef}>
      {/* Body */}
      <group>
        {/* Head */}
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshStandardMaterial color="#F5DEB3" />
          
          {/* Eyes */}
          <mesh position={[0.08, 0.05, 0.2]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          <mesh position={[-0.08, 0.05, 0.2]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          
          {/* Mouth */}
          <mesh position={[0, -0.07, 0.2]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.1, 0.03, 0.01]} />
            <meshStandardMaterial color="#A52A2A" />
          </mesh>
        </mesh>
        
        {/* Torso */}
        <mesh position={[0, 0.4, 0]}>
          <capsuleGeometry args={[0.2, 0.4, 8, 16]} />
          <meshStandardMaterial color="#1E90FF" />
        </mesh>
        
        {/* Arms */}
        <mesh position={[0.25, 0.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <capsuleGeometry args={[0.08, 0.3, 8, 16]} />
          <meshStandardMaterial color="#1E90FF" />
        </mesh>
        <mesh position={[-0.25, 0.4, 0]} rotation={[0, 0, Math.PI / 4]}>
          <capsuleGeometry args={[0.08, 0.3, 8, 16]} />
          <meshStandardMaterial color="#1E90FF" />
        </mesh>
        
        {/* Legs */}
        <mesh position={[0.1, 0, 0]}>
          <capsuleGeometry args={[0.08, 0.3, 8, 16]} />
          <meshStandardMaterial color="#000080" />
        </mesh>
        <mesh position={[-0.1, 0, 0]}>
          <capsuleGeometry args={[0.08, 0.3, 8, 16]} />
          <meshStandardMaterial color="#000080" />
        </mesh>
      </group>
      
      {/* Equipment additions based on level */}
      {currentEquipment.hat && (
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.15, 32]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      )}
      
      {currentEquipment.backpack && (
        <mesh position={[0, 0.4, -0.25]}>
          <boxGeometry args={[0.3, 0.4, 0.15]} />
          <meshStandardMaterial color="#5F9EA0" />
        </mesh>
      )}
      
      {currentEquipment.compass && (
        <mesh position={[0.2, 0.5, 0.2]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 32]} />
          <meshStandardMaterial color="#C0C0C0" />
          <mesh position={[0, 0, 0.015]}>
            <boxGeometry args={[0.02, 0.02, 0.02]} />
            <meshStandardMaterial color="#FF0000" />
          </mesh>
        </mesh>
      )}
      
      {currentEquipment.map && (
        <mesh position={[-0.2, 0.5, 0.18]} rotation={[0.3, 0.2, 0.1]}>
          <boxGeometry args={[0.15, 0.15, 0.01]} />
          <meshStandardMaterial color="#F5DEB3" />
        </mesh>
      )}
    </group>
  );
};

// Simple 3D Map component without external texture
const TreasureMap: React.FC<TreasureMapProps> = ({ places, completedPlaces, currentPlaceIndex }) => {
  const mapRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (mapRef.current) {
      mapRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
    }
  });
  
  return (
    <group ref={mapRef}>
      {/* Base map */}
      <mesh position={[0, 0, -0.05]} rotation={[0, 0, 0]}>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial color="#F5DEB3" />
      </mesh>
      
      {/* Map grid lines */}
      <group position={[0, 0, -0.04]}>
        {/* Horizontal grid lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`h-${i}`} position={[0, -1 + i * 0.3, 0]}>
            <boxGeometry args={[2.9, 0.01, 0.001]} />
            <meshStandardMaterial color="#B8860B" opacity={0.5} transparent={true} />
          </mesh>
        ))}
        
        {/* Vertical grid lines */}
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={`v-${i}`} position={[-1.5 + i * 0.3, 0, 0]}>
            <boxGeometry args={[0.01, 1.9, 0.001]} />
            <meshStandardMaterial color="#B8860B" opacity={0.5} transparent={true} />
          </mesh>
        ))}
        
        {/* Decorative islands */}
        <mesh position={[0.5, 0.3, 0.001]}>
          <circleGeometry args={[0.4, 32]} />
          <meshStandardMaterial color="#90EE90" opacity={0.7} transparent={true} />
        </mesh>
        
        <mesh position={[-0.8, -0.5, 0.001]}>
          <circleGeometry args={[0.3, 32]} />
          <meshStandardMaterial color="#90EE90" opacity={0.7} transparent={true} />
        </mesh>
        
        {/* Decorative water */}
        <mesh position={[0, 0, -0.001]}>
          <planeGeometry args={[2.9, 1.9]} />
          <meshStandardMaterial color="#87CEEB" opacity={0.3} transparent={true} />
        </mesh>
      </group>
      
      {/* Location markers */}
      {places.map((place, index) => {
        const isCompleted = completedPlaces.includes(place.id);
        const isCurrent = index === currentPlaceIndex;
        const xPos = (index % 2 === 0 ? -1 : 1) * (0.5 + index * 0.2);
        const yPos = (index % 3 === 0 ? -1 : 1) * (0.3 + index * 0.1);
        
        return (
          <group key={place.id} position={[xPos, yPos, 0]}>
            <mesh position={[0, 0, 0.01]}>
              <circleGeometry args={[0.1, 32]} />
              <meshStandardMaterial 
                color={isCompleted ? "#4CAF50" : isCurrent ? "#2196F3" : "#757575"}
                emissive={isCurrent ? "#2196F3" : "#000000"}
                emissiveIntensity={isCurrent ? 0.5 : 0}
              />
            </mesh>
            <Text
              position={[0, -0.15, 0.01]}
              fontSize={0.08}
              color={isCompleted ? "#4CAF50" : isCurrent ? "#2196F3" : "#757575"}
              anchorX="center"
              anchorY="middle"
            >
              {index + 1}
            </Text>
            {isCurrent && (
              <mesh position={[0, 0, 0.02]}>
                <ringGeometry args={[0.12, 0.13, 32]} />
                <meshStandardMaterial color="#2196F3" emissive="#2196F3" emissiveIntensity={0.5} />
              </mesh>
            )}
          </group>
        );
      })}
      
      {/* X marks the spot for completed locations */}
      {completedPlaces.map((placeId) => {
        const index = places.findIndex(p => p.id === placeId);
        if (index === -1) return null;
        
        const xPos = (index % 2 === 0 ? -1 : 1) * (0.5 + index * 0.2);
        const yPos = (index % 3 === 0 ? -1 : 1) * (0.3 + index * 0.1);
        
        return (
          <group key={`x-${placeId}`} position={[xPos, yPos, 0.02]}>
            <mesh rotation={[0, 0, Math.PI/4]}>
              <boxGeometry args={[0.15, 0.03, 0.01]} />
              <meshStandardMaterial color="#A52A2A" />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI/4]}>
              <boxGeometry args={[0.15, 0.03, 0.01]} />
              <meshStandardMaterial color="#A52A2A" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

interface ClueHuntProps {
  initialUserLocation: UserLocation;
}

// Main component
export const ClueHunt: React.FC<ClueHuntProps> = ({ initialUserLocation }) => {
  // Game state
  const [places, setPlaces] = useState<Place[]>([]);
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState<number>(0);
  const [completedPlaces, setCompletedPlaces] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  
  // Character progression
  const [explorerLevel, setExplorerLevel] = useState<number>(0);
  const [explorerXP, setExplorerXP] = useState<number>(0);
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [treasuresCollected, setTreasuresCollected] = useState<string[]>([]);
  const [showNewTreasure, setShowNewTreasure] = useState<boolean>(false);
  const [newTreasure, setNewTreasure] = useState<string>("");
  
  // 3D view controls
  const [rotateChest, setRotateChest] = useState<boolean>(false);
  const [openChest, setOpenChest] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [showAvatar, setShowAvatar] = useState<boolean>(false);
  
  // Image capture state
  const [imageUploaded, setImageUploaded] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mintLoader, setMintLoader] = useState<boolean>(false);
  const [currentUserLocation, setCurrentUserLocation] = useState<UserLocationMinimal | null>(null);
  const [ImageUserMintData, setImageUserMintData] = useState<MintMetadata[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Animation states
  const [typedClue, setTypedClue] = useState<string>("");
  const [showVerificationAnimation, setShowVerificationAnimation] = useState<boolean>(false);
  const [progressPulse, setProgressPulse] = useState<boolean>(false);
  const [confetti, setConfetti] = useState<boolean>(false);
  const [clueFound, setClueFound] = useState<boolean>(false);

  // Location state
  const [distances, setDistances] = useState<{[key: number]: number}>({});
  const [verifying, setVerifying] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  
  // Wallet state
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [connectingWallet, setConnectingWallet] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string>("");
  const [sendingReward, setSendingReward] = useState<boolean>(false);
  const [rewardResult, setRewardResult] = useState<RewardResult | null>(null);
  
  const explorerBaseUrl = "https://sepolia.basescan.org/tx/";
  const currentPlace = places[currentPlaceIndex];
  
  // Load places from places.json and select random ones for this game
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/places.json');
        const allPlaces: Place[] = await response.json();
        
        // Filter places by user's city
        const cityPlaces = allPlaces.filter(place => 
          place.city.toLowerCase() === initialUserLocation.city.toLowerCase()
        );
        
        // If no places found in user's city, use nearby places as fallback
        let selectedPlaces: Place[] = [];
        
        if (cityPlaces.length >= CLUES_PER_GAME) {
          // If we have enough places in the city, randomly select the required number
          selectedPlaces = shuffleArray(cityPlaces).slice(0, CLUES_PER_GAME);
        } else if (cityPlaces.length > 0) {
          // If we have some places in the city but not enough, use all of them
          selectedPlaces = cityPlaces;
        } else {
          // If no places in the city, calculate distances and use the closest ones
          const distanceMap: {[key: number]: number} = {};
          
          allPlaces.forEach(place => {
            const distance = calculateDistance(
              initialUserLocation.latitude,
              initialUserLocation.longitude,
              place.latitude,
              place.longitude
            );
            distanceMap[place.id] = distance;
          });
          
          // Sort places by distance and take the closest ones
          selectedPlaces = [...allPlaces]
            .sort((a, b) => distanceMap[a.id] - distanceMap[b.id])
            .slice(0, CLUES_PER_GAME);
        }
        
        // Calculate initial distances to each place
        const distanceMap: {[key: number]: number} = {};
        selectedPlaces.forEach(place => {
          const distance = calculateDistance(
            initialUserLocation.latitude,
            initialUserLocation.longitude,
            place.latitude,
            place.longitude
          );
          distanceMap[place.id] = distance;
        });
    
        setPlaces(selectedPlaces);
        setDistances(distanceMap);
        setLoading(false);
        
        // Show initial avatar after loading
        setTimeout(() => {
          setShowAvatar(true);
        }, 1000);
      } catch (error) {
        console.error("Error fetching places:", error);
        setError("Failed to load location data. Please try again.");
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [initialUserLocation]);

  // Typing animation for clue text
  useEffect(() => {
    if (!currentPlace) return;
    
    // Reset typed clue when place changes
    setTypedClue("");
    
    let index = 0;
    const text = currentPlace.clue;
    
    // Typing animation interval
    const typingInterval = setInterval(() => {
      if (index < text.length) {
        setTypedClue((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 30); // Speed of typing
    
    return () => clearInterval(typingInterval);
  }, [currentPlace]);
  
  // Update explorer level based on completed places
  useEffect(() => {
    const completedCount = completedPlaces.length;
    const newXP = completedCount * 25; // 25 XP per place
    
    setExplorerXP(newXP);
    
    // Find appropriate level
    const newLevel = EXPLORER_LEVELS.findIndex(
      (level, index) => {
        const nextLevel = EXPLORER_LEVELS[index + 1];
        return nextLevel ? completedCount >= level.threshold && completedCount < nextLevel.threshold : completedCount >= level.threshold;
      }
    );
    
    if (newLevel !== -1 && newLevel > explorerLevel) {
      setExplorerLevel(newLevel);
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  }, [completedPlaces, explorerLevel]);

  // Handle place completion and treasure rewards
  useEffect(() => {
    if (!imageUploaded || !currentPlace) return;
    
    // Mark place as completed
    setCompletedPlaces(prev => [...prev, currentPlace.id]);
    
    // Add treasure reward for every completion
    if (currentPlaceIndex < TREASURE_MODELS.length) {
      const newTreasure = TREASURE_MODELS[currentPlaceIndex].name;
      setTreasuresCollected(prev => [...prev, newTreasure]);
      setNewTreasure(newTreasure);
      setShowNewTreasure(true);
      
      // Open chest to show new treasure
      setOpenChest(true);
      
      setTimeout(() => {
        setShowNewTreasure(false);
      }, 3000);
    }
    
    // Reset states
    setClueFound(false);
    setImageUploaded(false);
    
    // Move to next clue or complete game
    setTimeout(() => {
      if (currentPlaceIndex < places.length - 1) {
        setCurrentPlaceIndex(currentPlaceIndex + 1);
        setVerificationResult(null);
      } else {
        // Last place verified - show reward screen
        setGameCompleted(true);
      }
    }, 1000);
  }, [imageUploaded, currentPlace, currentPlaceIndex, places.length]);

  // Verify user's current location against the target place
  const handleVerifyLocation = async () => {
    setVerifying(true);
    setLocationError("");
    setVerificationResult(null);
    setShowVerificationAnimation(true);
    
    try {
      // Get the current user location when they click verify
      const currentUserLocation = await getCurrentLocation();
      setCurrentUserLocation(currentUserLocation);
      
      if (!currentPlace) {
        throw new Error("No active location to verify against");
      }
      
      // Calculate the distance between the current user location and the target place
      const currentDistance = calculateDistance(
        currentUserLocation.latitude,
        currentUserLocation.longitude,
        currentPlace.latitude,
        currentPlace.longitude
      );
      
      // Update the displayed distance for the current place
      setDistances(prev => ({
        ...prev,
        [currentPlace.id]: currentDistance
      }));
      
      // Trigger pulse animation on progress bar
      setProgressPulse(true);
      setTimeout(() => setProgressPulse(false), 1000);
      
      // Check if user is within the threshold distance
      if (currentDistance <= currentPlace.thresholdDistance) {
        setVerificationResult({
          success: true,
          message: `Location verified! You are ${Math.round(currentDistance)}m from the target.`
        });
        
        // Show confetti animation
        setConfetti(true);
        setTimeout(() => setConfetti(false), 3000);
        
        // Show map with the new location marked
        setTimeout(() => {
          setShowMap(true);
          setTimeout(() => {
            setShowMap(false);
            setClueFound(true);
          }, 3000);
        }, 1000);
        
      } else {
        setVerificationResult({
          success: false,
          message: `Too far away: ${Math.round(currentDistance)}m. Need to be within ${currentPlace.thresholdDistance}m.`
        });
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      setLocationError((error as Error).message);
    } finally {
      setVerifying(false);
      setTimeout(() => setShowVerificationAnimation(false), 1000);
    }
  };

  // Handle image upload after finding a location
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      try {
        setMintLoader(true);
        const ipfsUrl = await uploadToIPFS(file);
        console.log("File uploaded to IPFS:", ipfsUrl);
  
        if (!currentUserLocation) {
          setLocationError("Please verify your location first");
          return;
        }
        const city = await detectCity(
          currentUserLocation.latitude,
          currentUserLocation.longitude
        );
        const newmetadata: MintMetadata = {
          ipfs_url: ipfsUrl,
          latitude: currentUserLocation.latitude.toString(),
          longitude: currentUserLocation.longitude.toString(),
          city: city
        };
        setImageUserMintData(prevItems => [...prevItems, newmetadata]);
        setImageUploaded(true);
        setPreviewUrl(null);
      } catch (error) {
        console.error("Error uploading file to IPFS:", error);
        setLocationError("An unexpected error occurred");
      } finally {
        setMintLoader(false);
      }
    }
  };  

  // Connect to user's wallet
  const handleConnectWallet = async () => {
    setConnectingWallet(true);
    setWalletError("");
    
    try {
      const address = await connectWallet();
      setWalletAddress(address);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      
      // Special case for MetaMask mobile redirect
      if ((error as Error).message === "METAMASK_REDIRECT") {
        // We're already redirecting to MetaMask, so we show a message
        // This code won't actually execute because we're navigating away,
        // but we'll set it in case the redirect somehow fails
        setWalletError("Opening MetaMask mobile app...");
        return;
      }
      
      // For all other errors
      setWalletError((error as Error).message);
    } finally {
      setConnectingWallet(false);
    }
  };

  // Send reward to user's wallet
  const handleClaimReward = async () => {
    if (!walletAddress) {
      setWalletError("Please connect your wallet first");
      return;
    }
    
    setSendingReward(true);
    setRewardResult(null);
    
    try {
      // Mint NFTs for all collected locations
      for(let i = 0; i < ImageUserMintData.length; i++){
        const mintResult = await mintNFT(
          walletAddress,
          ImageUserMintData[i].ipfs_url,
          ImageUserMintData[i].latitude,
          ImageUserMintData[i].longitude,
          ImageUserMintData[i].city
        );
        
        if (!mintResult.success) {
          setLocationError("NFT minting failed");
          return;
        }
      }
      
      // Send ETH reward
      const result = await sendReward(walletAddress, REWARD_AMOUNT);
      setRewardResult(result);
      
      // Show confetti and open treasure chest on success
      if (result.success) {
        setConfetti(true);
        setOpenChest(true);
        setTimeout(() => setConfetti(false), 4000);
      }
    } catch (error) {
      console.error("Error sending reward:", error);
      setRewardResult({
        success: false,
        txHash: "",
        error: (error as Error).message
      });
    } finally {
      setSendingReward(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative w-32 h-32">
          <div className="absolute w-full h-full rounded-full border-4 border-t-indigo-600 border-r-purple-600 border-b-fuchsia-600 border-l-transparent animate-spin"></div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <Map className="h-12 w-12 text-white animate-pulse" />
          </div>
        </div>
        <p className="text-lg text-indigo-200 font-medium">Locating treasures nearby...</p>
        <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 w-1/2 animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto border-gray-800 shadow-xl bg-gradient-to-b from-gray-900 to-black overflow-hidden">
        <div className="absolute -inset-1/2 bg-gradient-to-r from-red-500/20 via-red-500/5 to-red-500/20 rounded-full blur-3xl"></div>
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <CardTitle className="text-xl text-white mb-2">Error</CardTitle>
          <CardDescription className="text-red-400 mb-6">{error}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-gray-700 hover:bg-gray-800 text-gray-300"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No places found state
  if (!currentPlace) {
    return (
      <Card className="w-full max-w-md mx-auto border-gray-800 shadow-xl bg-gradient-to-b from-gray-900 to-black">
        <CardContent className="p-8 text-center">
          <p className="text-lg text-gray-300">No nearby locations found.</p>
        </CardContent>
      </Card>
    );
  }

  // Game completed - show wallet connection and reward screen
  if (gameCompleted) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <Card className="border-gray-800 shadow-xl bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
          {/* Confetti animation */}
          {confetti && (
            <div className="confetti-container">
              {[...Array(50)].map((_, i) => (
                <div 
                  key={i} 
                  className="confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10%`,
                    backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${1 + Math.random() * 3}s`
                  }}
                ></div>
              ))}
            </div>
          )}
          
          {/* 3D Treasure display */}
          <div className="w-full h-48 mb-4 relative">
            <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={0.8} />
              <Suspense fallback={null}>
                <TreasureChest 
                  isOpen={openChest} 
                  treasuresCount={treasuresCollected.length}
                />
                <Environment preset="sunset" />
                <OrbitControls 
                  enableZoom={false} 
                  autoRotate={rotateChest}
                  autoRotateSpeed={5}
                />
              </Suspense>
            </Canvas>
            
            {/* UI controls positioned outside Canvas but overlayed using absolute positioning */}
            <div className="absolute top-2 right-2 flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="bg-black/30 hover:bg-black/50 text-white"
                onClick={() => setOpenChest(!openChest)}
              >
                {openChest ? "Close" : "Open"} Chest
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-black/30 hover:bg-black/50"
                onClick={() => setRotateChest(!rotateChest)}
              >
                <RotateCcw className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
          
          {/* Completion Header */}
          <CardHeader className="text-center pb-2">
            <Badge 
              className="mx-auto mb-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
            >
              {EXPLORER_LEVELS[explorerLevel].badge} {EXPLORER_LEVELS[explorerLevel].name}
            </Badge>
            <CardTitle className="text-2xl text-white mb-2">
              Quest Complete!
            </CardTitle>
            <CardDescription className="text-gray-400">
              You've successfully discovered all {places.length} treasures! 
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Treasures collected */}
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
              <h3 className="text-sm uppercase tracking-wide text-indigo-400 mb-3 font-medium">Treasures Discovered</h3>
              <div className="grid grid-cols-2 gap-2">
                {treasuresCollected.map((treasure, index) => (
                  <div 
                    key={treasure}
                    className="flex items-center bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-md p-2 border border-gray-700/30"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mr-2 text-xs">
                      {index + 1}
                    </div>
                    <div className="text-sm text-gray-200">{treasure}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-900/30 to-violet-900/30 border border-indigo-700/30 rounded-lg p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent bg-[length:200%_100%] animate-shine"></div>
              <p className="text-indigo-300 font-medium relative z-10">
                You've earned {REWARD_AMOUNT} ETH as a reward!
              </p>
            </div>

            {/* Wallet Connection */}
            {!walletAddress ? (
              <div className="space-y-4">
                <p className="text-gray-300 text-center">
                  Connect your wallet to claim your rewards
                </p>
                
                {walletError && (
                  <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <p className="text-sm text-red-300">{walletError}</p>
                  </div>
                )}
                
                <Button
                  onClick={handleConnectWallet}
                  disabled={connectingWallet}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium shadow-lg shadow-indigo-900/20 relative overflow-hidden"
                >
                  {connectingWallet ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting Wallet...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Connect Wallet
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between border border-gray-700/50">
                  <span className="text-gray-400">Wallet</span>
                  <span className="text-white font-mono text-sm">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>
                
                {rewardResult && (
                  <div className={`p-4 rounded-lg ${
                    rewardResult.success 
                      ? "bg-green-900/30 border border-green-700" 
                      : "bg-red-900/30 border border-red-700"
                  } relative overflow-hidden`}>
                    {rewardResult.success && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent bg-[length:200%_100%] animate-shine"></div>
                    )}
                    <p className={`text-sm ${
                      rewardResult.success ? "text-green-300" : "text-red-300"
                    } relative z-10`}>
                      {rewardResult.success 
                        ? `Success! Transaction sent: ${rewardResult.txHash.slice(0, 10)}...` 
                        : `Error: ${rewardResult.error}`}
                        {rewardResult.success && 
                        <a 
                          href={`${explorerBaseUrl}${rewardResult.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 mt-2 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View on Block Explorer</span>
                        </a>
                      }
                    </p>
                  </div>
                )}
                
                <Button
                  onClick={handleClaimReward}
                  disabled={sendingReward || rewardResult?.success}
                  className={`w-full ${
                    rewardResult?.success
                      ? "bg-green-600 text-white opacity-70"
                      : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-900/20"
                  }`}
                >
                  {sendingReward ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Reward...
                    </>
                  ) : rewardResult?.success ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      Reward Claimed!
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                      </svg>
                      Claim {REWARD_AMOUNT} ETH Reward
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <Button
            onClick={() => window.location.href = "/"}
            variant="ghost"
            className="text-gray-400 hover:text-white text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Regular clue hunt UI
  return (
    <div className="w-full max-w-lg mx-auto relative">
      {/* Level up notification */}
      {showLevelUp && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-indigo-900/90 to-violet-900/90 border border-indigo-500/50 rounded-lg p-4 text-center animate-bounce-soft shadow-xl max-w-xs backdrop-blur-md">
            <Sparkles className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <h3 className="text-yellow-300 font-bold text-lg">Level Up!</h3>
            <p className="text-white">You are now a {EXPLORER_LEVELS[explorerLevel].name}</p>
            <div className="mt-2 text-indigo-300 text-sm">New abilities unlocked</div>
          </div>
        </div>
      )}
      
      {/* New treasure notification */}
      {showNewTreasure && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-violet-900/90 to-fuchsia-900/90 border border-violet-500/50 rounded-lg p-4 text-center animate-float-slow shadow-xl max-w-xs backdrop-blur-md">
            <Trophy className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <h3 className="text-yellow-300 font-bold text-lg">Treasure Found!</h3>
            <p className="text-white">{newTreasure}</p>
            <div className="mt-2 text-violet-300 text-sm">Added to your collection</div>
          </div>
        </div>
      )}
      
      {/* Confetti animation */}
      {confetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div 
              key={i} 
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>
      )}
      
      {/* Character info and progress */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center">
            {EXPLORER_LEVELS[explorerLevel].badge}
          </div>
          <div className="ml-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm font-medium text-white">
                    {EXPLORER_LEVELS[explorerLevel].name}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Level {explorerLevel + 1} Explorer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center mt-1">
              <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  style={{ width: `${(explorerXP % 100) / 100 * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-400 ml-2">{explorerXP} XP</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10 bg-gray-800/50 border-gray-700/50"
                  onClick={() => setShowAvatar(!showAvatar)}
                >
                  <div className="relative">
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-indigo-400">
                      <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                      <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">View Explorer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10 bg-gray-800/50 border-gray-700/50"
                  onClick={() => setShowMap(!showMap)}
                >
                  <Map className="h-5 w-5 text-indigo-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">View Map</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10 bg-gray-800/50 border-gray-700/50"
                  onClick={() => {
                    setOpenChest(!openChest);
                    setShowMap(false);
                    setShowAvatar(false);
                  }}
                >
                  <Trophy className="h-5 w-5 text-indigo-400" />
                  {treasuresCollected.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs flex items-center justify-center rounded-full">
                      {treasuresCollected.length}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">View Treasures</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* 3D view sections */}
      {(showMap || showAvatar || openChest) && (
        <Card className="mb-4 overflow-hidden border-gray-800 shadow-md bg-gradient-to-b from-gray-900 to-black">
          <div className="w-full h-56 relative">
            <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={0.8} />
              <Suspense fallback={null}>
                {showMap && (
                  <TreasureMap 
                    places={places} 
                    completedPlaces={completedPlaces} 
                    currentPlaceIndex={currentPlaceIndex} 
                  />
                )}
                {showAvatar && (
                  <ExplorerAvatar level={explorerLevel} />
                )}
                {openChest && (
                  <TreasureChest 
                    isOpen={openChest} 
                    treasuresCount={treasuresCollected.length}
                  />
                )}
                <Environment preset="sunset" />
                <OrbitControls 
                  enableZoom={false} 
                  autoRotate={rotateChest}
                  autoRotateSpeed={5}
                />
              </Suspense>
            </Canvas>
            
            {/* Separate UI controls outside of Three.js context */}
            <div className="absolute bottom-2 right-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="bg-black/30 hover:bg-black/50 text-white text-xs"
                onClick={() => {
                  setShowMap(false);
                  setShowAvatar(false);
                  setOpenChest(false);
                }}
              >
                Close
              </Button>
            </div>
            
            <div className="absolute bottom-2 left-2">
              <Button
                variant="ghost"
                size="icon" 
                className="bg-black/30 hover:bg-black/50"
                onClick={() => setRotateChest(!rotateChest)}
              >
                <RotateCcw className="h-4 w-4 text-white" />
              </Button>
            </div>
            
            {showMap && (
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs p-1 px-2 rounded">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Current</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
      
      {/* Progress indicator */}
      <div className="mb-6 w-full rounded-full overflow-hidden bg-gray-800">
        <div className="relative h-4">
          <Progress 
            value={(currentPlaceIndex / places.length) * 100} 
            className={`h-4 transition-all duration-700 ${progressPulse ? 'animate-pulse' : ''}`}
          />
          <div className="absolute top-0 left-0 w-full h-full flex items-center">
            {places.map((_, index) => (
              <div 
                key={index} 
                className="flex-1 flex items-center justify-center z-10"
              >
                <div 
                  className={`w-3 h-3 rounded-full border-2 transition-all ${
                    index < currentPlaceIndex 
                      ? 'bg-white border-white scale-75' : 
                    index === currentPlaceIndex 
                      ? 'bg-transparent border-white scale-100 animate-pulse' : 
                      'bg-transparent border-gray-600 scale-75'
                  }`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Clue Card */}
      <Card className="border-gray-800 shadow-xl bg-gradient-to-b from-gray-900 to-black relative overflow-hidden mb-6">
        {/* Background glowing effect */}
        <div className="absolute -inset-1/4 bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-fuchsia-500/5 rounded-full blur-3xl transform -rotate-12 opacity-30 animate-pulse"></div>
        
        {/* Clue Header with animated icon */}
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full flex items-center justify-center mb-4 relative">
            <MapPin className={`h-8 w-8 text-white transition-all ${showVerificationAnimation ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`} />
            {showVerificationAnimation && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-indigo-400/70 animate-ping"></div>
                <MapPin className="absolute h-8 w-8 text-white animate-pulse" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl text-white mb-2">Clue {currentPlaceIndex + 1} of {places.length}</CardTitle>
          <CardDescription className="text-gray-400">
            Find this location and verify your presence
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Clue Content with typing animation */}
          <div className="transform hover:scale-[1.02] transition-all duration-300">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/80 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-violet-500/5 rounded-lg"></div>
              <h3 className="text-lg font-semibold text-indigo-400 mb-3 relative">Your Clue:</h3>
              <p className="text-xl text-white font-medium leading-relaxed relative min-h-16">
                {typedClue}
                <span className="typing-cursor">|</span>
              </p>
            </div>
          </div>

          {/* Verification Result with animation */}
          {verificationResult && (
            <div className={`p-4 rounded-lg ${
              verificationResult.success ? "bg-green-900/30 border border-green-700/50" : "bg-red-900/30 border border-red-700/50"
            } transform transition-all duration-300 ${verificationResult.success ? 'scale-105' : ''}`}>
              <div className="flex items-start">
                <div className={`mt-0.5 mr-3 ${
                  verificationResult.success ? "text-green-400" : "text-red-400"
                }`}>
                  {verificationResult.success ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                  )}
                </div>
                <p className={`text-sm ${
                  verificationResult.success ? "text-green-300" : "text-red-300"
                }`}>
                  {verificationResult.message}
                </p>
              </div>
            </div>
          )}
          
          {/* Location Error */}
          {locationError && (
            <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg animate-pulse">
              <div className="flex items-start">
                <div className="mt-0.5 mr-3 text-red-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <p className="text-sm text-red-300">
                  {locationError}
                </p>
              </div>
            </div>
          )}

          {/* Distance Indicator with animation */}
          <div className="transform hover:translate-y-px transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Proximity to Target:</span>
              <span className={`text-sm font-medium ${progressPulse ? 'text-indigo-400 scale-110' : 'text-white'} transition-all duration-300`}>
                {distances[currentPlace.id] < 1000 
                  ? `${Math.round(distances[currentPlace.id])}m` 
                  : `${(distances[currentPlace.id] / 1000).toFixed(2)}km`}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full mt-2 relative overflow-hidden">
              {/* Animated radar sweep effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent bg-[length:200%_100%] animate-sweep"></div>
              
              <div 
                className={`h-2 rounded-full transition-all duration-700 ${
                  distances[currentPlace.id] <= currentPlace.thresholdDistance 
                    ? "bg-green-500" 
                    : distances[currentPlace.id] <= currentPlace.thresholdDistance * 2 
                      ? "bg-yellow-500" 
                      : "bg-red-500"
                } ${progressPulse ? 'animate-pulse' : ''}`}
                style={{ 
                  width: `${Math.max(
                    5, 
                    Math.min(
                      100, 
                      100 - (distances[currentPlace.id] / (currentPlace.thresholdDistance * 5) * 100)
                    )
                  )}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Capture image interface when location is found */}
          {clueFound && (
            <div className="flex flex-col items-center gap-3 relative">
              {/* Visual flourish */}
              <div className="absolute -inset-4 bg-gradient-to-r from-green-500/10 via-indigo-500/5 to-violet-500/10 rounded-xl blur-md animate-pulse"></div>
              <div className="relative flex items-center justify-center mb-2 space-x-2">
                <Sparkles className="text-yellow-400 animate-pulse h-6 w-6" />
                <div className="text-xl font-bold text-white">Treasure Found!</div>
              </div>
              
              {/* Preview */}
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-64 h-64 object-cover rounded-xl border border-indigo-500/50 shadow-lg shadow-indigo-500/20 transition-all"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-xl"></div>
                </div>
              ) : (
                <div className="w-64 h-64 flex items-center justify-center border border-dashed border-indigo-300/50 rounded-xl text-gray-400 text-sm bg-black/30 relative overflow-hidden group transition-all hover:border-indigo-400/70">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex flex-col items-center">
                    <Camera className="h-8 w-8 text-indigo-400/70 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-center">Capture your discovery</div>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="relative flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md hover:shadow-indigo-500/20 border border-indigo-500/50 transition-all hover:-translate-y-1"
              >
                <Camera className="w-5 h-5" />
                <span>Take Photo</span>
                {mintLoader && (
                  <span className="absolute top-0 right-0 -mr-2 -mt-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white bg-violet-600 rounded-full p-0.5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  </span>
                )}
              </Button>

              {/* Hidden input */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          )}

          {/* Action Buttons */}
          {!clueFound && (
            <Button
              onClick={handleVerifyLocation}
              disabled={verifying}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-900/20 relative overflow-hidden disabled:opacity-70"
            >
              {verifying ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying Location...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Verify My Location
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white text-sm"
          onClick={() => window.location.href = "/"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Quit Hunt
        </Button>
        
        <Badge variant="outline" className="border-indigo-900/50 bg-indigo-950/30 text-indigo-300">
          {completedPlaces.length} / {places.length} Discovered
        </Badge>
      </div>
      
      {/* Custom animations */}
      <style jsx global>{`
        /* Typing cursor animation */
        .typing-cursor {
          display: inline-block;
          margin-left: 0.1em;
          animation: blink 1s infinite;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        /* Progress bar sweep animation */
        @keyframes sweep {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-sweep {
          animation: sweep 3s ease-in-out infinite;
        }
        
        /* Shine animation for progress bar */
        @keyframes shine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        .animate-shine {
          animation: shine 3s linear infinite;
        }
        
        /* Confetti animation */
        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 100;
          overflow: hidden;
        }
        
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 1px;
          animation: confetti-fall linear forwards;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        /* Soft bounce animation */
        @keyframes bounce-soft {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        .animate-bounce-soft {
          animation: bounce-soft 2s ease-in-out infinite;
        }
        
        /* Slow float animation */
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px) scale(1.05);
          }
        }
        
        .animate-float-slow {
          animation: float-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ClueHunt;