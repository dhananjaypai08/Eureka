export default function AboutPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4 bg-black text-white">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            About Our Scavenger Hunt
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover the future of location-based gaming with privacy at its core
          </p>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <div className="relative p-8 rounded-xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 shadow-xl">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"></div>
            
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <span className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </span>
              How It Works
            </h2>
            
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Our location-based scavenger hunt uses zero-knowledge proofs to verify your location
              without ever knowing exactly where you are - protecting your privacy while ensuring
              fair gameplay. Explore the world while maintaining complete location privacy.
            </p>
            
            {/* Hunt Process Timeline - Refined */}
            <div>
              <h3 className="text-xl font-medium mb-8 text-white">The Hunt Process:</h3>
              
              <div className="space-y-12 relative pl-10">
                {/* Timeline connector line - positioned to align with circles */}
                <div className="absolute top-1 bottom-1 left-3 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
                
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <h4 className="text-lg font-medium text-blue-400 mb-2">Receive a Cryptic Clue</h4>
                  <p className="text-gray-300">
                    Unravel mysteries and puzzles that lead you to interesting locations in your city or around the world.
                  </p>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <h4 className="text-lg font-medium text-indigo-400 mb-2">Navigate to the Location</h4>
                  <p className="text-gray-300">
                    Decode the clue and make your way to the specified location, experiencing the journey along the way.
                  </p>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <h4 className="text-lg font-medium text-purple-400 mb-2">Verify with Zero-Knowledge</h4>
                  <p className="text-gray-300">
                    Once you're at the location, our app verifies your presence using advanced cryptographic proofs without tracking you.
                  </p>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
                    <span className="text-xs font-bold">4</span>
                  </div>
                  <h4 className="text-lg font-medium text-pink-400 mb-2">Earn On-Chain Rewards</h4>
                  <p className="text-gray-300">
                    Collect digital rewards on the Base blockchain for each location you successfully discover and verify.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-10 text-center">Our Technology Stack</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 shadow-lg hover:shadow-blue-900/20 transition-all group">
              <div className="w-16 h-16 rounded-lg bg-blue-500/10 mb-6 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-blue-400">Zero-Knowledge Proofs</h3>
              <p className="text-gray-400">
                Advanced cryptography that allows location verification without revealing your exact coordinates, ensuring complete privacy.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 shadow-lg hover:shadow-purple-900/20 transition-all group">
              <div className="w-16 h-16 rounded-lg bg-purple-500/10 mb-6 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-purple-400">Base Blockchain</h3>
              <p className="text-gray-400">
                Built on Coinbase's Layer 2 solution for Ethereum, providing low-cost, fast transactions for rewards and achievements.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 shadow-lg hover:shadow-pink-900/20 transition-all group">
              <div className="w-16 h-16 rounded-lg bg-pink-500/10 mb-6 flex items-center justify-center group-hover:bg-pink-500/20 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-pink-400">Modern Frontend</h3>
              <p className="text-gray-400">
                Built with Next.js and Tailwind CSS for a responsive, fast, and visually stunning interface across all devices.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a href="/hunt" className="inline-block px-8 py-4 rounded-lg text-white font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-blue-500/20 transition-all transform hover:-translate-y-1">
            Start Your Adventure
          </a>
        </div>
      </div>
    </main>
  );
}