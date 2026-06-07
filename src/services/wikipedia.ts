import { WikipediaResponse } from '@/types';

/**
 * Supported Wikipedia language editions.
 */
export type WikipediaLang = 'en' | 'tr';

/**
 * Resolves the preferred Wikipedia language from the browser, defaulting to
 * English when the locale is not supported.
 */
function getDefaultLang(): WikipediaLang {
  if (typeof navigator !== 'undefined' && navigator.language?.startsWith('tr')) {
    return 'tr';
  }
  return 'en';
}

/**
 * Fetches a summary about a city from the Wikipedia API.
 * @param city - City name to search for
 * @param country - Country name for more accurate results
 * @param lang - Wikipedia language edition (defaults to the browser locale)
 * @returns Promise with city summary or null
 */
export async function fetchCitySummary(
  city: string,
  country?: string,
  lang: WikipediaLang = getDefaultLang()
): Promise<WikipediaResponse | null> {
  const searchQuery = country ? `${city}, ${country}` : city;
  const baseUrl = `https://${lang}.wikipedia.org`;

  try {
    const searchResponse = await fetch(
      `${baseUrl}/w/api.php?` +
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
      // Fall back to English when the localized edition has no match.
      if (lang !== 'en') {
        return fetchCitySummary(city, country, 'en');
      }
      return null;
    }

    const pageTitle = searchData.query.search[0].title;

    const summaryResponse = await fetch(
      `${baseUrl}/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`
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
 * Fetches a short extract (first couple of sentences) about a city.
 * @param city - City name
 * @param country - Optional country name
 * @param lang - Optional Wikipedia language edition
 * @returns Promise with short description or empty string
 */
export async function fetchCityShortDescription(
  city: string,
  country?: string,
  lang?: WikipediaLang
): Promise<string> {
  const summary = await fetchCitySummary(city, country, lang);

  if (!summary?.extract) {
    return '';
  }

  const sentences = summary.extract.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, 2).join(' ');
}
