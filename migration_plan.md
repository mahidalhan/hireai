# Next.js App Router Migration Plan (Simplified)

This document outlines the simplified plan to migrate the Ctrlv project from the Next.js Pages Router to the App Router. The primary goal is to restructure the project to use the `src/` directory for all application code and adopt App Router conventions for routing and component handling.

## Target Folder Structure

The envisioned folder structure after the migration:

```mermaid
graph TD
    ROOT(Ctrlv/ctrlv/) --> PUBLIC(public/)
    ROOT --> SRC(src/)
    SRC --> APP(app/)
    APP --> APP_LAYOUT(layout.tsx)
    APP --> APP_PAGE(page.tsx)
    APP --> APP_GLOBALS(globals.css)
    APP --> APP_FAVICON(favicon.ico)
    APP --> API(api/)
    API --> API_SEARCH(search/)
    API_SEARCH --> API_SEARCH_ROUTE(route.ts)
    SRC --> COMPONENTS(components/)
    COMPONENTS --> COMP_SEARCHFORM(SearchForm.tsx)
    COMPONENTS --> COMP_RETROTABLE(RetroTableWindow.tsx)  // Target for Phase 2
    SRC --> LIB(lib/)
    LIB --> LIB_DBTYPES(database.types.ts)
    LIB --> LIB_EXA(exa.ts)
    LIB --> LIB_GEMINI(geminiService.ts)
    LIB --> LIB_RECRUIT(recruit360Extractor.ts)
    LIB --> LIB_SUPABASE(supabase.ts)
    ROOT --> CONFIG_NEXT(next.config.ts)
    ROOT --> CONFIG_PKG(package.json)
    ROOT --> CONFIG_TS(tsconfig.json)
    ROOT --> OTHERS(...)

    subgraph Project Root (Ctrlv/ctrlv/)
        direction LR
        CONFIG_NEXT
        CONFIG_PKG
        CONFIG_TS
        OTHERS
        PUBLIC
        SRC
    end
```

## Phase 1: Core Migration to App Router

### 1. Establish `src` Directory Structure & Move Core Assets

*   **Actions:**
    *   [x] 1. Move the existing `Ctrlv/ctrlv/lib/` directory to `Ctrlv/ctrlv/src/lib/`.
    *   [x] 2. Move the existing `Ctrlv/ctrlv/components/` directory to `Ctrlv/ctrlv/src/components/`.
    *   [x] 3. Update all import paths in the files within these moved directories and any files that import from them (implicitly done by checking files and handling in subsequent steps).
*   **Rationale:** Sets up the target `src`-based structure early, making subsequent import paths consistent.

### 2. Migrate Homepage (`pages/index.tsx` -> `src/app/page.tsx`)

*   **Actions:**
    *   [x] 1. Create/Update `Ctrlv/ctrlv/src/app/page.tsx`.
    *   [x] 2. Add `"use client";` at the very top of `src/app/page.tsx`.
    *   [x] 3. Copy the *entire content* of `Ctrlv/ctrlv/pages/index.tsx` (including `Home` component, `RetroTableWindow` component, and interfaces) into `src/app/page.tsx`.
        *   *Note:* `RetroTableWindow` extraction is deferred to Phase 2.
    *   [x] 4. In `src/app/page.tsx`, remove the `<Head>` component usage. (Metadata was initially added here, then removed due to client component conflict; root layout handles metadata).
    *   [x] 5. Move the global CSS for `.prose` tables (from `<style jsx global>` in `pages/index.tsx`) to `Ctrlv/ctrlv/src/app/globals.css`.
    *   [x] 6. Ensure import paths within `src/app/page.tsx` are correct (verified, no changes were needed for `SearchForm` as it wasn't imported).
*   **Rationale:** Gets the main page working under the App Router and correctly marks it as a Client Component.

### 3. Migrate API Route (`pages/api/search.ts` -> `src/app/api/search/route.ts`)

*   **Actions:**
    *   [x] 1. Create the directory `Ctrlv/ctrlv/src/app/api/search/`.
    *   [x] 2. Create a new file: `Ctrlv/ctrlv/src/app/api/search/route.ts`.
    *   [x] 3. Refactor the handler from `Ctrlv/ctrlv/pages/api/search.ts` into the new `POST` export in `route.ts`. Ensure import paths for `exaClient` and `getProcessedCandidateInfo` point to `src/lib/`.
        ```typescript
        // Ctrlv/ctrlv/src/app/api/search/route.ts
        import { exaClient as exa } from '../../../lib/exa'; // Adjusted path
        import { getProcessedCandidateInfo } from '../../../lib/geminiService'; // Adjusted path

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

            const exaQuery = `${query.trim()} site:linkedin.com/in`;

            const exaSearchResponse = await exa.search(exaQuery, {
              category: "linkedin profile",
              numResults: 10,
              type: 'neural',
            });

            if (!exaSearchResponse || !exaSearchResponse.results || exaSearchResponse.results.length === 0) {
              return Response.json({ text: "No initial search results found from Exa. Try a different query." }, { status: 200 });
            }

            const processedText = await getProcessedCandidateInfo(exaSearchResponse);
            return Response.json({ text: processedText }, { status: 200 });

          } catch (error: unknown) {
            console.error('Error in /api/search POST handler:', error);
            let errorMessage = 'Failed to process search request.';
            if (error instanceof Error && error.message) {
              errorMessage = error.message;
            }
            return Response.json({ error: errorMessage }, { status: 500 });
          }
        }
        ```
*   **Rationale:** Migrates the backend API endpoint to App Router conventions.

### 4. Ensure Root Layout and Global Styles

*   **Actions:**
    *   [x] 1. Verify `Ctrlv/ctrlv/src/app/layout.tsx` exists and is minimal (includes `<html>`, `<body>`, and imports `globals.css`). Updated metadata.
    *   [x] 2. Confirm `Ctrlv/ctrlv/src/app/globals.css` contains necessary base styles and the migrated `.prose` table styles.
*   **Rationale:** Provides the necessary HTML shell and global styling for the App Router application.

### 5. Testing & Cleanup (Initial)

*   **Actions:**
    *   [x] 1. Thoroughly test the homepage and the search functionality to ensure everything works as expected. (Error found and fixed, now working).
    *   [x] 2. Once confirmed working, delete the entire `Ctrlv/ctrlv/pages/` directory.
    *   [x] 3. Delete `Ctrlv/ctrlv/src/app/page.tsx.bak` if it exists.
*   **Rationale:** Completes the core migration and removes outdated Pages Router code.

## Phase 2: Refinements (Recommended Follow-up)

*   [ ] **Extract `RetroTableWindow` Component:**
    *   [ ] Move the `RetroTableWindow` component and its `RetroTableWindowProps` interface from `Ctrlv/ctrlv/src/app/page.tsx` into its own file: `Ctrlv/ctrlv/src/components/RetroTableWindow.tsx`.
    *   [ ] Add `"use client";` at the top of `RetroTableWindow.tsx`.
    *   [ ] Import and use it in `src/app/page.tsx`.
*   [ ] **Review Type Definitions:**
    *   [ ] Consider moving shared types (like `Message` if used elsewhere) to a dedicated file such as `Ctrlv/ctrlv/src/lib/types.ts`.