// pages/api/search.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { exaClient as exa } from '../../lib/exa'; // Correctly import the named export
import { getProcessedCandidateInfo } from '../../lib/geminiService';

// Define the expected response type for this API endpoint
interface ApiResponse {
  text?: string; // This will be the human-readable text from Gemini
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { query } = req.body;

  if (!query || typeof query !== 'string' || query.trim() === '') {
    return res.status(400).json({ error: 'Missing or invalid query parameter in request body.' });
  }

  // Modify query to specifically target LinkedIn profiles and append user's query
  const exaQuery = `${query.trim()} site:linkedin.com/in`;

  try {
    // 1. Call Exa API
    const exaSearchResponse = await exa.search(exaQuery, {
      category: "linkedin profile", // Specifically target LinkedIn profiles
      numResults: 10, // Request a moderate number of results for Gemini to process
      type: 'neural',
      // Consider if 'useAutoprompt' or other Exa features are beneficial here
    });

    // The exaSearchResponse object itself (which includes results, autopromptString etc.)
    // will be passed to Gemini. The prompt in geminiService is designed to handle this structure.
    if (!exaSearchResponse || !exaSearchResponse.results || exaSearchResponse.results.length === 0) {
      return res.status(200).json({ text: "No initial search results found from Exa. Try a different query." });
    }

    // 2. Process Exa results with Gemini
    const processedText = await getProcessedCandidateInfo(exaSearchResponse);

    // 3. Return Gemini's response
    res.status(200).json({ text: processedText });

  } catch (error: any) {
    console.error('Error in /api/search handler:', error);
    let errorMessage = 'Failed to process search request.';
    if (error.message) {
      errorMessage = error.message;
    }
    res.status(500).json({ error: errorMessage });
  }
}