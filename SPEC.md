# Astro + ADK TypeScript Starter

A minimal starter template for building AI agent applications with Astro and Google ADK.

**Ideal for:** Web developers new to Astro wanting to explore AI agent capabilities with Google Gemini.

**Key principle:** Deliberately minimal and unopinionated—a foundation you customize, not a prescriptive framework.

## Tech Stack

| Layer     | Technology                    |
| --------- | ----------------------------- |
| Framework | Astro 5 with React            |
| Language  | TypeScript                    |
| Styling   | Tailwind CSS                  |
| Database  | Astro DB (SQLite / Postgres)  |
| Auth      | Cookie-based (mock)           |
| AI        | Google ADK + Gemini 2.5 Flash |

## Architecture

- **Single Astro project** - no separate backend
- **Server Actions** for form handling (login/logout)
- **API routes** for agent execution (`/api/agent`)
- **Hybrid rendering** - Astro server components + React client components

## Core Features

### Authentication (Mock)

- Simple cookie-based login with username validation
- User database lookup (demo: single `testuser`)
- Session management via database
- Easily replaceable with real auth (BetterAuth, Clerk, etc.)

### Agent Interaction

- Single LlmAgent instance (Gemini 2.5 Flash)
- Example tools: get country capital, get country flag, general knowledge queries
- Session-based conversation history
- Response display with tool call tracking

## URL Structure

```
/              - Login / home page
/agent         - Agent chat interface (authenticated)
/_actions/*    - Server actions (auto-generated from src/actions/index.ts)
/api/agent     - Agent execution endpoint
```

## Data Model

### Users

| Field | Type | Notes        |
| ----- | ---- | ------------ |
| id    | text | Primary key  |

### Sessions

| Field    | Type | Notes             |
| -------- | ---- | ----------------- |
| id       | text | Primary key       |
| userId   | text | FK → Users.id     |
| events   | text | JSON events array |
| createdAt| date | Auto-timestamp    |

## Project Structure

```
src/
├── actions/
│   └── index.ts           # Server Actions (login, logout)
├── agents/
│   └── agent.ts           # LlmAgent definition with tools
├── components/
│   └── AgentClient.tsx    # React chat component
├── lib/
│   ├── auth.ts            # Auth helpers
│   ├── countries.ts       # Demo data (capitals, flags)
│   └── data/
├── pages/
│   ├── index.astro        # Home/login page
│   ├── agent.astro        # Agent page (authenticated)
│   └── api/
│       └── agent.ts       # Agent execution API
└── styles/
    └── global.css         # Tailwind entry
```

## Getting Started

```bash
npm install
npm run dev                  # Start at http://localhost:4321
```

Login with username: `testuser`

## Customization

### Add a New Tool

1. Create a FunctionTool in `src/agents/agent.ts`:

```typescript
const myTool = new FunctionTool({
  name: "my_tool",
  description: "What it does",
  parameters: z.object({
    input: z.string(),
  }),
  execute: async ({ input }) => {
    // Your logic here
    return { status: "success", result: "..." };
  },
});

// Add to rootAgent.tools array
```

### Replace Mock Auth

Update `src/lib/auth.ts` with your auth provider (BetterAuth, Clerk, Supabase, etc.).

### Change the AI Model

Update `ROOT_AGENT_MODEL` in `src/agents/agent.ts` to use a different Gemini model.

### Deploy

Works with Netlify (configured), Vercel, or any static host. Set environment variables for remote database in production.

## Environment Variables

```bash
# Required for remote DB (production)
ASTRO_DB_REMOTE_URL=<postgres-connection-string>
```

## Limitations (By Design)

- Single-user mock auth (replace as needed)
- **Local vs. Production DB**: Locally, SQLite persists across app restarts. For production serverless deployment, configure a remote database (e.g., Turso PostgreSQL) in environment variables—see "Environment Variables" section.
- No advanced agent features (tool composition, chaining, complex state)
- Minimal error handling (intentionally simple)

The starter is designed to be extended and customized. It's not a complete application—it's a foundation.

## Epics

### Epic 1: Project Setup
Initialize Astro with TypeScript, Tailwind, React, and Astro DB.

### Epic 2: Database Schema & Migrations
Define User and Session tables, seed demo data.

### Epic 3: Authentication System
Implement cookie-based login/logout with username validation.

### Epic 4: Server Actions Migration
Move auth from API routes to Astro Server Actions with Zod validation.

### Epic 5: Agent Foundation & Implementation
Integrate Google ADK, define LlmAgent with FunctionTools. Build demo agent (Countries) with capital/flag lookup and general knowledge tool.

### Epic 6: Agent API Route & Session Persistence
Create `/api/agent` endpoint for agent execution with InMemoryRunner, session event storage to database.

### Epic 7: Frontend Pages & Components
Home page (login/logout), agent page layout, AgentClient React component.

### Epic 8: Testing & Documentation
Unit tests (agents, auth, API), update SPEC with customization examples.
