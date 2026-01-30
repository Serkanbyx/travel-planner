import { WikipediaResponse } from '@/types';

/**
 * Fetches a summary about a city from Wikipedia API
 * @param city - City name to search for
 * @param country - Country name for more accurate results
 * @returns Promise with city summary or null
 */
export async function fetchCitySummary(
  city: string,
  country?: string
): Promise<WikipediaResponse | null> {
  const searchQuery = country ? `${city}, ${country}` : city;
  
  try {
    // First, search for the page
    const searchResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?` +
      `action=query&` +
      `list=search&` +
      `srsearch=${encodeURIComponent(searchQuery)}&` +
      `srlimit=1&` +
      `format=json&` +
      `origin=*`
    );

    if (!searchResponse.ok) {
      throw new Error('Wikipedia search failed');
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.query?.search?.length) {
      return null;
    }

    const pageTitle = searchData.query.search[0].title;

    // Then, get the page summary
    const summaryResponse = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`
    );

    if (!summaryResponse.ok) {
      throw new Error('Wikipedia summary fetch failed');
    }

    const summaryData = await summaryResponse.json();

    return {
      title: summaryData.title,
      extract: summaryData.extract || '',
      thumbnail: summaryData.thumbnail
        ? { source: summaryData.thumbnail.source }
        : undefined,
    };
  } catch (error) {
    console.error('Error fetching Wikipedia summary:', error);
    return null;
  }
}

/**
 * Fetches a short extract (first few sentences) about a city
 * @param city - City name
 * @param country - Optional country name
 * @returns Promise with short description or empty string
 */
export async function fetchCityShortDescription(
  city: string,
  country?: string
): Promise<string> {
  const summary = await fetchCitySummary(city, country);
  
  if (!summary?.extract) {
    return '';
  }

  // Get first 2-3 sentences
  const sentences = summary.extract.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, 2).join(' ');
}
