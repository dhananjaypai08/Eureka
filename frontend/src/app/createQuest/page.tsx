'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Compass, Target, Building, Plus, ArrowLeft, Wallet, AlertTriangle, CheckCircle } from 'lucide-react'
import { detectCity } from '../utils/geoUtils'
import { BrowserProvider, Contract, Eip1193Provider } from 'ethers'
import contractData from '../../../abi/LocationPOAP.json'

// Define window augmentation for TypeScript
declare global {
  interface Window {
    keplr?: any & {
      ethereum?: any;
    };
  }
}

// Contract ABI - only the functions we need
const contractABI = contractData.abi;

// Contract address should be set in environment variables
const contractAddress = contractData.address;

export default function CreateQuest() {
  // Original state variables
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [clue, setClue] = useState('')
  const [thresholdDistance, setThresholdDistance] = useState(20)
  const [city, setCity] = useState('detecting...')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Wallet connection states
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [walletType, setWalletType] = useState<'ethereum' | 'keplr'>('ethereum')
  const [connectingWallet, setConnectingWallet] = useState<boolean>(false)
  const [walletError, setWalletError] = useState<string>('')
  const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false)
  const [checkingWhitelist, setCheckingWhitelist] = useState<boolean>(false)
  const [whitelistError, setWhitelistError] = useState<string>('')
  const [showConnectWallet, setShowConnectWallet] = useState<boolean>(true)

  // Fetch user location once wallet is connected and whitelisted
  useEffect(() => {
    if (walletAddress && isWhitelisted) {
      navigator.geolocation.getCurrentPosition(async(pos) => {
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
        const userCity = await detectCity(pos.coords.latitude, pos.coords.longitude)
        setCity(userCity)
      })
    }
  }, [walletAddress, isWhitelisted])

  // Connect Ethereum wallet (MetaMask)
  const connectEthereumWallet = async () => {
    if (!window.ethereum) {
      throw new Error("No Ethereum wallet detected. Please install MetaMask or another Ethereum wallet.")
    }
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts.length === 0) {
        throw new Error("No accounts found. Please connect your wallet.")
      }
      return accounts[0]
    } catch (error) {
      console.error("Error connecting wallet:", error)
      throw new Error((error as Error).message)
    }
  }

  // Connect Keplr wallet
  const connectKeplrWallet = async () => {
    if (!window.keplr) {
      throw new Error("Keplr wallet not detected. Please install the Keplr browser extension.")
    }
    
    try {
      const baseChainId = process.env.NEXT_PUBLIC_BASE_CHAIN_ID || "8453"
      
      // For Base chain (which is EVM), use Keplr's Ethereum provider
      if (baseChainId === "8453") {
        if (!window.keplr.ethereum) {
          throw new Error("Keplr's Ethereum provider not available. Please update Keplr to the latest version.")
        }
        
        // Add Base chain to Keplr if it's not already added
        try {
          // First try to switch to Base chain
          await window.keplr.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x2105" }], // 0x2105 is hex for 8453
          })
        } catch (switchError) {
          // If chain doesn't exist, add it
          if ((switchError as any).code === 4902) {
            try {
              await window.keplr.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x2105", // 8453 in hex
                    chainName: "Base Mainnet",
                    nativeCurrency: {
                      name: "Ethereum",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: ["https://mainnet.base.org"],
                    blockExplorerUrls: ["https://basescan.org"]
                  },
                ],
              })
            } catch (addError) {
              throw new Error(`Error adding Base chain to Keplr: ${(addError as Error).message}`)
            }
          } else {
            throw switchError
          }
        }
        
        // Request Ethereum accounts
        const accounts = await window.keplr.ethereum.request({
          method: "eth_requestAccounts",
        })
        
        if (!accounts || accounts.length === 0) {
          throw new Error("No Ethereum accounts found in Keplr. Please check your wallet.")
        }
        
        return accounts[0]
      } 
      // For Cosmos chains, use the original Keplr approach
      else {
        await window.keplr.enable(baseChainId)
        const offlineSigner = window.keplr.getOfflineSigner(baseChainId)
        const accounts = await offlineSigner.getAccounts()
        
        if (accounts.length === 0) {
          throw new Error("No accounts found in Keplr. Please connect your wallet.")
        }
        
        return accounts[0].address
      }
    } catch (error) {
      console.error("Error connecting Keplr wallet:", error)
      throw new Error((error as Error).message)
    }
  }

  // Handle wallet connection
  const handleConnectWallet = async (type: 'ethereum' | 'keplr') => {
    setConnectingWallet(true)
    setWalletError('')
    setWalletType(type)
    
    try {
      let address = ''
      if (type === 'ethereum') {
        address = await connectEthereumWallet()
      } else if (type === 'keplr') {
        address = await connectKeplrWallet()
      }
      
      setWalletAddress(address)
      setShowConnectWallet(false)
      
      // Check if wallet is whitelisted
      await checkWhitelistStatus(address, type)
    } catch (error) {
      console.error(`Error connecting ${type} wallet:`, error)
      setWalletError((error as Error).message)
    } finally {
      setConnectingWallet(false)
    }
  }

  // Check if wallet is whitelisted
  const checkWhitelistStatus = async (address: string, type: 'ethereum' | 'keplr') => {
    setCheckingWhitelist(true)
    setWhitelistError('')
    
    try {
      // For both wallet types in Base chain, we use the same approach since both provide EVM addresses
      if (!window.ethereum && type === 'ethereum') {
        throw new Error("Ethereum provider not found")
      }
      
      // Connect to the Ethereum contract to check whitelist status
      const provider = type === 'ethereum' 
        ? new BrowserProvider(window.ethereum as Eip1193Provider)
        : new BrowserProvider(window.keplr.ethereum as Eip1193Provider);
      
      const contract = new Contract(contractAddress, contractABI, provider)
      
      // Call the isWhitelisted function
      const whitelisted = await contract.isWhitelisted(address)
      setIsWhitelisted(whitelisted)
      
      if (!whitelisted) {
        setWhitelistError("Your wallet is not whitelisted to create quests. Please contact the administrator.")
      }
    } catch (error) {
      console.error("Error checking whitelist status:", error)
      setWhitelistError(`Failed to check whitelist status: ${(error as Error).message}`)
      setIsWhitelisted(false)
    } finally {
      setCheckingWhitelist(false)
    }
  }

  // Form submission
  const handleSubmit = async () => {
    if (!name || !clue || !latitude || !longitude || !city || !isWhitelisted) {
      alert('Please fill all fields.')
      return
    }

    setLoading(true)
    const newPlace = {
      name,
      clue,
      latitude,
      longitude,
      city,
      thresholdDistance,
      walletAddress, // Include the wallet address with the submission
    }

    try {
      const res = await fetch('/api/add-place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlace),
      })

      if (res.ok) {
        setSuccessMessage('Quest added successfully!')
        setName('')
        setClue('')
        setThresholdDistance(20)
      } else {
        alert('Failed to add quest.')
      }
    } catch (error) {
      console.error('Error adding quest:', error)
      alert('Failed to add quest. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Wallet connection UI
  if (showConnectWallet || !walletAddress) {
    return (
      <div className="min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center text-[#3A2A18] py-8">
        <div className="max-w-3xl mx-auto p-8 pt-24 pb-16">
          <h1 className="font-serif text-4xl font-bold text-center mb-8">
            <span className="block text-[#6D3B00]">Create a New</span>
            <span className="block text-[#8B4513] mt-1">
              Treasure Quest
            </span>
          </h1>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px bg-[#8B4513]/50 w-24"></div>
            <Image src="/compass.svg" alt="Compass" width={24} height={24} />
            <div className="h-px bg-[#8B4513]/50 w-24"></div>
          </div>

          <div className="bg-[url('/map-bg.svg')] bg-cover bg-center rounded-md border-2 border-[#8B4513] shadow-xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-16 h-16 rotate-12 opacity-30">
              <Image src="/compass.svg" alt="Compass" width={64} height={64} />
            </div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 -rotate-12 opacity-20">
              <Image src="/compass.svg" alt="Compass" width={64} height={64} />
            </div>
            
            <div className="p-8">
              <div className="mb-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4">
                  <Image src="/compass.svg" alt="Compass" width={64} height={64} />
                </div>
                <h2 className="text-2xl font-bold text-[#6D3B00] font-serif">Connect Your Wallet</h2>
                <p className="text-[#5E4B32] mt-2 font-serif">
                  Only whitelisted users can create treasure quests
                </p>
              </div>
              
              {/* Warning about whitelisting */}
              <div className="p-4 bg-[#F9E8C8] border-2 border-[#D4A956] rounded-md text-[#8B4513] text-sm font-serif relative mb-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-[#D4A956]" />
                  <span>Notice: Only whitelisted wallet addresses can create quests. Please ensure your wallet has been approved by the administrator.</span>
                </div>
              </div>
              
              {/* Wallet error message */}
              {walletError && (
                <div className="p-4 bg-[#7D3C3C]/10 border-2 border-[#7D3C3C] rounded-md text-[#7D3C3C] text-sm font-serif relative mb-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    {walletError}
                  </div>
                </div>
              )}
              
              {/* Wallet connection options */}
              <div className="space-y-4">
                <p className="text-center text-[#6D3B00] font-serif">Choose your wallet type:</p>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Ethereum wallet (MetaMask) */}
                  <button
                    onClick={() => handleConnectWallet('ethereum')}
                    disabled={connectingWallet}
                    className="p-4 bg-[#6D3B00] text-[#FBF6E9] rounded-md font-bold hover:bg-[#8B4513] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed font-serif"
                  >
                    {connectingWallet && walletType === 'ethereum' ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-[#FBF6E9] border-t-transparent rounded-full animate-spin mr-2"></div>
                        Connecting...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 35 33" className="mr-2">
                          <path fill="#FBF6E9" d="M17.5 0L7 16.2l10.5 6.3 10.5-6.3L17.5 0z"/>
                          <path fill="#FBF6E9" d="M7 16.2L17.5 33l10.5-16.8-10.5 6.3-10.5-6.3z"/>
                        </svg>
                        Connect MetaMask
                      </div>
                    )}
                  </button>
                  
                  {/* Keplr wallet */}
                  <button
                    onClick={() => handleConnectWallet('keplr')}
                    disabled={connectingWallet}
                    className="p-4 bg-[#6D3B00] text-[#FBF6E9] rounded-md font-bold hover:bg-[#8B4513] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed font-serif"
                  >
                    {connectingWallet && walletType === 'keplr' ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-[#FBF6E9] border-t-transparent rounded-full animate-spin mr-2"></div>
                        Connecting...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                          <path d="M21.5723 12.9051C21.5723 17.6101 17.7617 21.4251 13.0566 21.4251C8.35156 21.4251 4.54102 17.6101 4.54102 12.9051C4.54102 8.2002 8.35156 4.3896 13.0566 4.3896C17.7617 4.3896 21.5723 8.2002 21.5723 12.9051Z" fill="#FBF6E9"/>
                          <path d="M10.9863 10.875C10.9863 12.8379 9.39844 14.4258 7.43555 14.4258C5.47266 14.4258 3.88477 12.8379 3.88477 10.875C3.88477 8.91211 5.47266 7.32422 7.43555 7.32422C9.39844 7.32422 10.9863 8.91211 10.9863 10.875Z" fill="#FBF6E9"/>
                        </svg>
                        Connect Keplr
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center text-[#6D3B00] hover:text-[#8B4513] transition-colors font-serif">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to the Map
            </Link>
          </div>
        </div>

        {/* Decorative floating compass elements */}
        <div className="fixed top-1/4 left-8 w-16 h-16 opacity-20 animate-float-slow">
          <Image src="/compass.svg" alt="Compass" width={64} height={64} />
        </div>
        <div className="fixed bottom-1/4 right-8 w-12 h-12 opacity-20 animate-float-slow" style={{ animationDelay: "1.5s" }}>
          <Image src="/compass.svg" alt="Compass" width={48} height={48} />
        </div>

        {/* Custom animations */}
        <style jsx global>{`
          @keyframes float-slow {
            0%, 100% { transform: translateY(0) rotate(0); }
            50% { transform: translateY(-10px) rotate(5deg); }
          }
          .animate-float-slow {
            animation: float-slow 8s ease-in-out infinite;
          }
        `}</style>
      </div>
    )
  }

  // Checking whitelist status UI
  if (checkingWhitelist) {
    return (
      <div className="min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center text-[#3A2A18] py-8">
        <div className="max-w-3xl mx-auto p-8 pt-24 pb-16">
          <h1 className="font-serif text-4xl font-bold text-center mb-8">
            <span className="block text-[#6D3B00]">Create a New</span>
            <span className="block text-[#8B4513] mt-1">
              Treasure Quest
            </span>
          </h1>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px bg-[#8B4513]/50 w-24"></div>
            <Image src="/compass.svg" alt="Compass" width={24} height={24} />
            <div className="h-px bg-[#8B4513]/50 w-24"></div>
          </div>

          <div className="bg-[url('/map-bg.svg')] bg-cover bg-center rounded-md border-2 border-[#8B4513] shadow-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <Image src="/compass.svg" alt="Compass" width={64} height={64} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#8B4513] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#6D3B00] font-serif mb-4">Checking Whitelist Status</h2>
            <p className="text-[#5E4B32] font-serif">Please wait while we verify your wallet access...</p>
          </div>
        </div>

        {/* Decorative floating compass elements */}
        <div className="fixed top-1/4 left-8 w-16 h-16 opacity-20 animate-float-slow">
          <Image src="/compass.svg" alt="Compass" width={64} height={64} />
        </div>
        <div className="fixed bottom-1/4 right-8 w-12 h-12 opacity-20 animate-float-slow" style={{ animationDelay: "1.5s" }}>
          <Image src="/compass.svg" alt="Compass" width={48} height={48} />
        </div>

        {/* Custom animations */}
        <style jsx global>{`
          @keyframes float-slow {
            0%, 100% { transform: translateY(0) rotate(0); }
            50% { transform: translateY(-10px) rotate(5deg); }
          }
          .animate-float-slow {
            animation: float-slow 8s ease-in-out infinite;
          }
        `}</style>
      </div>
    )
  }

  // Not whitelisted UI
  if (!isWhitelisted) {
    return (
      <div className="min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center text-[#3A2A18] py-8">
        <div className="max-w-3xl mx-auto p-8 pt-24 pb-16">
          <h1 className="font-serif text-4xl font-bold text-center mb-8">
            <span className="block text-[#6D3B00]">Create a New</span>
            <span className="block text-[#8B4513] mt-1">
              Treasure Quest
            </span>
          </h1>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px bg-[#8B4513]/50 w-24"></div>
            <Image src="/compass.svg" alt="Compass" width={24} height={24} />
            <div className="h-px bg-[#8B4513]/50 w-24"></div>
          </div>

          <div className="bg-[url('/map-bg.svg')] bg-cover bg-center rounded-md border-2 border-[#8B4513] shadow-xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-16 h-16 rotate-12 opacity-30">
              <Image src="/compass.svg" alt="Compass" width={64} height={64} />
            </div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 -rotate-12 opacity-20">
              <Image src="/compass.svg" alt="Compass" width={64} height={64} />
            </div>
            
            <div className="p-8">
              <div className="mb-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4">
                  <Image src="/compass.svg" alt="Compass" width={64} height={64} />
                </div>
                <h2 className="text-2xl font-bold text-[#6D3B00] font-serif">Access Restricted</h2>
                <p className="text-[#5E4B32] mt-2 font-serif">
                  Your wallet is not whitelisted to create quests
                </p>
              </div>
              
              {/* Not whitelisted warning */}
              <div className="p-4 bg-[#7D3C3C]/10 border-2 border-[#7D3C3C] rounded-md text-[#7D3C3C] text-sm font-serif relative mb-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span>{whitelistError || "Your wallet is not approved to create treasure quests. Please contact the administrator to request access."}</span>
                </div>
              </div>
              
              {/* Connected wallet info */}
              <div className="p-4 bg-[#F9E8C8] border-2 border-[#D4A956] rounded-md font-serif relative mb-6">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <Wallet className="h-5 w-5 mr-2 text-[#8B4513]" />
                    <span className="text-[#8B4513] font-bold">Connected Wallet:</span>
                  </div>
                  <div className="bg-[#FBF6E9] p-2 rounded text-sm text-[#6D3B00] break-all">
                    {walletAddress}
                  </div>
                  <div className="text-xs text-[#8B4513] mt-2">
                    Wallet Type: {walletType === 'ethereum' ? 'MetaMask (Ethereum)' : 'Keplr (Cosmos)'}
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => setShowConnectWallet(true)}
                  className="w-full p-4 bg-[#6D3B00] text-[#FBF6E9] rounded-md font-bold hover:bg-[#8B4513] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed font-serif"
                >
                  <div className="flex items-center justify-center">
                    <Wallet className="h-5 w-5 mr-2" />
                    Try Another Wallet
                  </div>
                </button>
                
                <Link href="/" className="block w-full p-4 bg-[#F9E8C8] text-[#6D3B00] rounded-md font-bold hover:bg-[#F9E8C8]/80 transition-colors text-center shadow-lg font-serif">
                  <div className="flex items-center justify-center">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Return to the Map
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center text-[#6D3B00] hover:text-[#8B4513] transition-colors font-serif">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to the Map
            </Link>
          </div>
        </div>

        {/* Decorative floating compass elements */}
        <div className="fixed top-1/4 left-8 w-16 h-16 opacity-20 animate-float-slow">
          <Image src="/compass.svg" alt="Compass" width={64} height={64} />
        </div>
        <div className="fixed bottom-1/4 right-8 w-12 h-12 opacity-20 animate-float-slow" style={{ animationDelay: "1.5s" }}>
          <Image src="/compass.svg" alt="Compass" width={48} height={48} />
        </div>

        {/* Custom animations */}
        <style jsx global>{`
          @keyframes float-slow {
            0%, 100% { transform: translateY(0) rotate(0); }
            50% { transform: translateY(-10px) rotate(5deg); }
          }
          .animate-float-slow {
            animation: float-slow 8s ease-in-out infinite;
          }
        `}</style>
      </div>
    )
  }

  // Main form UI for whitelisted users
  return (
    <div className="min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center text-[#3A2A18] py-8">
      <div className="max-w-3xl mx-auto p-8 pt-24 pb-16">
        <h1 className="font-serif text-4xl font-bold text-center mb-8">
          <span className="block text-[#6D3B00]">Create a New</span>
          <span className="block text-[#8B4513] mt-1">
            Treasure Quest
          </span>
        </h1>

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px bg-[#8B4513]/50 w-24"></div>
          <Image src="/compass.svg" alt="Compass" width={24} height={24} />
          <div className="h-px bg-[#8B4513]/50 w-24"></div>
        </div>

        <div className="bg-[url('/map-bg.svg')] bg-cover bg-center rounded-md border-2 border-[#8B4513] shadow-xl relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-16 h-16 rotate-12 opacity-30">
            <Image src="/compass.svg" alt="Compass" width={64} height={64} />
          </div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 -rotate-12 opacity-20">
            <Image src="/compass.svg" alt="Compass" width={64} height={64} />
          </div>
          
          <div className="p-8">
            <div className="mb-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4">
                <Image src="/compass.svg" alt="Compass" width={64} height={64} />
              </div>
              <h2 className="text-2xl font-bold text-[#6D3B00] font-serif">Create a New Quest</h2>
              <p className="text-[#5E4B32] mt-2 font-serif">
                Share your favorite location and create an adventure for others
              </p>
            </div>
            
            {/* Wallet status banner */}
            <div className="p-4 bg-[#2C5E1E]/10 border-2 border-[#4CAF50] rounded-md text-[#2C5E1E] text-sm font-serif relative mb-6">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <div>
                  <span className="font-bold">Wallet Connected & Whitelisted</span>
                  <div className="text-xs mt-1 flex items-center">
                    <span className="truncate max-w-[200px]">{walletAddress}</span>
                    <button 
                      onClick={() => setShowConnectWallet(true)}
                      className="ml-2 underline text-[#2C5E1E] hover:text-[#4CAF50]"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#6D3B00] flex items-center font-serif">
                  <Target className="h-4 w-4 mr-2" />
                  Quest Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-[#FBF6E9] border-2 border-[#8B4513] rounded-md text-[#3A2A18] placeholder-[#8B4513]/50 font-serif"
                  placeholder="Enter a memorable name for your quest"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#6D3B00] flex items-center font-serif">
                  <Compass className="h-4 w-4 mr-2" />
                  Clue
                </label>
                <textarea
                  value={clue}
                  onChange={(e) => setClue(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-[#FBF6E9] border-2 border-[#8B4513] rounded-md text-[#3A2A18] placeholder-[#8B4513]/50 font-serif"
                  placeholder="Write a cryptic hint that leads to your location"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#6D3B00] flex items-center font-serif">
                  <Building className="h-4 w-4 mr-2" />
                  City
                </label>
                <div className="relative">
                  <input
                    value={city}
                    disabled={true}
                    className="w-full p-3 bg-[#FBF6E9] border-2 border-[#8B4513] rounded-md text-[#3A2A18] font-serif cursor-not-allowed"
                  />
                  {city === 'detecting...' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-[#8B4513] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#6D3B00] flex items-center font-serif">
                  <Target className="h-4 w-4 mr-2" />
                  Threshold Distance (meters)
                </label>
                <input
                  type="number"
                  value={thresholdDistance}
                  onChange={(e) => setThresholdDistance(Number(e.target.value))}
                  className="w-full p-3 bg-[#FBF6E9] border-2 border-[#8B4513] rounded-md text-[#3A2A18] placeholder-[#8B4513]/50 font-serif"
                  placeholder="How close someone needs to be (in meters)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#6D3B00] flex items-center font-serif">
                    <MapPin className="h-4 w-4 mr-2" />
                    Latitude
                  </label>
                  <div className="relative">
                    <input
                      value={latitude ?? ''}
                      disabled
                      className="w-full p-3 bg-[#FBF6E9] border-2 border-[#8B4513] rounded-md text-[#3A2A18]/70 font-serif cursor-not-allowed"
                    />
                    {!latitude && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-[#8B4513] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#6D3B00] flex items-center font-serif">
                    <MapPin className="h-4 w-4 mr-2" />
                    Longitude
                  </label>
                  <div className="relative">
                    <input
                      value={longitude ?? ''}
                      disabled
                      className="w-full p-3 bg-[#FBF6E9] border-2 border-[#8B4513] rounded-md text-[#3A2A18]/70 font-serif cursor-not-allowed"
                    />
                    {!longitude && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-[#8B4513] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {successMessage && (
                <div className="p-4 bg-[#115A2E]/10 border-2 border-[#115A2E] rounded-md text-[#115A2E] text-sm font-serif relative">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {successMessage}
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !latitude || !longitude || city === 'detecting...'}
                className="w-full p-4 bg-[#6D3B00] text-[#FBF6E9] rounded-md font-bold hover:bg-[#8B4513] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed font-serif"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-[#FBF6E9] border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Quest...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Treasure Quest
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center text-[#6D3B00] hover:text-[#8B4513] transition-colors font-serif">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to the Map
          </Link>
        </div>
      </div>

      {/* Decorative floating compass elements */}
      <div className="fixed top-1/4 left-8 w-16 h-16 opacity-20 animate-float-slow">
        <Image src="/compass.svg" alt="Compass" width={64} height={64} />
      </div>
      <div className="fixed bottom-1/4 right-8 w-12 h-12 opacity-20 animate-float-slow" style={{ animationDelay: "1.5s" }}>
        <Image src="/compass.svg" alt="Compass" width={48} height={48} />
      </div>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}