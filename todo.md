# todo.md - Development Tasks

## 1. Project Setup
- [ ] Initialize Next.js 14 project with TypeScript: `npx create-next-app@latest hire-ai --typescript --tailwind --eslint`
- [ ] Install dependencies: Supabase client, shadcn/ui, Exa API client
- [ ] Set up Supabase project and get database URL + API keys
- [ ] Configure environment variables (.env.local)
- [ ] Initialize shadcn/ui: `npx shadcn-ui@latest init`

## 2. Database Setup
- [ ] Create Supabase tables: `candidates`, `searches`, `saved_candidates`
- [ ] Set up database schema with proper indexes
- [ ] Test Supabase connection from Next.js
- [ ] Create database helper functions (lib/supabase.ts)
- [ ] Add sample data for testing

## 3. API Development
- [ ] Create `/api/search` route for Exa Labs integration
- [ ] Implement search result processing and LinkedIn data parsing
- [ ] Create `/api/candidates` route for saving/retrieving candidates
- [ ] Add `/api/search-history` route for user's previous searches
- [ ] Implement error handling and API rate limiting

## 4. Core Components
- [ ] Build search interface component with input and submit
- [ ] Create candidate profile card component showing key info
- [ ] Develop detailed profile modal/drawer component
- [ ] Implement results grid layout with loading states
- [ ] Add search history sidebar/dropdown component

## 5. Page Implementation
- [ ] Create main search page (pages/index.tsx or app/page.tsx)
- [ ] Add candidate detail page or modal view
- [ ] Implement saved candidates page
- [ ] Create simple navigation/header component
- [ ] Add basic footer with links

## 6. Core Functionality
- [ ] Integrate Exa Labs API and test with real LinkedIn searches
- [ ] Implement candidate saving/bookmarking to Supabase
- [ ] Add search history storage and retrieval
- [ ] Create basic filtering (location, experience level)
- [ ] Implement pagination for search results

## 7. UI Polish
- [ ] Style components with Tailwind CSS and shadcn/ui
- [ ] Add responsive design for tablet/desktop use
- [ ] Implement loading spinners and empty states
- [ ] Add basic animations and hover effects
- [ ] Create error handling UI (toast notifications)

## 8. Testing & Deployment
- [ ] Test Exa API integration with various search queries
- [ ] Verify Supabase database operations work correctly
- [ ] Deploy to Vercel and configure production environment variables
- [ ] Test production deployment with real data
- [ ] Set up basic monitoring and error tracking

## Quick Start Order (2-3 weeks)
**Week 1:** Tasks 1-3 (Setup + API)
**Week 2:** Tasks 4-6 (Components + Core Features) 
**Week 3:** Tasks 7-8 (Polish + Deploy)