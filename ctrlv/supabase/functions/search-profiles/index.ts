// deno-lint-ignore-file no-explicit-any
/// <reference types="https://deno.land/x/deno@v1.43.6/lib.deno.ns.d.ts" />
/// <reference types="https://deno.land/x/deno@v1.43.6/lib.deno.unstable.d.ts" />

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { Exa } from "https://esm.sh/exa-js";
import { createClient } from "@supabase/supabase-js";

// CORS headers for all origins (for MVP)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

// Initialize Exa client
const exaApiKey = Deno.env.get("EXA_API_KEY") || "";
const exa = new Exa(exaApiKey);

serve(async (req: Request) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split("Bearer ")[1]
      : null;
      
    if (!token) {
      return new Response(JSON.stringify({ error: "Authorization token missing" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { error } = await supabase.auth.getUser(token);
    if (error) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Process request
    const requestBody = await req.json();
    const query = requestBody.query;
    
    if (!query || typeof query !== "string" || query.trim() === "") {
      return new Response(JSON.stringify({ error: "Invalid query parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Call Exa API
    const exaQuery = `${query.trim()} site:linkedin.com/in`;
    const results = await exa.search(exaQuery, {
      category: "linkedin profile",
      numResults: 10,
      type: "neural"
    });

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in search-profiles:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});