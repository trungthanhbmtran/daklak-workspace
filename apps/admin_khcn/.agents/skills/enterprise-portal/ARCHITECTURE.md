Architecture Rules:

- Feature-first architecture
- CMS-driven rendering
- Block rendering system
- Server components first
- Client components only when required

Data Flow:
CMS
 ↓
API
 ↓
Axios Service
 ↓
React Query Hook
 ↓
Feature Component
 ↓
Page

Rendering:
- ISR for public pages
- Dynamic rendering only when needed