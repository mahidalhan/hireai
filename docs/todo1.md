# Project TODO List - Exa API Frontend MVP

## Phase 1: Backend API Route (`pages/api/search.ts`)
- [x] **Verify `exa-js` SDK Usage:**
    - [x] Confirm parameters and return structure of `exa.websets.create()`.
        - [x] Specifically, how `enrichmentId`s map to original `description`s.
    - [x] Confirm the exact method and parameters for `exa.websets.items.list()`.
    - [x] Confirm the detailed structure of `WebsetItem` returned by the SDK.
- [x] **Implement API Logic:**
    - [x] Finalize the implementation of `pages/api/search.ts` based on SDK verification.
    - [x] Refine polling logic for fetching items (ensure reasonable attempts/delay).
    - [x] Implement robust error handling for Exa API calls and internal logic.
- [x] **Testing:**
    - [x] Unit test utility functions if any.
    - [x] Perform integration tests by calling the `/api/search` endpoint with sample data (e.g., using Postman or a simple frontend call).

## Phase 2: Frontend UI (`pages/index.tsx` & `components/`)
- [x] **Setup Environment:**
    - [x] Ensure `EXA_API_KEY` is correctly set in `.env.local` (server-side key).
    - [x] Install/confirm `exa-js`.
    - [x] Install/confirm necessary shadcn/ui components (e.g., `Table`, `Input`, `Button`, `Label`, `Select`).
    - [x] Install/confirm `lucide-react` for icons.
- [x] **Component: `SearchForm.tsx`**
    - [x] Input field for the main search query.
    - [x] UI for dynamically adding/removing search criteria (text inputs).
    - [x] UI for dynamically adding/removing enrichments (description text input, format dropdown).
    - [x] Submit button to trigger the search, with loading state.
    - [x] Style with Tailwind CSS and shadcn/ui.
- [x] **Component: `ResultsTable.tsx`** (Implementation in progress - code provided)
    - [ ] Input: `DisplayableWebsetItem[]` and `isLoading` boolean.
    - [ ] Display items in a table (shadcn/ui `Table`).
    - [ ] Columns: Name, Position, URL (clickable), Criteria Matches (e.g., list or badges), Enrichment Values (description: value).
    - [ ] Show loading state.
    - [ ] Show "no results" message.
    - [ ] Style with Tailwind CSS and shadcn/ui.
- [ ] **Component: `pages/index.tsx` (Main Page)**
    - [ ] Integrate `SearchForm` and `ResultsTable` components.
    - [ ] Manage application state: search results (`DisplayableWebsetItem[]`), loading status (`boolean`), error messages (`string | null`).
    - [ ] Implement the API call function to `/api/search` (triggered by `SearchForm` submission).
        - [ ] Use `fetch` API for the POST request.
        - [ ] Handle request body construction from form data.
        - [ ] Update state based on API response (results, error, loading).
    - [ ] Pass state and handlers as props to child components.
    - [ ] Basic page layout and overall styling (e.g., centering content, adding a title).
- [ ] **Testing:**
    - [ ] Test form submissions and data flow.
    - [ ] Verify results are displayed correctly in the table.
    - [ ] Test loading states and error message display.

## Phase 3: MVP Finalization & Review
- [ ] **End-to-End Testing:**
    - [ ] Conduct full user flow testing from search input to results display.
- [ ] **Code Review & Refinement:**
    - [ ] Clean up code, add comments where necessary.
    - [ ] Ensure consistency with `spec.md` (Next.js, TypeScript, Tailwind, shadcn/ui).
- [ ] **Address MVP Scope:**
    - [ ] Confirm all core features for the 2-hour demo are functional.
    - [ ] Note: Supabase integration is deferred post-MVP.

## Post-MVP / Future Enhancements
- [ ] Integrate Supabase for storing search results and webset history.
- [ ] Implement user authentication (if needed).
- [ ] Advanced UI features:
    - [ ] Filtering and sorting of results.
    - [ ] Pagination for results.
    - [ ] More detailed display of item properties.
- [ ] Implement webhook handling for Exa API for real-time updates (instead of polling).
- [ ] Closer visual parity with the provided screenshot.
- [ ] Comprehensive error handling and user feedback.
