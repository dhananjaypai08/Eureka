# EUREKA🗺️🔍
A privacy-preserving location-based scavenger hunt powered by zero-knowledge proofs and blockchain rewards.

## 📋 Overview

ZK Location Hunt is a next-generation scavenger hunt application that allows users to discover real-world locations while maintaining complete privacy. Using zero-knowledge proofs, the application verifies users are at specific locations without revealing their exact coordinates, combining the thrill of discovery with robust privacy protection.

## ✨ Key Features
 
- **Privacy-First Location Verification:** Your location data never leaves your device
thanks to zero-knowledge proofs.

- **Blockchain-Verified Discoveries:** Mint unique NFTs/POAPs for each location you discover


- **Real Crypto Rewards:** Earn ETH rewards for completing quests

- **Interactive Map Interface:** View all your discoveries on an interactive map 

- **Custom Quest Creation:** Create personalized hunts for friends or 

- **Leaderboard System:** Compete with other explorers globally

## 🛠️ Technology Stack
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Privacy:** Zero-knowledge proofs using ZoKrates
- **Blockchain:** Ethereum/Base blockchain, ethers.js
- **Storage:** IPFS for decentralized content storage
- **Geolocation:** Browser Geolocation API, OpenCage for reverse geocoding
- **Maps:** Leaflet for interactive maps


## Prerequisites

- Node.js (v18+)
- Yarn or npm
- MetaMask or other Ethereum wallet
- Base network configured in your wallet

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/zk-location-hunt.git
cd eureka
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3.Create a `.env.local` file with the following variables:

```bash
NEXT_PUBLIC_RPC_URL=your_base_rpc_url
NEXT_PUBLIC_REWARD_PRIVATE_KEY=your_private_key_for_rewards
NEXT_PUBLIC_MINT_PRIVATE_KEY=your_private_key_for_minting
NEXT_PUBLIC_OPENCAGE_API_KEY=your_opencage_api_key
NEXT_PUBLIC_CLUES_PER_GAME=4
NEXT_PUBLIC_REWARD_AMOUNT=0.01
```
4. Run the development server:
   ```bash
   cd frontend
   npm run dev
   ```


## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1.Fork the repository
2.Create your feature branch `(git checkout -b feature/amazing-feature)`
3.Commit your changes `(git commit -m 'Add some amazing feature')`
4.Push to the branch `(git push origin feature/amazing-feature)`
5.Open a Pull Request

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
