# Hobbitify - AI Coding Instructions

## Project Overview
Hobbitify is a skill tree generator that transforms learning goals into interactive, RPG-style skill trees. The app uses Claude 3.5 to generate JSON-formatted skill hierarchies and visualizes them in the React application.

## Architecture
**Critical**: This project uses `react-app/` as the frontend implementation.

The frontend communicates with the same Flask backend hosted on Replit.

## Technology Stack
- **Backend**: Flask server (hosted on Replit)
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **AI Integration**: Claude 3.5 via engineered system prompts
- **Styling**: Custom Tailwind config with dark theme and purple/pink accent colors

## Key Development Patterns

### Backend Communication
```typescript
// Standard POST request pattern used throughout
const response = await axios.post(
  "https://306d35ba-df75-4b4a-8c6e-0e3cf5da585f-00-sdz04eqsz56g.kirk.replit.dev/",
  { input: userInput }
);
```
- Backend expects `{ input: string }` format
- Returns JSON skill tree data
- Handle both string and object responses in parsing

### Skill Tree Data Structure
Skills follow this hierarchical JSON format:
```json
{
  "Name": "Skill Name",
  "Description": "Detailed description",
  "Completion": "How to complete this skill", 
  "Children": ["Child Skill 1", "Child Skill 2"],
  "Difficulty": 1-5
}
```

### React Component Patterns
- Use `useLocation().state` for cross-page data passing (see `SkillTree.tsx`)
- Implement defensive JSON parsing for backend responses
- Filter root skills: `skills.filter(skill => !skills.some(s => s.Children?.includes(skill.Name)))`

### Styling Conventions
- **Color System**: `gray-bg` (#272626), `primary-100` (#A259FF), `primary-200` (#FF62A5)
- **Typography**: Manrope font family site-wide
- **Layout**: Dark theme with purple/pink accents, centered layouts
- **Components**: Use `skill-bg` (#1E1E1E) for skill node backgrounds

## Development Commands
```bash
# React app development
cd react-app
npm run dev        # Start Vite dev server
npm run build      # TypeScript compile + Vite build
npm run lint       # ESLint validation
```

## Critical Files to Understand
- `react-app/src/pages/GettingStarted.tsx` - User input and backend communication
- `react-app/src/pages/SkillTree.tsx` - JSON parsing and root skill filtering
- `react-app/src/pages/SkillNode.tsx` - Recursive skill tree rendering
- `react-app/tailwind.config.js` - Custom color system and animations

## Common Gotchas
- Backend expects POST requests, not GET (lesson learned at 1am!)
- JSON responses may be strings or objects - always parse defensively
- Skill tree hierarchy requires parent-child relationship filtering
- Replit backend URL is hardcoded - update if backend moves
- **Security**: Removed vulnerable `tailwind@4.0.0` and `axiom` packages - only use `tailwindcss@3.4.12`

## Vulnerability Management
- Removed problematic packages: `tailwind@4.0.0` (not TailwindCSS), `axiom` (unused)
- Vulnerabilities reduced from 36 to 0 by package cleanup and updates
- Run `npm audit` regularly and remove unused dependencies