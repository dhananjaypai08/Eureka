import { ethers } from 'ethers';

// Check if the browser has a web3 provider (like MetaMask)
export const isWalletAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof (window as any).ethereum !== 'undefined';
};

// Connect to wallet and return address
export const connectWallet = async (): Promise<string> => {
  if (!isWalletAvailable()) {
    throw new Error("No Web3 wallet detected. Please install MetaMask or another Web3 wallet.");
  }

  try {
    // Request account access - using 'as any' to bypass TypeScript check
    const ethereum = (window as any).ethereum;
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    
    // Return the first account
    return accounts[0];
  } catch (error) {
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