@AGENTS.md

# 01 Log Square — App

Next.js application for the 01 Log Square virtual office system.

## Stack

- Next.js 15 + TypeScript + Tailwind CSS
- Mastra (`@mastra/core`) for agent orchestration
- Vercel AI SDK (`ai`, `@ai-sdk/openai`) for LLM calls
- Supabase (`@supabase/supabase-js`) for data, auth, realtime
- Zod for structured output schemas

## Directory Structure

```
app/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (lobby)/      # Project list home
│   │   ├── project/[id]/ # Project workspace (Meeting Room, DM, Archive)
│   │   └── api/          # API routes (agent calls, CRUD)
│   ├── mastra/           # Mastra agent definitions
│   │   ├── agents/       # Agent configs (coo.ts, cto.ts, risk-critic.ts, ...)
│   │   └── schemas/      # Zod schemas for structured outputs
│   ├── lib/              # Shared utilities
│   │   ├── supabase/     # Supabase client (server/client)
│   │   └── types/        # Shared TypeScript types
│   └── components/       # React components
│       ├── meeting-room/     # Meeting Room UI
│       ├── dm/           # DM UI
│       └── ui/           # Shared UI primitives
├── public/               # Static assets (pixel art, icons)
└── .env.local            # API keys (gitignored)
```

## Key Patterns

### Agent Calls
```typescript
// Meeting Room — Supervisor fans out to 5 agents
// app/src/app/api/meeting-room/route.ts
import { supervisor } from '@/mastra/agents/supervisor'

// DM — Single agent direct call
// app/src/app/api/dm/[agentId]/route.ts
import { getAgent } from '@/mastra/agents'
const result = await agent.generate(message)
```

### Structured Output
```typescript
// Zod schema → Supabase insert
const decision = await agent.generate(message, {
  structuredOutput: { schema: DecisionSchema }
})
await supabase.from('decisions').insert(decision.object)
```

### Supabase Client
- Server Components / API Routes: use server client with service role
- Client Components: use browser client with anon key
- Realtime subscriptions for live message updates

## Environment Variables

See `../.env.example` for required keys. Copy to `.env.local`:
- `OPENAI_API_KEY` — OpenAI API
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role (server only)

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
```

## Rules

- Supabase is the ONLY source of truth for product state
- Mastra handles agent execution only, never owns product data
- Agent personas are stored in Supabase `agent_templates`, injected into Mastra at runtime
- All structured outputs (decisions, actions, reviews) go to Supabase, not Mastra memory
- Korean for UI copy, English for code/commits
