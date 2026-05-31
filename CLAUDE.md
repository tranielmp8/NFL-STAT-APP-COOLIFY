# NFL App - Claude Code Architecture

## Stack

| Layer     | Tech                           |
| --------- | ------------------------------ |
| Framework | SvelteKit 2 + Svelte 5 (runes) |
| Styling   | Tailwind CSS v4                |
| Auth      | Better Auth (email/password)   |
| ORM       | Drizzle ORM                    |
| Database  | PostgreSQL                     |
| Language  | TypeScript                     |

## Database Naming Convention

Use plain, descriptive PostgreSQL object names. Do not prefix app-owned tables with `claude_`.

| Object       | Convention                      | Example                                     |
| ------------ | ------------------------------- | ------------------------------------------- |
| Tables       | plural snake_case nouns         | `teams`, `players`, `player_stats`, `games` |
| Indexes      | `<table>_<cols>_idx`            | `teams_abbreviation_idx`                    |
| Foreign keys | Drizzle defaults are acceptable | `players_team_id_teams_id_fk`               |

## Project Structure

```text
src/
  app.html              - HTML shell
  hooks.server.ts       - SvelteKit server hooks (auth middleware)
  lib/
    assets/             - Static assets (SVGs, images)
    index.ts            - Barrel exports
    server/
      auth.ts           - Better Auth config
      db/
        index.ts        - Drizzle client
        auth.schema.ts  - Better Auth tables (auto-generated)
        schema.ts       - App domain schema
  routes/
    +layout.svelte      - Root layout
    layout.css          - Global CSS + Tailwind import
    +page.svelte        - Team browser homepage
    teams/[abbr]/       - Team detail pages
    demo/               - Generated demo routes
```

## Environment Variables

```text
DATABASE_URL        - PostgreSQL connection string
ORIGIN              - Public base URL (for Better Auth)
BETTER_AUTH_SECRET  - 32-char secret for session signing
```

## Key Conventions

- Svelte 5 runes (`$state`, `$derived`, `$props`, `$effect`) everywhere; no legacy Options API.
- Server-only code lives in `src/lib/server/` and is never imported by client components.
- Auth session is checked in `hooks.server.ts`; use `event.locals.user` in load functions.
- Drizzle migrations live in `drizzle/` at repo root; run `npm run db:push` in dev, `db:migrate` in prod.
- DB table definitions use plain plural names such as `teams`, `players`, and `games`.
