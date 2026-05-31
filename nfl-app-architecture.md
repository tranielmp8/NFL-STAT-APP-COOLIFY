# NFL Stats App — Architecture & Build Plan

> **Stack:** SvelteKit + TypeScript · PostgreSQL · Python (data pipeline) · Node.js (SvelteKit server)

---

## 1. Project Overview

A full-stack NFL stats application with a game-inspired UI. Users can browse all 32 teams, view
team records and season schedules, click into any player, and see a curated set of key stats
(passing yards, rushing yards, TDs, receptions, sacks, tackles, interceptions, and special teams).

---

## 2. Data Strategy

This is the most important architectural decision. NFL stats are not freely available via a single
open API that covers rosters + per-player season stats cleanly. Here is the layered approach:

### 2a. Primary Live Data Source — Built-in Sports Tool

Claude's internal sports data tool provides **real-time**:

- All 32 team standings (wins, losses, win %)
- Full season schedule per team (home/away, scores, status: scheduled/closed)
- Game IDs that unlock box scores and play-by-play

This is what will power the **Schedule & Team Record** views with zero latency and no API key.

### 2b. Player Roster + Season Stats — ESPN Public API (No Key Required)

ESPN exposes undocumented but stable public endpoints:

```
# Team roster
https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{teamId}/roster

# Player stats (season)
https://site.api.espn.com/apis/site/v2/sports/football/nfl/athletes/{athleteId}/stats

# All teams list
https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams
```

These return JSON with no authentication. They are rate-limited but suitable for a personal app.

### 2c. Python Data Pipeline (Nightly Sync)

A lightweight Python script runs nightly (cron or systemd timer) to:

1. Fetch all team rosters from ESPN
2. Fetch season stats for each player
3. Normalize and upsert into PostgreSQL

This avoids hitting ESPN on every page load and gives you full control over the data.

```
python/
  sync/
    fetch_teams.py       # GET /teams → upsert teams table
    fetch_rosters.py     # GET /teams/{id}/roster → upsert players table
    fetch_stats.py       # GET /athletes/{id}/stats → upsert player_stats table
    run_all.py           # Orchestrator — runs all three in order
  requirements.txt       # httpx, psycopg2-binary, python-dotenv
```

---

## 3. Database Schema (PostgreSQL)

