'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'

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
    <div className="max-w-2xl mx-auto p-12">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 shadow-lg rounded-lg p-6">
        <CardContent>
          <h2 className="text-2xl font-semibold text-center text-indigo-800 mb-6">Create a New Quest</h2>

          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700">Quest Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter quest name"
            />
          </div>

          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700">Clue</Label>
            <Textarea
              value={clue}
              onChange={(e) => setClue(e.target.value)}
              rows={3}
              className="mt-2 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter quest clue"
            />
          </div>

          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700">City</Label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-2 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter city"
            />
          </div>

          <div className="mb-4">
            <Label className="text-sm font-medium text-gray-700">Threshold Distance (meters)</Label>
            <Input
              type="number"
              value={thresholdDistance}
              onChange={(e) => setThresholdDistance(Number(e.target.value))}
              className="mt-2 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter threshold distance"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Latitude</Label>
              <Input
                value={latitude ?? ''}
                disabled
                className="mt-2 border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Longitude</Label>
              <Input
                value={longitude ?? ''}
                disabled
                className="mt-2 border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-4 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition ease-in-out duration-200 transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Quest'}
          </Button>

          {successMessage && (
            <p className="text-green-600 text-sm mt-2 text-center">{successMessage}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
