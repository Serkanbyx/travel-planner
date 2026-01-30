import { UnsplashImage } from '@/types';

// Unsplash API configuration
// For demo purposes, using Unsplash Source (no API key required)
// For production, use Unsplash API with your access key
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';

/**
 * Fetches a city cover image from Unsplash
 * @param city - City name to search for
 * @returns Promise with image URL or fallback
 */
export async function fetchCityImage(city: string): Promise<string> {
  // If no API key, use Unsplash Source (free, no auth required)
  if (!UNSPLASH_ACCESS_KEY) {
    // Using Unsplash Source for demo
    return `https://source.unsplash.com/800x600/?${encodeURIComponent(city)},city,travel`;
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(city + ' city')}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch image from Unsplash');
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const image: UnsplashImage = data.results[0];
      return image.urls.regular;
    }

    // Fallback to Unsplash Source if no results
    return `https://source.unsplash.com/800x600/?${encodeURIComponent(city)},city`;
  } catch (error) {
    console.error('Error fetching city image:', error);
    // Fallback to gradient placeholder
    return '';
  }
}

/**
 * Gets a placeholder gradient based on city name
 * @param city - City name
 * @returns CSS gradient string
 */
export function getCityGradient(city: string): string {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  ];

  // Use city name to consistently pick a gradient
  const index = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[index % gradients.length];
}
