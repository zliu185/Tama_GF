# tama-gift

A Tamagotchi-style web gift for your girlfriend, built as a clean MVP with **Next.js App Router + TypeScript + Tailwind + Supabase**.

The app uses a **time-delta settlement model**: no always-on server process is needed. Each time the page opens (or user clicks an action), pet state is recalculated by `now - last_calculated_at`.

## Features (MVP)

- Single user + single pet
- Cloud-stored pet state in Supabase
- Auto-create default pet (`Mochi`) on first open
- Recalculate state on demand via API
- Core actions: `feed`, `play`, `clean`, `sleep`, `wake`
- Action log persistence (`pet_actions`)
- Soft, gift-style responsive UI (desktop + iPhone Safari)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Postgres)
- Vercel deployment

## Project Structure

```text
tama-gift/
  app/
    page.tsx
    layout.tsx
    api/
      pet/
        _shared.ts
        state/route.ts
        feed/route.ts
        play/route.ts
        clean/route.ts
        sleep/route.ts
        wake/route.ts
  components/
    PetCard.tsx
    StatusBars.tsx
    ActionButtons.tsx
    DialogueBubble.tsx
  lib/
    pet/
      engine.ts
      actions.ts
      constants.ts
      types.ts
    supabase/
      client.ts
      server.ts
  public/
    pet/
      egg.png
      baby.png
      happy.png
      sad.png
  supabase/
    migrations/
      001_init.sql
  README.md
```

## Architecture Notes

1. `GET /api/pet/state`
- Ensure `users_profile` and default pet exist
- Recalculate pet state by elapsed minutes
- Persist recalculated values
- Return latest pet + dialogue text

2. `POST /api/pet/{action}`
- Recalculate first
- Apply action effects
- Persist pet state
- Insert action log into `pet_actions`
- Return latest pet + dialogue + action note

3. State engine in `lib/pet/engine.ts`
- Clamp all stats to `0..100`
- Sleeping and awake have different rates
- Health falls only when multiple stats stay low
- Stage is derived from `age_days` and `xp`

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DEFAULT_USER_ID=00000000-0000-0000-0000-000000000001
```

`DEFAULT_USER_ID` can stay as default for single-user MVP.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Apply SQL migration to Supabase:
- Open Supabase SQL Editor
- Run `supabase/migrations/001_init.sql`

3. Start dev server:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

## Supabase Initialization

- Create a Supabase project
- Copy URL + keys into `.env.local`
- Run the migration SQL
- Verify tables exist:
  - `users_profile`
  - `pets`
  - `pet_actions`
  - `special_events`

## Deploy to Vercel

1. Push repo to GitHub
2. Import project in Vercel
3. Set env vars in Vercel Project Settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEFAULT_USER_ID` (optional)
4. Deploy

No persistent worker is needed. The app computes time-based state during API requests.

## Future Extensions

- Add auth and multi-user ownership
- Add inventory, items, and gifts
- Add scheduled/special events in `special_events`
- Add sprite animation and richer stage evolution
- Add relationship milestones and memory timeline
- Add notifications / PWA support

## Notes

- This MVP intentionally avoids extra state libraries and ORMs.
- All core logic is kept simple and transparent for future iteration.
