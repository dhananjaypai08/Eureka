// hooks/useCohereClues.ts
import { useState } from "react";
import { Place } from "../app/types";
import { detectCity } from "@/app/utils/geoUtils";
import { CohereClientV2 } from 'cohere-ai';

export const useCohereClues = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<String>("");

  const cohereKey = process.env.NEXT_PUBLIC_COHERE_API_KEY;
  const cohere = new CohereClientV2({
    token: cohereKey,
  });

  const generateClues = async (
    latitude: number,
    longitude: number
  ): Promise<Place[]> => {
    setLoading(true);
    setError(null);

    try {
      const city = await detectCity(latitude, longitude);
      setCity(city);
      
      // Step 1: Get nearby places from Geoapify
      const threshold = 3000;
      const geoapifyKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
      const url = `https://api.geoapify.com/v2/places?categories=catering&filter=circle:${longitude},${latitude},${threshold}&limit=10&apiKey=${geoapifyKey}`;
      
      const placesResponse = await fetch(url);
      if (!placesResponse.ok) {
        throw new Error("Failed to fetch nearby places");
      }
      
      const placesData = await placesResponse.json();
      
      // Step 2: Generate clues using Cohere SDK
      const prompt = "You are given a dictionary of location data and I want you to choose 3 nearest location to the user and choose those 3 randomly and Generate very very easy to decode clues from this data and give a JSON Response. Note : The clues should be easy to find and decode";
      
      const cohereResponse = await cohere.chat({
        model: "command-a-03-2025",
        messages: [
          {
            role: "system",
            content: prompt
          },
          {
            role: "user",
            content: `Choose 3 nearest places. Based on user's latitude and longitude generate places that are the nearest to the user and also if everything is in same distance then you can pick random places. User's Latitude: ${latitude} Longitude: ${longitude}. Generate clues from this data and give a JSON Response. The data: ${JSON.stringify(placesData)}`
          }
        ],
        responseFormat: {
          type: "json_object",
          jsonSchema: {
            type: "object",
            properties: {
              places: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    place_name: { type: "string" },
                    clue: { type: "string" },
                    latitude: { type: "string" },
                    longitude: { type: "string" }
                  },
                  required: ["place_name", "clue", "latitude", "longitude"]
                }
              }
            },
            required: ["places"]
          }
        }
      });
      
      // Parse the response - the SDK might handle the JSON parsing for us
      if(!cohereResponse || !cohereResponse.message || !cohereResponse.message.content){
        return []
      }
      const aiPlaces = JSON.parse(cohereResponse.message.content[0].text).places;
      
      // Convert to the format our app expects
      const formattedPlaces: Place[] = aiPlaces.map((place: any, index: number) => ({
        id: 10000 + index, // Use high IDs to avoid conflicts
        name: place.place_name,
        clue: place.clue,
        latitude: parseFloat(place.latitude),
        longitude: parseFloat(place.longitude),
        city: city,
        thresholdDistance: 50
      }));
      
      return formattedPlaces;
    } catch (error) {
      console.error("Error generating clues:", error);
      setError((error as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    generateClues,
    loading,
    error
  };
};