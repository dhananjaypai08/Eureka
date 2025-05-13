export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[url('/map-bg.svg')] bg-cover bg-center text-[#3A2A18] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-[#6D3B00]">
            About Our Treasure Quest
          </h1>
          <p className="font-serif text-xl text-[#5E4B32] max-w-2xl mx-auto leading-relaxed">
            Discover the future of location-based gaming with privacy at its core
          </p>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <div className="relative p-8 rounded-md bg-[url('/map-bg.svg')] bg-cover bg-center border-2 border-[#8B4513] shadow-xl">
            <div className="absolute -top-4 -left-4 w-12 h-12">
              <img src="/compass.svg" alt="Compass" className="w-full h-full" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rotate-12">
              <img src="/compass.svg" alt="Compass" className="w-full h-full opacity-40" />
            </div>
            
            <h2 className="text-3xl font-bold mb-6 flex items-center font-serif text-[#6D3B00]">
              <span className="w-10 h-10 rounded-full bg-[#8B4513] flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FBF6E9]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </span>
              How It Works
            </h2>
            
            <p className="text-[#5E4B32] text-lg mb-8 leading-relaxed font-serif letter-spacing-wide">
              Our location-based treasure hunt uses zero-knowledge proofs to verify your location
              without ever knowing exactly where you are - protecting your privacy while ensuring
              fair gameplay. Explore the world while maintaining complete location privacy.
            </p>
            
            {/* Hunt Process Timeline - Refined */}
            <div>
              <h3 className="text-xl font-medium mb-8 text-[#6D3B00] font-serif underline decoration-[#8B4513] underline-offset-4">
                The Hunt Process:
              </h3>
              
              <div className="space-y-12 relative pl-10">
                {/* Timeline connector - styled like a rope/twine */}
                <div className="absolute top-1 bottom-1 left-3 w-1 bg-[#8B4513] opacity-70"></div>
                
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-6 h-6 rounded-full bg-[#8B4513] flex items-center justify-center border-2 border-[#C28B4B]">
                    <span className="text-xs font-bold text-[#FBF6E9]">1</span>
                  </div>
                  <h4 className="text-lg font-medium text-[#8B4513] mb-2 font-serif tracking-wide">
                    Receive a Cryptic Clue
                  </h4>
                  <p className="text-[#5E4B32] font-serif leading-relaxed letter-spacing-wide">
                    Unravel mysteries and puzzles that lead you to interesting locations in your city or around the world.
                  </p>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-6 h-6 rounded-full bg-[#8B4513] flex items-center justify-center border-2 border-[#C28B4B]">
                    <span className="text-xs font-bold text-[#FBF6E9]">2</span>
                  </div>
                  <h4 className="text-lg font-medium text-[#8B4513] mb-2 font-serif tracking-wide">
                    Navigate to the Location
                  </h4>
                  <p className="text-[#5E4B32] font-serif leading-relaxed letter-spacing-wide">
                    Decode the clue and make your way to the specified location, experiencing the journey along the way.
                  </p>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-6 h-6 rounded-full bg-[#8B4513] flex items-center justify-center border-2 border-[#C28B4B]">
                    <span className="text-xs font-bold text-[#FBF6E9]">3</span>
                  </div>
                  <h4 className="text-lg font-medium text-[#8B4513] mb-2 font-serif tracking-wide">
                    Verify with Zero-Knowledge
                  </h4>
                  <p className="text-[#5E4B32] font-serif leading-relaxed letter-spacing-wide">
                    Once you're at the location, our app verifies your presence using advanced cryptographic proofs without tracking you.
                  </p>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-6 h-6 rounded-full bg-[#8B4513] flex items-center justify-center border-2 border-[#C28B4B]">
                    <span className="text-xs font-bold text-[#FBF6E9]">4</span>
                  </div>
                  <h4 className="text-lg font-medium text-[#8B4513] mb-2 font-serif tracking-wide">
                    Earn On-Chain Rewards
                  </h4>
                  <p className="text-[#5E4B32] font-serif leading-relaxed letter-spacing-wide">
                    Collect digital rewards on the Base blockchain for each location you successfully discover and verify.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px bg-[#8B4513]/50 w-20"></div>
            <h2 className="text-3xl font-bold text-center text-[#6D3B00] font-serif">Our Technology</h2>
            <div className="h-px bg-[#8B4513]/50 w-20"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[url('/card.svg')] bg-cover bg-center p-6 rounded-md border-2 border-[#8B4513] shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 mb-6 mx-auto">
                <img src="/globe.svg" alt="Zero-Knowledge Proofs" className="w-full h-full" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#6D3B00] text-center font-serif">Zero-Knowledge Proofs</h3>
              <p className="text-[#5E4B32] text-center font-serif leading-relaxed letter-spacing-wide">
                Advanced cryptography that allows location verification without revealing your exact coordinates, ensuring complete privacy.
              </p>
            </div>
            
            <div className="bg-[url('/card.svg')] bg-cover bg-center p-6 rounded-md border-2 border-[#8B4513] shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 mb-6 mx-auto">
                <img src="/base.svg" alt="Base Blockchain" className="w-full h-full" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#6D3B00] text-center font-serif">Based Eco</h3>
              <p className="text-[#5E4B32] text-center font-serif leading-relaxed letter-spacing-wide">
                Built on Base, A Layer 2 solution for Ethereum, providing low-cost, fast transactions for rewards and achievements.
              </p>
            </div>
            
            <div className="bg-[url('/card.svg')] bg-cover bg-center p-6 rounded-md border-2 border-[#8B4513] shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 mb-6 mx-auto">
                <img src="/next.svg" alt="Modern Frontend" className="w-full h-full" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#6D3B00] text-center font-serif">Modern Frontend</h3>
              <p className="text-[#5E4B32] text-center font-serif leading-relaxed letter-spacing-wide">
                Built with Next.js and Tailwind CSS for a responsive, fast, and visually stunning interface across all devices.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-[url('/map-bg.svg')] bg-cover bg-center p-8 rounded-md border-2 border-[#8B4513] max-w-lg mx-auto relative">
            <h3 className="text-2xl font-bold mb-4 text-[#6D3B00] font-serif">Ready to Begin Your Adventure?</h3>
            <p className="text-[#5E4B32] mb-6 font-serif leading-relaxed letter-spacing-wide">
              Join thousands of explorers who've already discovered hidden treasures around the world
            </p>
            <a href="/" className="inline-block px-8 py-4 rounded-md text-[#FBF6E9] font-medium bg-[#6D3B00] hover:bg-[#8B4513] shadow-lg transition-all transform hover:-translate-y-1 outline outline-1 outline-[#FBF6E9]/30">
              Start Your Quest
            </a>
            
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-8 h-8 rotate-12 opacity-40">
              <img src="/compass.svg" alt="Compass" className="w-full h-full" />
            </div>
            <div className="absolute bottom-4 left-4 w-8 h-8 -rotate-12 opacity-40">
              <img src="/compass.svg" alt="Compass" className="w-full h-full" />
            </div>
          </div>
        </div>
        
        {/* Back to Home button */}
        <div className="mt-12 text-center">
          <a 
            href="/"
            className="inline-flex items-center text-[#6D3B00] hover:text-[#8B4513] transition-colors font-serif hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Return to the Map
          </a>
        </div>
      </div>
    </main>
  );
}