import { ethers } from 'ethers';
// Remove the top-level import
// import { create } from 'ipfs-http-client';
import contractData from '../../../abi/LocationPOAP.json';

// Check if the user is on a mobile device
export const isMobile = (): boolean => {
  return typeof window !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Enhanced check for wallet availability
export const isWalletAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof (window as any).ethereum !== 'undefined';
};

// Connect to wallet and return address with mobile support
export async function connectWallet(): Promise<string> {
  if (typeof window === "undefined") throw new Error("No window");

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (!window.ethereum) {
    if (isMobile) {
      // MetaMask expects plain domain (no https://), unencoded
      const currentUrl = window.location.href.replace(/^https?:\/\//, "");
      window.location.href = `https://metamask.app.link/dapp/${currentUrl}`;
      throw new Error("METAMASK_REDIRECT");
    } else {
      throw new Error("MetaMask not installed");
    }
  }

  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  return accounts[0];
}

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// Minimal ERC20 ABI for transfer
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)"
];

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

    const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, wallet);
    const amount_parsed = ethers.parseUnits(amount, 6); // amount USDC
    
    // Convert ETH amount to wei - Updated for ethers v6
    const tx = await usdc.transfer(toAddress, amount_parsed);

    // Wait for it to be mined
    // await tx.wait();
    
    // // Send transaction - Updated for ethers v6
    // const tx = await wallet.sendTransaction({
    //   to: toAddress,
    //   value: weiAmount
    // });
    
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

// Ensures the wallet is connected to the correct network (Base Mainnet)
export const ensureCorrectNetwork = async (
  walletType: 'ethereum' | 'keplr'
): Promise<ethers.BrowserProvider> => {
  // Base Mainnet Chain ID
  const BASE_CHAIN_ID = Number(process.env.NEXT_PUBLIC_BASE_CHAIN_ID);
  const BASE_HEX_CHAIN_ID = `0x${BASE_CHAIN_ID.toString(16)}`;
  
  // Define Base Mainnet details
  const baseMainnet = {
    chainId: BASE_HEX_CHAIN_ID,
    chainName: "Base Mainnet",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [process.env.NEXT_PUBLIC_RPC_URL],
    blockExplorerUrls: [process.env.NEXT_PUBLIC_EXPLORER],
  };

  // Get the appropriate provider based on wallet type
  let provider: ethers.BrowserProvider;
  let ethereumProvider: any;

  if (walletType === 'ethereum') {
    if (!window.ethereum) {
      throw new Error("Ethereum provider not available. Please install MetaMask.");
    }
    ethereumProvider = window.ethereum;
    provider = new ethers.BrowserProvider(ethereumProvider);
  } else { // keplr
    if (!window.keplr || !window.keplr.ethereum) {
      throw new Error("Keplr Ethereum provider not available. Please install Keplr.");
    }
    ethereumProvider = window.keplr.ethereum;
    provider = new ethers.BrowserProvider(ethereumProvider);
  }

  try {
    // Check current network
    const network = await provider.getNetwork();
    const currentChainId = Number(network.chainId);
    
    console.log(`Current network: ${currentChainId}, Target network: ${BASE_CHAIN_ID}`);
    
    // If not on the correct network, try to switch
    if (currentChainId !== BASE_CHAIN_ID) {
      console.log("Switching to Base Mainnet...");
      
      try {
        // First try to switch to the network
        await ethereumProvider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: BASE_HEX_CHAIN_ID }],
        });
      } catch (switchError: any) {
        // If the network isn't added yet, add it
        if (switchError.code === 4902) {
          await ethereumProvider.request({
            method: "wallet_addEthereumChain",
            params: [baseMainnet],
          });
        } else {
          throw switchError;
        }
      }
      
      // Refresh provider after network switch
      provider = new ethers.BrowserProvider(ethereumProvider);
    }
    
    return provider;
  } catch (error) {
    console.error("Error ensuring correct network:", error);
    throw new Error(`Failed to switch to Base Mainnet: ${(error as Error).message}`);
  }
};