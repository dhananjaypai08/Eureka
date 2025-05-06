// Place type definition
export interface Place {
    id: number;
    name: string;
    clue: string;
    latitude: number;
    longitude: number;
    city: string;
    thresholdDistance: number;
  }
  
  // User location type with city
  export interface UserLocation {
    latitude: number;
    longitude: number;
    city: string;
  }
  
  // Verification result type
  export interface VerificationResult {
    success: boolean;
    message: string;
  }
  
  // Reward result type
  export interface RewardResult {
    success: boolean;
    txHash: string;
    error?: string;
  }

  export interface UserLocationMinimal {
    latitude: number;
    longitude: number;
  }
    