```sql
-- All 32 NFL franchises
CREATE TABLE teams (
  id          SERIAL PRIMARY KEY,
  espn_id     TEXT UNIQUE NOT NULL,    -- ESPN's numeric team ID
  abbreviation TEXT NOT NULL,          -- "DAL", "NE", etc.
  name        TEXT NOT NULL,           -- "Dallas Cowboys"
  city        TEXT NOT NULL,           -- "Dallas"
  conference  TEXT NOT NULL,           -- "NFC" | "AFC"
  division    TEXT NOT NULL,           -- "NFC East", etc.
  color_primary   TEXT,                -- hex, e.g. "#003594"
  color_secondary TEXT,
  logo_url    TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Players — linked to a team
CREATE TABLE players (
  id          SERIAL PRIMARY KEY,
  espn_id     TEXT UNIQUE NOT NULL,
  team_id     INT REFERENCES teams(id),
  name        TEXT NOT NULL,
  position    TEXT NOT NULL,           -- "QB", "RB", "WR", "LB", "CB", "K", etc.
  jersey      TEXT,
  headshot_url TEXT,
  status      TEXT DEFAULT 'active',   -- active | injured | inactive
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Season stats — one row per player per season
CREATE TABLE player_stats (
  id           SERIAL PRIMARY KEY,
  player_id    INT REFERENCES players(id) ON DELETE CASCADE,
  season       INT NOT NULL,           -- e.g. 2025
  season_type  TEXT DEFAULT 'regular', -- regular | postseason

  -- Offense
  pass_yards   INT DEFAULT 0,
  pass_tds     INT DEFAULT 0,
  interceptions_thrown INT DEFAULT 0,
  rush_yards   INT DEFAULT 0,
  rush_tds     INT DEFAULT 0,
  receptions   INT DEFAULT 0,
  rec_yards    INT DEFAULT 0,
  rec_tds      INT DEFAULT 0,

  -- Defense
  tackles      INT DEFAULT 0,
  sacks        NUMERIC(4,1) DEFAULT 0,
  interceptions INT DEFAULT 0,
  forced_fumbles INT DEFAULT 0,
  pass_deflections INT DEFAULT 0,

  -- Special Teams
  fg_made      INT DEFAULT 0,
  fg_attempted INT DEFAULT 0,
  punt_avg     NUMERIC(4,1) DEFAULT 0,
  return_tds   INT DEFAULT 0,

  games_played INT DEFAULT 0,
  updated_at   TIMESTAMPTZ DEFAULT now(),

  UNIQUE(player_id, season, season_type)
);

-- Cached schedule data (populated from sports tool via SvelteKit server action)
CREATE TABLE games (
  id           TEXT PRIMARY KEY,        -- sports tool game ID
  home_team    TEXT NOT NULL,           -- abbreviation
  away_team    TEXT NOT NULL,
  home_score   INT,
  away_score   INT,
  status       TEXT NOT NULL,           -- scheduled | closed | inprogress
  game_time    TIMESTAMPTZ,
  week         INT,
  season       INT,
  broadcast    TEXT,                    -- "Sunday Night Football", etc.
  updated_at   TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. SvelteKit Application Structure

```
src/
  lib/
    server/
      db.ts              # PostgreSQL client (postgres.js or pg)
      teams.ts           # DB query helpers: getTeam(), getAllTeams()
      players.ts         # getPlayersByTeam(), getPlayerById()
      stats.ts           # getPlayerStats(), getTopStatsByTeam()
      schedule.ts        # getScheduleForTeam() — calls sports tool + caches to DB
    components/
      TeamCard.svelte    # Team tile with logo, record badge, conference pill
      PlayerCard.svelte  # Player card with headshot, position badge, jersey #
      StatBlock.svelte   # Individual stat display (value + label + icon)
      ScheduleRow.svelte # Single game row: opponent, date, score/status
      Navbar.svelte      # Top nav with NFL logo and conference filter
      DivisionGrid.svelte # Grouped team tiles by division
    stores/
      selectedTeam.ts    # Svelte store: currently viewed team
      ui.ts              # Loading states, active filters
    utils/
      teamColors.ts      # Maps abbreviation → primary/secondary colors
      statFormatters.ts  # Format sacks as "12.5", pct as "67.3%", etc.
      positionGroups.ts  # { offense: [...], defense: [...], specialTeams: [...] }
    types/
      Team.ts
      Player.ts
      Stats.ts
      Game.ts

  routes/
    +layout.svelte       # App shell: Navbar, background, font imports
    +layout.server.ts    # Load all teams server-side (used in nav/homepage)

    +page.svelte         # Homepage: Conference/Division team browser
    +page.server.ts      # Load standings from sports tool + teams from DB

    teams/
      [abbr]/
        +page.svelte     # Team page: record, schedule, roster grid
        +page.server.ts  # Load team details, schedule, roster
        players/
          [playerId]/
            +page.svelte      # Player detail: stats, bio, position breakdown
            +page.server.ts   # Load player + stats from DB

  app.html               # HTML shell with font preloads
  app.css                # Global CSS variables, resets

static/
  nfl-teams.json         # Static fallback team metadata (colors, logos)
```

---

## 5. Page-by-Page Feature Breakdown

### Page 1 — Homepage (`/`)

- Conference tabs: AFC | NFC
- Division groupings (East, North, South, West) as labeled sections
- Team cards showing: logo, city, team name, W-L record, win %
- Playoff clinch badges: "DIV", "WC", "ELIM"
- Click any team card → navigates to `/teams/[abbr]`

### Page 2 — Team Page (`/teams/[abbr]`)

**Header section:**

- Large team banner with team colors as gradient background
- Team logo, full name, city, conference/division
- Win-Loss record prominently displayed

**Schedule section:**

- Season game log: each game shows opponent logo, date, home/away indicator, final score or scheduled time
- W/L colored indicators (green/red) for completed games
- Upcoming games have a countdown or just the date

**Roster section:**

- Tabs: Offense | Defense | Special Teams
- Player cards in a grid: headshot, name, position badge, jersey number
- Click player → `/teams/[abbr]/players/[id]`

### Page 3 — Player Page (`/teams/[abbr]/players/[id]`)

- Player hero: headshot, name, team, position, jersey #, status badge
- Stats panel: cards grouped by category (only relevant stats shown per position)
  - QB: Pass Yards, Pass TDs, INTs thrown, Completion %, Rush Yards
  - RB: Rush Yards, Rush TDs, Receptions, Rec Yards
  - WR/TE: Receptions, Rec Yards, Rec TDs, Targets
  - LB/DL: Tackles, Sacks, Forced Fumbles
  - CB/S: Tackles, Interceptions, Pass Deflections
  - K: FG Made/Attempted, FG %, Long FG
  - P: Punt Average, Inside-20, Long Punt
- Games played this season
- Back button → returns to team roster

---

## 6. API Route Design (SvelteKit Server)

```
GET  /api/teams                     → all teams with record
GET  /api/teams/[abbr]              → single team details
GET  /api/teams/[abbr]/schedule     → season schedule (hits sports tool, caches)
GET  /api/teams/[abbr]/players      → roster grouped by position unit
GET  /api/players/[id]              → player details
GET  /api/players/[id]/stats        → player season stats
POST /api/sync/schedule/[abbr]      → internal: re-sync schedule from sports tool
```

All routes use SvelteKit's `+server.ts` files and return typed JSON.

---

## 7. Python Sync Pipeline Detail

```python
# python/sync/run_all.py
import asyncio
from fetch_teams import sync_teams
from fetch_rosters import sync_all_rosters
from fetch_stats import sync_all_stats

