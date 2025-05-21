// hooks/useCohereClues.ts
import { useState } from "react";
import { Place } from "../app/types";
import { detectCity } from "@/app/utils/geoUtils";
import { Groq } from "groq-sdk";

export const useCohereClues = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<String>("");

  // Initialize the Groq client with your API key
  const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  const groq = new Groq({
    apiKey: groqKey,
    dangerouslyAllowBrowser: true
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
      
      // Define the JSON schema for response validation
      const responseSchema = {
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
      };
      
      // Step 2: Generate clues using Groq with proper schema instructions
      const systemPrompt = `You are given a dictionary of location data and I want you to choose 3 nearest location to the user and choose those 3 randomly and Generate very very easy to decode clues from this data.

Your response MUST be a JSON object that strictly follows this schema:
{
  "places": [
    {
      "place_name": "string name of the location",
      "clue": "string containing an easy-to-decode clue about this location",
      "latitude": "string representation of latitude",
      "longitude": "string representation of longitude"
    }
  ]
}

Ensure you return EXACTLY 3 places, with all required fields, and valid coordinates.`;
      
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile", // Using Llama 3.3 70B model
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Choose 3 nearest places. Based on user's latitude and longitude generate places that are the nearest to the user and also if everything is in same distance then you can pick random places. User's Latitude: ${latitude} Longitude: ${longitude}. Generate clues from this data and give a JSON Response. The expected json data: ${JSON.stringify(placesData)}`
          }
        ],
        response_format: { 
          type: "json_object",
        },
        temperature: 0.7,
        max_completion_tokens: 1024,
      });
      
      // Parse the response
      if (!completion || !completion.choices || !completion.choices[0] || !completion.choices[0].message || !completion.choices[0].message.content) {
        throw new Error("Invalid response from Groq API");
      }
      
      const responseContent = completion.choices[0].message.content;
      console.log("response from Groq:", responseContent);
      // Parse JSON response
      let aiPlaces;
      try {
        const parsedContent = typeof responseContent === 'string' ? JSON.parse(responseContent) : responseContent;
        
        // Extract the places array from the response
        aiPlaces = parsedContent.places;
        
        if (!aiPlaces || !Array.isArray(aiPlaces)) {
          throw new Error("Invalid places data in the response");
        }
      } catch (parseError) {
        console.error("Error parsing Groq response:", parseError);
        throw new Error("Failed to parse the AI response");
      }
      
      // Convert to the format our app expects - same as the original Cohere implementation
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