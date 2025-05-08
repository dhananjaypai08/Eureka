import { ethers } from 'ethers';
// Remove the top-level import
// import { create } from 'ipfs-http-client';
import contractData from '../../../abi/LocationPOAP.json';

export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );
};

// Enhanced check for wallet availability
export const isWalletAvailable = (): boolean => {
  const hasEthereum = typeof window !== 'undefined' && 
                     typeof (window as any).ethereum !== 'undefined';
  
  // On mobile, we might not detect ethereum directly, but MetaMask might still be installed
  if (isMobile() && !hasEthereum) {
    return true; // We'll assume it might be available and try deep linking
  }
  
  return hasEthereum;
};

// Connect to wallet and return address with mobile support
export const connectWallet = async (): Promise<string> => {
  if (!isWalletAvailable()) {
    throw new Error("No Web3 wallet detected. Please install MetaMask or another Web3 wallet.");
  }

  try {
    const ethereum = (window as any).ethereum;
    
    // If we're on mobile and don't have ethereum injected (but the function was called),
    // try to open MetaMask app via deep link
    if (isMobile() && !ethereum) {
      // Get the current URL to redirect back after connecting
      const currentUrl = window.location.href;
      
      // Create a deep link to MetaMask
      const metamaskDeepLink = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
      
      // Open the MetaMask app
      window.location.href = metamaskDeepLink;
      
      // This will redirect away, but we need to throw to prevent further execution
      throw new Error("Redirecting to MetaMask mobile app...");
    }
    
    // For desktop or if MetaMask is injected on mobile
    if (ethereum) {
      // Check if the provider is MetaMask
      const isMetaMask = ethereum.isMetaMask;
      
      // Request accounts access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      // Return the first account
      return accounts[0];
    } else {
      throw new Error("MetaMask not detected. Please make sure it's installed and unlocked.");
    }
  } catch (error) {
    // Check if it's our redirection error, in which case we just return empty to handle later
    if ((error as Error).message === "Redirecting to MetaMask mobile app...") {
      throw error; // Rethrow to handle in the UI
    }
    
    console.error("Error connecting to wallet:", error);
    throw new Error("Failed to connect to your wallet. Please try again.");
  }
};

// Send ETH reward to the user's wallet
export const sendReward = async (
  toAddress: string,
  amount: string
): Promise<{success: boolean, txHash: string, error?: string}> => {
  try {
    // For security, this should be done on a backend
    // This is just a simplified frontend implementation for demo purposes
    
    // Create provider - Updated for ethers v6
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    
    // Create wallet with private key - Updated for ethers v6
    const wallet = new ethers.Wallet(process.env.NEXT_PUBLIC_REWARD_PRIVATE_KEY || "", provider);
    
    // Convert ETH amount to wei - Updated for ethers v6
    const weiAmount = ethers.parseEther(amount);
    
    // Send transaction - Updated for ethers v6
    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: weiAmount
    });
    
    // Wait for transaction to be mined
    await tx.wait();
    
    return {
      success: true,
      txHash: tx.hash
    };
  } catch (error) {
    console.error("Error sending reward:", error);
    return {
      success: false,
      txHash: "",
      error: (error as Error).message
    };
  }
};

export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    // Dynamically import ipfs-http-client only when this function is called
    const { create } = await import('ipfs-http-client');
    
    const projectId = '2WCbZ8YpmuPxUtM6PzbFOfY5k4B';
    const projectSecretKey = 'c8b676d8bfe769b19d88d8c77a9bd1e2';
    const authorization = "Basic " + btoa(projectId + ":" + projectSecretKey);
    
    const ipfs = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization
      }
    });
    
    const added = await ipfs.add(file);
    return added.path;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error("Failed to upload file to IPFS.");
  }
};

export const mintNFT = async (to: string, ipfs: string, latitude: string, longitude: string, title: string): Promise<{success: boolean, txHash: string, error?: string}> => {
  try {
    const contractAddress = contractData.address;
    const abi = contractData.abi;
    
    // Create provider - Updated for ethers v6
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    
    // Create wallet with private key - Updated for ethers v6
    const wallet = new ethers.Wallet(process.env.NEXT_PUBLIC_MINT_PRIVATE_KEY || "", provider);
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    
    // Log parameters for debugging
    console.log('Calling safeMint with:', to, ipfs, latitude, longitude, title);
    
    // Call mintNFT function
    const tx = await contract.safeMint(to, ipfs, latitude, longitude, title);
    
    // Wait for transaction to be mined
    await tx.wait();
    
    return {
      success: true,
      txHash: tx.hash
    };
  } catch (error) {
    console.error("Error minting NFT:", error);
    return {
      success: false,
      txHash: "",
      error: (error as Error).message
    };
  }
};
