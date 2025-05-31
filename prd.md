# Product Requirements Document (PRD)
## Hire AI MVP - LinkedIn Candidate Search

### 1. Product Overview

Hire AI is an MVP platform that leverages Exa Labs' search API to enable internal recruiters at AI companies to find relevant candidates through natural language queries. The platform searches LinkedIn profiles and presents comprehensive candidate data in an organized, recruiter-friendly interface.

**Core Value Proposition:** Transform hours of manual LinkedIn browsing into minutes of targeted candidate discovery through intelligent natural language search.

### 2. Objectives and Goals

**Primary Objectives:**
- Enable recruiters to find 10-20 relevant candidates per search query
- Reduce candidate sourcing time from hours to minutes
- Provide comprehensive LinkedIn profile data in a structured format
- Create an intuitive interface for natural language candidate searches

**Success Metrics:**
- Search results return 10-20 relevant candidates per query
- Average search-to-results time under 30 seconds
- 80%+ recruiter satisfaction with candidate relevance
- Reduction in manual LinkedIn browsing time by 70%+

### 3. Target Audience

**Primary Users:** Internal recruiters at AI companies
- Responsible for sourcing technical talent (AI/ML engineers, data scientists, Python developers)
- Familiar with technical roles and requirements
- Time-pressed with high-volume hiring needs
- Comfortable with digital tools but value simplicity

**User Pain Points:**
- Manual LinkedIn searches are time-consuming and limited
- Difficulty finding candidates with specific technical skill combinations
- LinkedIn's search filters don't capture nuanced requirements
- Need to review multiple profiles to find quality candidates

### 4. Key Features

**MVP Features:**
1. **Natural Language Search Interface**
   - Single search bar accepting natural language queries
   - Example: "python AI developer in bangalore with 3 years of experience"
   - Real-time search suggestions based on common recruiting patterns

2. **Comprehensive Profile Display**
   - Complete LinkedIn profile data presentation
   - Structured layout showing: name, title, location, experience, skills, education, summary
   - Profile images and contact information (when available)
   - Direct links to original LinkedIn profiles

3. **Results Management**
   - Display 10-20 candidates per search
   - Pagination for additional results
   - Basic filtering options (location, experience level, current company)
   - Save/bookmark promising candidates

4. **Search History**
   - Recent searches list for quick re-execution
   - Search query optimization suggestions

### 5. Technical Specifications

**Recommended Tech Stack:**

**Frontend:**
- **Framework:** Next.js 14 with TypeScript
  - *Reasoning:* Server-side rendering for fast initial loads, excellent developer experience, built-in API routes for backend integration
- **Styling:** Tailwind CSS + shadcn/ui components
  - *Reasoning:* Rapid UI development with professional components, highly customizable
- **State Management:** Zustand
  - *Reasoning:* Lightweight, simple state management for search results and user preferences

**Backend:**
- **Runtime:** Node.js with Express.js
  - *Reasoning:* JavaScript ecosystem consistency, excellent for API integrations
- **Database:** PostgreSQL with Prisma ORM
  - *Reasoning:* Reliable for structured data storage, excellent TypeScript support
- **Caching:** Redis
  - *Reasoning:* Cache Exa API responses to improve performance and reduce API costs

**Infrastructure:**
- **Hosting:** Vercel (Frontend) + Railway/Render (Backend)
  - *Reasoning:* Easy deployment, good performance, cost-effective for MVP
- **API Integration:** Exa Labs Search API
- **Environment Management:** Docker for local development

**Third-Party Services:**
- Exa Labs API for LinkedIn profile search
- Optional: SendGrid for email notifications
- Optional: Auth0 for authentication (if multi-user access needed)

### 6. User Flow

1. **Landing/Search Page**
   - User enters natural language query in search bar
   - Optional: Select filters (location preference, experience range)
   - Click search or press Enter

2. **Search Processing**
   - Display loading indicator with progress feedback
   - Query sent to Exa Labs API via backend
   - Results processed and formatted

3. **Results Display**
   - Grid/list view of candidate profiles
   - Each card shows key information: name, title, location, experience summary
   - Click to expand full profile details

4. **Profile Detail View**
   - Complete LinkedIn profile information
   - Action buttons: Save candidate, View on LinkedIn, Add notes
   - Navigation back to results

5. **Search Management**
   - Access to search history
   - Saved candidates list
   - Export candidate data (future enhancement)

### 7. Non-Functional Requirements

**Performance:**
- Search results loading time: < 30 seconds
- Page load time: < 3 seconds
- Support for 10 concurrent users initially

**Scalability:**
- Architecture designed to handle 100+ searches per day
- Database structure supports 10,000+ candidate profiles

**Security:**
- API key management for Exa Labs integration
- Data privacy compliance for LinkedIn profile data
- Rate limiting to prevent API abuse

**Usability:**
- Mobile-responsive design (tablets primarily)
- Accessibility compliance (WCAG 2.1 AA)
- Intuitive interface requiring minimal training

### 8. Constraints and Limitations

**Technical Constraints:**
- Dependent on Exa Labs API availability and rate limits
- LinkedIn profile data accuracy depends on public availability
- Search quality limited by Exa Labs' LinkedIn indexing coverage

**Scope Limitations:**
- Initial version focuses only on LinkedIn profiles
- No direct integration with ATS systems
- No candidate contact/outreach functionality

