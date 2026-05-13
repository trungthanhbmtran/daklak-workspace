# Enterprise Portal AI Rules

Tech Stack:
- Next.js 16 App Router
- React 19
- TypeScript strict
- TailwindCSS
- shadcn/ui
- TanStack Query
- Axios
- react-hook-form
- zod

Architecture:
- Feature-based architecture
- CMS-driven rendering
- ISR optimized public pages
- React Query for server state
- Axios service layer
- Reusable component system

Rules:
- No useEffect fetching
- No any type
- No inline styles
- Prefer server components
- Use query hooks
- Use zod validation
- Separate business logic from UI
- Reusable components only

Folder Structure:
src/
  app/
  features/
  components/
  services/
  hooks/
  providers/

Patterns:
- API logic inside services/
- Query hooks inside features/
- Shared UI inside components/shared
- CMS rendered using blocks

Performance:
- ISR for public pages
- Lazy load heavy blocks
- Dynamic imports
- Optimize images

Accessibility:
- Accessible forms
- Keyboard navigation
- Semantic HTML