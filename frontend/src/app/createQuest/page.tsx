'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Compass, Target, Building, Plus, ArrowLeft } from 'lucide-react'
import { detectCity } from '../utils/geoUtils'

export default function CreateQuest() {
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [clue, setClue] = useState('')
  const [thresholdDistance, setThresholdDistance] = useState(20)
  const [city, setCity] = useState('detecting...')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch user location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async(pos) => {
      setLatitude(pos.coords.latitude)
      setLongitude(pos.coords.longitude)
      const userCity = await detectCity(pos.coords.latitude, pos.coords.longitude)
      setCity(userCity)
    })
  }, [])

  const handleSubmit = async () => {
    if (!name || !clue || !latitude || !longitude || !city) {
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