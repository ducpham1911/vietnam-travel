# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VietnamTravel is a Next.js 16 PWA for discovering Vietnamese cities/places and planning multi-day trips. Dark-mode-only design, client-side persistence with Dexie.js (IndexedDB), deployable to Vercel free tier.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript, Webpack mode)
- **Styling:** Tailwind CSS v4
- **User data:** Dexie.js + dexie-react-hooks (IndexedDB)
- **Icons:** Lucide React
- **PWA:** Serwist (service worker)
- **Drag & drop:** @dnd-kit/core + @dnd-kit/sortable
- **Modals:** Vaul (drawer sheets)

## Build & Run

```bash
npm run dev          # Dev server (localhost:3000)
npm run build        # Production build (uses --webpack for Serwist compat)
npm run start        # Serve production build
```

No tests or CI configured.

## Architecture

Two-layer data model:

**Static data** — TypeScript constants in `src/data/` (cities.ts, places.ts, categories.ts). 10 cities, ~100 places. Imported directly, no DB or API.

**User data** — Dexie.js (IndexedDB) with 5 tables defined in `src/db/db.ts`:
- `trips`, `dayPlans`, `placeVisits`, `customCities`, `customPlaces`
- Reactive reads via `useLiveQuery()` in `src/db/hooks.ts`
- Cascade deletes in `db.transaction()`

### Route Structure

| Route | Component | Rendering |
|---|---|---|
| `/discover` | City list, search, custom cities | Client |
| `/discover/[cityId]` | City detail + category filter | Client |
| `/discover/[cityId]/places/[placeId]` | Place detail, add-to-trip | Client |
| `/trips` | Trip list, create trip | Client (Dexie) |
| `/trips/[tripId]` | Trip detail, day cards | Client (Dexie) |
| `/trips/[tripId]/days/[dayNumber]` | Day plan, timeline, drag-reorder | Client (Dexie) |

### Key Directories

- `src/app/` — Next.js App Router pages
- `src/components/` — UI components (layout/, discover/, trips/, sheets/, ui/)
- `src/data/` — Static seed data (cities, places, categories)
- `src/db/` — Dexie database schema and reactive hooks
- `src/lib/` — Theme constants and utility functions
- `src/types/` — TypeScript type definitions
- `public/images/cities/` — City images (city_hanoi.png, etc.)

### Theming

All colors defined in `src/app/globals.css` as Tailwind `@theme` tokens:
- Backgrounds: `dark-bg`, `card-bg`, `surface-bg`, `elevated-bg`
- Brand: `brand-red`, `brand-gold`, `brand-teal`, `brand-coral`
- Text: white, `text-secondary`, `text-tertiary`
- City gradients and category colors in `src/lib/theme.ts`

### Key Patterns

- `useLiveQuery()` for reactive IndexedDB reads (like SwiftData's `@Query`)
- Vaul drawer sheets for create/add flows
- @dnd-kit for drag-to-reorder place visits
- Category filtering with `CategoryChip` component
- Timeline visualization with `PlaceVisitRow`
- `.card-style` and `.glass-style` CSS classes for consistent card styling
