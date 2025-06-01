// src/app/api/search/route.ts
import { exaClient as exa } from '../../../lib/exa'; // Adjusted path
import { getProcessedCandidateInfo } from '../../../lib/geminiService'; // Adjusted path
// import { NextRequest } from 'next/server'; // Uncomment if specific NextRequest features are needed

interface ApiResponse {
  text?: string;
  error?: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return Response.json({ error: 'Missing or invalid query parameter in request body.' }, { status: 400 });
    }

    // Modify query to specifically target LinkedIn profiles and append user's query
    const exaQuery = `${query.trim()} site:linkedin.com/in`;

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
      return Response.json({ text: "No initial search results found from Exa. Try a different query." }, { status: 200 });
    }

    // 2. Process Exa results with Gemini
    const processedText = await getProcessedCandidateInfo(exaSearchResponse);

    // 3. Return Gemini's response
    return Response.json({ text: processedText }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error in /api/search POST handler:', error);
    let errorMessage = 'Failed to process search request.';
    if (error instanceof Error && error.message) {
      errorMessage = error.message;
    }
    // It's good practice to ensure the error response also has a clear content type
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}