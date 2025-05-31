import { Exa } from 'exa-js';

// Initialize the Exa client with API key from environment variables
const exaClient = new Exa(process.env.NEXT_PUBLIC_EXA_API_KEY!);

// Function to search for candidates using Exa API
export async function searchCandidates(query: string, options?: {
  numResults?: number;
  highlightDelimiters?: [string, string];
  useAutoprompt?: boolean;
}) {
  try {
    // Default search parameters
    const searchParams = {
      numResults: options?.numResults || 10,
      highlightDelimiters: options?.highlightDelimiters || ['**', '**'],
      useAutoprompt: options?.useAutoprompt !== undefined ? options.useAutoprompt : true,
    };

    // Enhance the query to focus on LinkedIn profiles
    const enhancedQuery = `${query} site:linkedin.com/in`;
    
    // Execute the search
    const results = await exaClient.search(enhancedQuery, searchParams);
    
    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error('Error searching with Exa:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Function to extract structured data from LinkedIn profiles
export function parseLinkedInProfile(content: string) {
  // This is a placeholder for LinkedIn profile parsing logic
  // In a real implementation, this would use regex or more sophisticated parsing
  
  // Example extraction of basic profile information
  const nameMatch = content.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
  const titleMatch = content.match(/(?:Title|Position|Role):\s*([^,\n]+)/i);
  const companyMatch = content.match(/(?:Company|Organization|Employer):\s*([^,\n]+)/i);
  const locationMatch = content.match(/(?:Location|Based in|Area):\s*([^,\n]+)/i);
  
  return {
    name: nameMatch ? nameMatch[1] : 'Unknown',
    title: titleMatch ? titleMatch[1].trim() : 'Unknown',
    company: companyMatch ? companyMatch[1].trim() : 'Unknown',
    location: locationMatch ? locationMatch[1].trim() : 'Unknown',
    // Additional fields would be extracted in a real implementation
  };
}
