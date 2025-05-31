import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  // This check is important. If the key isn't found, the service can't initialize.
  // The application should handle this gracefully, perhaps in the API route.
  console.error("GEMINI_API_KEY is not set in environment variables. Gemini client cannot be initialized.");
  // Depending on your error handling strategy, you might throw an error here
  // or have functions return a specific error state.
}

// Initialize the GoogleGenerativeAI client only if the API key is available.
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Define the model. We are using gemini-1.5-flash for its balance of speed and capability.
const model = genAI ? genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  safetySettings: [ // Optional: Adjust safety settings as needed
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ],
}) : null;

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

/**
 * Processes Exa search results using the Gemini API to extract and format candidate information.
 * @param exaResults The raw search results from the Exa API.
 * @returns A string containing the human-readable summary from Gemini, or an error message.
 */
export async function getProcessedCandidateInfo(exaResults: unknown): Promise<string> {
  if (!model) {
    console.error("Gemini model is not initialized. Check GEMINI_API_KEY.");
    return "Sorry, the AI processing service is not available at the moment.";
  }

  try {
    // Convert the Exa results object to a JSON string for the prompt
    const exaResultsString = JSON.stringify(exaResults, null, 2); // Pretty print for better readability if needed for debugging
    const prompt = DEFAULT_PROMPT_TEMPLATE.replace("{exaSearchResults}", exaResultsString);

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error processing with Gemini:", error);
    if (error instanceof Error && error.message.includes('SAFETY')) {
        return "The response was blocked due to safety concerns. Please try a different query or adjust the content filters if possible.";
    }
    // Return a generic error message to the user.
    return "Sorry, I encountered an error trying to process the candidate information with the AI model.";
  }
}