async def main():
    await sync_teams()          # ~1 request
    await sync_all_rosters()    # ~32 requests (one per team)
    await sync_all_stats()      # ~1700 requests (one per player) — throttled
```

**Throttling:** ESPN rate limits aggressively. The stats sync uses `asyncio.sleep(0.3)` between
requests and batches players in groups of 10 with a 2-second pause between batches.

**Environment:**

```
DATABASE_URL=postgresql://user:pass@localhost:5432/nfl
ESPN_BASE=https://site.api.espn.com/apis/site/v2/sports/football/nfl
```

**Cron (Linux):**

```cron
0 3 * * * /usr/bin/python3 /app/python/sync/run_all.py >> /var/log/nfl-sync.log 2>&1
```

---

## 8. Design System

### Color Palette

- Background: deep charcoal `#0d0f14` with subtle noise texture overlay
- Surface cards: `#161921` with `#1e222d` borders
- Accent: electric gold `#f5a623` (primary interactive)
- Text: `#f0f2f5` primary, `#8a909e` muted
- Win green: `#22c55e` / Loss red: `#ef4444`
- Each team's own colors used contextually on their team page

### Typography

- Display/headings: **Bebas Neue** (free, Google Fonts) — classic sports broadcast feel
- Body/stats: **JetBrains Mono** or **IBM Plex Mono** — numeric data looks sharp in monospace
- UI labels: **Inter** or **Barlow Condensed**

### Visual Motifs

- Subtle diagonal line patterns on card backgrounds (like jersey fabric)
- Glowing stat numbers with drop shadows matching team color
- Position badges as pill chips with position-specific colors
- Score displays using 7-segment style font for game scores
- Smooth page transitions using SvelteKit's `onNavigate`

---

## 9. Tech Dependency List

| Layer         | Package                  | Purpose                                 |
| ------------- | ------------------------ | --------------------------------------- |
| SvelteKit     | `@sveltejs/kit`          | App framework                           |
| DB client     | `postgres` (npm)         | PostgreSQL via tagged template literals |
| DB migrations | `node-pg-migrate`        | Schema versioning                       |
| HTTP (Python) | `httpx`                  | Async ESPN fetching                     |
| DB (Python)   | `psycopg2-binary`        | DB upserts from pipeline                |
| Config        | `python-dotenv`          | `.env` loading in Python                |
| Adapter       | `@sveltejs/adapter-node` | Node.js production build                |
| Types         | `typescript`             | Full type safety                        |

---

## 10. Build Order (Recommended Sequence)

1. **DB setup** — write schema, run migrations, seed team metadata
2. **Python pipeline** — `fetch_teams.py` → `fetch_rosters.py` → `fetch_stats.py`, run once to populate
3. **SvelteKit server lib** — `db.ts`, `teams.ts`, `players.ts`, `stats.ts`
4. **Homepage** — team grid, standings, conference tabs
5. **Team page** — schedule (sports tool), roster tabs
6. **Player page** — stat display cards, position-based filtering
7. **Design pass** — apply full design system, animations, team color theming
8. **API routes** — expose `/api/*` endpoints for any future mobile client

---

## 11. Limitations & Notes

- **ESPN API is unofficial** — it doesn't require a key but is not guaranteed. If it goes down,
  the Python sync will fail silently (last DB values persist until next successful run).
- **Player headshots** — ESPN serves these as CDN URLs stored in the roster response.
  They can be stored as-is in the DB (`headshot_url`) and rendered via `<img>` tags.
- **Real-time in-game stats** — the sports tool provides live scores, but per-player live stats
  (yards on a specific drive) would require a paid API (SportsRadar, Stats Perform). This architecture
  focuses on season cumulative stats, which is what ESPN provides for free.
- **Schedule caching** — the sports tool is called at page load for schedule data and the result
  is cached in the `games` table. A re-sync button on the team page can force a refresh.
