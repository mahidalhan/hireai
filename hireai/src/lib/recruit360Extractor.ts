// lib/recruit360Extractor.ts

/**
 * Types for Recruit360 API response (derived from Exa API structure)
 */
interface Recruit360Result {
  id: string;
  title: string;
  url: string;
  author: string | null;
  publishedDate?: string;
  image?: string; // Assuming this was meant to be imageUrl from Person, or a general image from the search result
  score?: number;
}

interface Recruit360ApiResponse {
  requestId: string;
  autopromptString: string;
  resolvedSearchType: string;
  results: Recruit360Result[];
  costDollars: {
    total: number;
    search: {
      neural: number;
    };
  };
}

export interface Person {
  name: string;
  title?: string;
  company?: string;
  url: string;
  imageUrl?: string;
  publishedDate?: string;
  score?: number;
}

/**
 * Extracts people from Recruit360 API search results
 * Uses multiple heuristics to identify and parse LinkedIn profiles
 * @param apiResponse The raw response from Recruit360 API (structured like Exa's)
 * @returns Array of extracted people
 */
export function extractPeopleFromRecruit360Results(apiResponse: Recruit360ApiResponse): Person[] {
  if (!apiResponse?.results || !Array.isArray(apiResponse.results)) {
    return [];
  }

  // Filter results that are likely to be people profiles
  const potentialPeople = apiResponse.results.filter(result => {
    // Check if it's a LinkedIn profile URL (not a jobs or company page)
    const isLinkedInProfile = result.url.includes('linkedin.com/in/');
    
    // Check if the title follows LinkedIn profile pattern (Name - Title at Company)
    const hasProfileTitleFormat = result.title.includes(' - ') && !result.title.includes('jobs');
    
    // Exclude job listing pages
    const isJobListing = result.url.includes('/jobs/') || 
                         result.title.toLowerCase().includes('jobs in');
    
    // Exclude company pages
    const isCompanyPage = result.url.includes('/company/');
    
    return isLinkedInProfile && hasProfileTitleFormat && !isJobListing && !isCompanyPage;
  });

  // Extract person information from filtered results
  return potentialPeople.map(result => {
    // Parse the title to extract name, title, and company
    const parsedInfo = parseLinkedInTitle(result.title);
    
    return {
      name: parsedInfo.name || result.author || extractNameFromUrl(result.url),
      title: parsedInfo.title,
      company: parsedInfo.company,
      url: result.url,
      imageUrl: result.image, // Mapping from Recruit360Result.image
      publishedDate: result.publishedDate,
      score: result.score
    };
  });
}

/**
 * Parses LinkedIn title format (typically "Name - Title at Company")
 */
function parseLinkedInTitle(title: string): { name: string; title?: string; company?: string } {
  if (!title || typeof title !== 'string') {
    return { name: '' };
  }
  
  const result = { name: '', title: '', company: '' };
  const firstSplit = title.split(' - ');
  
  if (firstSplit.length >= 2) {
    result.name = firstSplit[0].trim();
    const titleAndCompany = firstSplit.slice(1).join(' - ');
    
    if (titleAndCompany.includes(' at ')) {
      const parts = titleAndCompany.split(' at ');
      result.title = parts[0].trim();
      result.company = parts.length > 1 ? parts[1].trim() : '';
    } else if (titleAndCompany.includes(' @ ')) {
      const parts = titleAndCompany.split(' @ ');
      result.title = parts[0].trim();
      result.company = parts.length > 1 ? parts[1].trim() : '';
    } else if (titleAndCompany.includes(' - ')) {
      const parts = titleAndCompany.split(' - ');
      result.title = parts[0].trim();
      result.company = parts.length > 1 ? parts[1].trim() : '';
    } else {
      result.title = titleAndCompany.trim();
      result.company = '';
    }
    
    if (result.title) {
      result.title = result.title
        .replace('| LinkedIn', '')
        .replace('on LinkedIn', '')
        .trim();
    }
    
    if (result.company) {
      result.company = result.company
        .replace('| LinkedIn', '')
        .replace('on LinkedIn', '')
        .trim();
    }
  } else {
    result.name = title
      .replace('| LinkedIn', '')
      .replace('on LinkedIn', '')
      .trim();
  }
  
  return result;
}

/**
 * Extract name from LinkedIn URL as fallback
 */
function extractNameFromUrl(url: string): string {
  if (!url.includes('/in/')) {
    return '';
  }
  
  try {
    const urlParts = url.split('/in/');
    if (urlParts.length < 2) return '';
    
    let username = urlParts[1].split('/')[0];
    username = username.split('?')[0];
    username = decodeURIComponent(username);
    username = username.replace(/[-_]/g, ' ');
    username = username.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return username;
  } catch (e) {
    console.error('Error extracting name from URL:', e);
    return '';
  }
}

/**
 * Process the raw Recruit360 API response string and extract people
 * @param apiResponseString The raw JSON string from Recruit360 API (structured like Exa's)
 * @returns Array of extracted people
 */
export function extractPeopleFromRecruit360ResponseString(apiResponseString: string): Person[] {
  try {
    const apiResponse = JSON.parse(apiResponseString) as Recruit360ApiResponse;
    return extractPeopleFromRecruit360Results(apiResponse);
  } catch (error) {
    console.error('Failed to parse Recruit360 API response:', error);
    return [];
  }
}