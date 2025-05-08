'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Plus, MapPin, Compass, Target, Building } from 'lucide-react'

export default function CreateQuest() {
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [clue, setClue] = useState('')
  const [thresholdDistance, setThresholdDistance] = useState(20)
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch user location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLatitude(pos.coords.latitude)
      setLongitude(pos.coords.longitude)
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

    const res = await fetch('/api/add-place', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlace),
    })

    if (res.ok) {
      setSuccessMessage('Quest added successfully!')
      setName('')
      setClue('')
      setCity('')
      setThresholdDistance(20)
    } else {
      alert('Failed to add quest.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {/* Ambient glow spots */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/5 rounded-full filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fuchsia-500/5 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "2s" }}></div>
        
        {/* Stars/particles */}
        <div className="stars-container absolute top-0 left-0 w-full h-full">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Grid lines */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="w-full h-full bg-[radial-gradient(circle,_transparent_20%,_#4f46e5_20%,_#4f46e5_20.5%,_transparent_20.5%,_transparent_30%,_#4f46e5_30%,_#4f46e5_30.5%,_transparent_30.5%)] bg-[length:40px_40px]"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto p-8 pt-24 pb-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          <span className="block text-white">Create a New</span>
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 mt-1">
            Treasure Quest
          </span>
        </h1>

        <Separator className="mb-8 bg-gradient-to-r from-indigo-950 via-violet-900 to-indigo-950 opacity-30 h-px" />

        <Card className="bg-gradient-to-b from-gray-900/90 to-gray-950/90 backdrop-blur-sm border-indigo-900/50 shadow-xl relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] bg-indigo-600/10 rounded-full filter blur-3xl"></div>
          
          <CardHeader className="pb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-full p-4 shadow-lg shadow-indigo-900/20 mx-auto mb-4">
              <Compass className="h-full w-full text-white" strokeWidth={1.5} />
            </div>
            <CardTitle className="text-2xl font-bold text-center text-white">Create a New Quest</CardTitle>
            <p className="text-gray-400 text-center mt-2">
              Share your favorite location and create an adventure for others
            </p>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-indigo-300 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Quest Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-900/50 border-gray-800 focus:border-indigo-500 text-white placeholder:text-gray-500"
                  placeholder="Enter a memorable name for your quest"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-indigo-300 flex items-center">
                  <Compass className="h-4 w-4 mr-2" />
                  Clue
                </Label>
                <Textarea
                  value={clue}
                  onChange={(e) => setClue(e.target.value)}
                  rows={3}
                  className="bg-gray-900/50 border-gray-800 focus:border-indigo-500 text-white placeholder:text-gray-500"
                  placeholder="Write a cryptic hint that leads to your location"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-indigo-300 flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  City
                </Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-gray-900/50 border-gray-800 focus:border-indigo-500 text-white placeholder:text-gray-500"
                  placeholder="Enter the city where this location is found"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-indigo-300 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Threshold Distance (meters)
                </Label>
                <Input
                  type="number"
                  value={thresholdDistance}
                  onChange={(e) => setThresholdDistance(Number(e.target.value))}
                  className="bg-gray-900/50 border-gray-800 focus:border-indigo-500 text-white placeholder:text-gray-500"
                  placeholder="How close someone needs to be (in meters)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-indigo-300 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Latitude
                  </Label>
                  <div className="relative">
                    <Input
                      value={latitude ?? ''}
                      disabled
                      className="bg-gray-900/50 border-gray-800 text-gray-400"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-indigo-300 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Longitude
                  </Label>
                  <div className="relative">
                    <Input
                      value={longitude ?? ''}
                      disabled
                      className="bg-gray-900/50 border-gray-800 text-gray-400"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {successMessage && (
                <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-300 text-sm animate-pulse">
                  {successMessage}
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium transition-all shadow-lg shadow-indigo-900/40 disabled:opacity-70"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Quest...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Treasure Quest
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="link" className="text-indigo-400 hover:text-indigo-300" asChild>
            <a href="/">
              Back to Home
            </a>
          </Button>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        .animate-twinkle {
          animation: twinkle ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}