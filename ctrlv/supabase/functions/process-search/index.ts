import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { Exa } from "https://esm.sh/exa-js";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// For Exa, we'll use a direct npm import
// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } }
);

// Initialize Exa client
const exa = new Exa(Deno.env.get("EXA_API_KEY")!);

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY")!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const DEFAULT_PROMPT_TEMPLATE = `
You are an expert recruitment assistant. Based on the following JSON search results from a job candidate search engine, extract key information for each potential candidate and format it **ONLY as a Markdown table**. Do not include any introductory text, preamble, or any concluding notes or summaries outside of the table itself. Your entire response should be just the Markdown table.

The search results primarily target LinkedIn profiles. For each relevant LinkedIn profile found, include the following columns in your Markdown table:
| Name | Current Job Title | Current Company | LinkedIn Profile URL | Summary |
|---|---|---|---|---|

- **Name:** The full name of the candidate.
- **Current Job Title:** Their current job title.
- **Current Company:** The company they currently work for.
- **LinkedIn Profile URL:** The direct link to their LinkedIn profile.
- **Summary:** A brief 1-2 sentence summary of their current role or key skills mentioned in the search result snippet, placed within the 'Summary' cell of the table.

If some information (like company or specific title) is not available in a particular search result, indicate 'Not available' or similar for that field within the table cell.
Focus on individual profiles, not company pages or job postings.

Here is the JSON data from the search engine:
"""json
{exaSearchResults}
"""
`;

// CORS headers for all origins (for MVP)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Simple rate limiting for MVP
const MAX_REQUESTS_PER_HOUR = 100;
const IP_RATE_LIMIT_MAP = new Map();

// Check if request is within rate limits
function checkRateLimit(req: Request): boolean {
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const hour = Math.floor(now / 3600000); // Current hour
  
  const key = `${clientIP}:${hour}`;
  const currentCount = IP_RATE_LIMIT_MAP.get(key) || 0;
  
  if (currentCount >= MAX_REQUESTS_PER_HOUR) {
    return false; // Rate limit exceeded
  }
  
  IP_RATE_LIMIT_MAP.set(key, currentCount + 1);
  return true; // Request allowed
}

serve(async (req) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  // Check rate limit
  if (!checkRateLimit(req)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  
  // MVP version - no authentication required

  try {
    // Parse request body
    const { query } = await req.json();
    if (!query || typeof query !== "string" || query.trim() === "") {
      return new Response(JSON.stringify({ error: "Invalid query parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call Exa API
    const exaQuery = `${query.trim()} site:linkedin.com/in`;
    const exaSearchResponse = await exa.search(exaQuery, {
      category: "linkedin profile",
      numResults: 10,
      type: "neural",
    });

    if (!exaSearchResponse?.results?.length) {
      return new Response(JSON.stringify({ text: "No search results found. Try a different query." }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Process with Gemini
    const exaResultsString = JSON.stringify(exaSearchResponse, null, 2);
    const prompt = DEFAULT_PROMPT_TEMPLATE.replace("{exaSearchResults}", exaResultsString);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    // More detailed error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    console.error("Error in process-search:", errorMessage, errorStack);
    
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      details: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});