// Social sharing utilities

/**
 * Prepares and opens a sharing dialog for Twitter/X
 * 
 * @param text The text to share on Twitter
 * @param url Optional URL to include in the tweet
 * @param hashtags Optional array of hashtags to include
 * @param via Optional Twitter username to mention as source
 */
export const shareOnTwitter = (
    text: string,
    url?: string,
    hashtags?: string[],
    via?: string
  ): void => {
    let tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    
    if (url) {
      tweetUrl += `&url=${encodeURIComponent(url)}`;
    }
    
    if (hashtags && hashtags.length > 0) {
      tweetUrl += `&hashtags=${encodeURIComponent(hashtags.join(','))}`;
    }
    
    if (via) {
      tweetUrl += `&via=${encodeURIComponent(via)}`;
    }
    
    // Open in a new window
    window.open(tweetUrl, '_blank', 'width=550,height=420');
  };
  
  /**
   * Creates an image from a map element to share on social media
   * 
   * @param mapElementId The ID of the map element to capture
   * @returns Promise resolving to a data URL of the image
   */
  export const captureMapImage = async (mapElementId: string): Promise<string | null> => {
    try {
      // Check if html2canvas is available
      if (typeof window === 'undefined' || !(window as any).html2canvas) {
        console.error('html2canvas is not available. Make sure it is loaded.');
        return null;
      }
      
      const html2canvas = (window as any).html2canvas;
      const mapElement = document.getElementById(mapElementId);
      
      if (!mapElement) {
        console.error(`Element with ID ${mapElementId} not found`);
        return null;
      }
      
      const canvas = await html2canvas(mapElement, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#111827', // dark background to match theme
        scale: 2 // higher quality
      });
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error capturing map image:', error);
      return null;
    }
  };
  
  /**
   * Creates shareable content for social media based on user's exploration data
   * 
   * @param locationCount Total number of locations discovered
   * @param latestLocation Name of the latest location discovered
   * @param totalDistance Optional total distance traveled in meters
   * @returns An object with formatted text for different social platforms
   */
  export const createShareableContent = (
    locationCount: number,
    latestLocation: string,
    totalDistance?: number
  ): {
    twitter: string;
    facebook: string;
    linkedin: string;
  } => {
    const distanceText = totalDistance 
      ? ` covering ${(totalDistance / 1000).toFixed(1)}km` 
      : '';
    
    const twitter = `I've discovered ${locationCount} unique locations${distanceText} on ZK Hunt! My latest find: ${latestLocation}. Join the adventure with privacy-preserving verification! #ZKHunt #Web3 #LocationPrivacy`;
    
    const facebook = `🔍 My ZK Hunt Adventure Update 🔍\n\nI've discovered ${locationCount} unique locations${distanceText} using blockchain-verified location proofs that keep my data private! Just found: ${latestLocation}.\n\nJoin the treasure hunt and earn crypto rewards with zero-knowledge proof technology!`;
    
    const linkedin = `📍 Exploration Milestone: ${locationCount} Locations Discovered\n\nI've been participating in ZK Hunt, a Web3 project that uses zero-knowledge proofs to verify location without compromising privacy. My latest discovery: ${latestLocation}.\n\nThis innovative platform demonstrates how blockchain technology can enable location-based applications while preserving user privacy.`;
    
    return {
      twitter,
      facebook,
      linkedin
    };
  };