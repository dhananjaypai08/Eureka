# 🧭 Eureka - Location based scavenger hunting with Real Rewards

Eureka is a location-based treasure hunt platform that transforms everyday exploration into thrilling adventures with real crypto rewards. Users follow AI-generated cryptic clues to discover hidden gems in their cities, capturing proof of their discoveries while earning on-chain rewards and NFTs that prove their explorations.

[![Deployed on Base](https://img.shields.io/badge/Deployed%20on-Base-0052FF)](https://basescan.org)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black)](https://nextjs.org/)

## Live Deployments 
- [Play Game](https://eureka-swea.onrender.com/)
- [Mainnet Contract](https://basescan.org/address/0xcB15622d404fc10e49d6f53435814d9Fb27dbD72)

## 🌟 Features

- **Interactive Treasure Maps**: Beautiful, intuitive interface showing nearby quests
- **AI-Generated Clues**: Cryptic hints customized to each location created by LLMs
- **Privacy-Preserving Verification**: Zero-knowledge proofs verify locations without tracking users
- **On-Chain Rewards**: Earn 5 USDC on Base for each verified discovery (for early users)
- **Location POAPs**: Mint unique NFTs as proof of your explorations
- **Footprints Map**: Visualize and share your exploration journey
- **Leaderboards**: Compete with friends to become the top explorer
- **User-Generated Quests**: Add your favorite spots to the platform

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Blockchain**: Ethereum, Base L2, ERC-721 (NFTs), ERC2771 (Account Abstraction)
- **AI**: Cohere Command model for clue generation
- **Maps**: Mapbox, Leaflet for interactive map integration
- **Privacy**: ZokratesJS for zero-knowledge proofs
- **Storage**: IPFS via Infura for decentralized storage
- **Authentication**: Wallet connect (MetaMask, Keplr)

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- MetaMask or compatible wallet with Base network configured

## 🚀 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dhananjaypai08/Eureka.git
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Environment setup:
   Create a `.env` file in the root directory with the following variables:
   ```
   cp .env.example .env // configure your env credentials
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 🗺️ Usage

1. **Home Page**: View available quests on the treasure map
2. **Start Quest**: Click "Launch Game" to begin your treasure hunt
3. **Follow Clues**: Navigate to the location using the cryptic clues provided
4. **Verify Location**: When you think you're at the right spot, click "Verify Location"
5. **Capture Evidence**: Take a photo to prove your discovery
6. **Collect Rewards**: Connect your wallet to claim USDC rewards and mint your discovery NFT
7. **Share Achievements**: View your discoveries in the Footprints map and share on social media

## 🔗 Smart Contracts

The main contract powering Eureka is the LocationPOAP.sol contract deployed on Base. It handles:

- Minting location-based NFTs
- Verifying zero-knowledge proofs of location
- Managing rewards for discoveries
- Tracking user exploration history

## 🌱 Business Model

Eureka employs a novel "clue amplification" revenue model:
- Local businesses pay fees to prioritize their locations in nearby users' clue sequences
- They pre-fund quests to drive targeted foot traffic
- Explorers earn rewards for discovering new places
- The platform grows through user-generated content

## 🙏 Acknowledgments

- [Base](https://base.org/) for L2 infrastructure, helping us to sponsor for user's gas
- [Witness-chain](https://www.witnesschain.com/) for zk based locaton verification using campaigns
- [Cohere](https://cohere.com/) for AI capabilities
- [Mapbox](https://www.mapbox.com/) and [Leaflet](https://leafletjs.com/) for mapping
- [ZokratesJS](https://zokrates.github.io/) for zero-knowledge proofs
- [IPFS/Infura](https://infura.io/) for decentralized storage

## 📬 Contact

For questions or suggestions, please [open an issue](https://github.com/dhananjaypai08/Eureka/issues/new) or contact us at [dhananjay2002pai@gmail.com](mailto:dhananjay2002pai@gmail.com).

---

Built with ❤️ by the Eureka team during the Based Fellowship
