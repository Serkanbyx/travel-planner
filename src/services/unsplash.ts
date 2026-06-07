import { UnsplashImage } from '@/types';

// Unsplash API access key. When absent, the app gracefully falls back to a
// gradient placeholder instead of relying on the deprecated source.unsplash.com
// endpoint (shut down by Unsplash in 2024).
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';

/**
 * Fetches a city cover image from the Unsplash API.
 * @param city - City name to search for
 * @returns Promise with an image URL, or an empty string to signal the caller
 *          should use a gradient placeholder
 */
export async function fetchCityImage(city: string): Promise<string> {
  if (!UNSPLASH_ACCESS_KEY) {
    return '';
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        `${city} city`
      )}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash request failed with status ${response.status}`);
    }

    const data = await response.json();
    const image: UnsplashImage | undefined = data.results?.[0];

    return image?.urls.regular ?? '';
  } catch (error) {
    console.error('Error fetching city image:', error);
    return '';
  }
}

/**
 * Gets a deterministic placeholder gradient based on the city name.
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

  const index = city
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[index % gradients.length];
}
