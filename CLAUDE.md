# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Radio Columbia is a Next.js 14 application for a Costa Rican radio station. It provides live radio streaming, news from WordPress, podcasts/radionovelas from RSS feeds, and widgets like weather, earthquakes, lottery results, and sports standings.

## Commands

### Development
```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Data Sources

**WordPress API** (`src/lib/wordpressService.ts`)
- News content from `https://radiodev.aurigital.com/wp-json/wp/v2`
- Fetches posts, categories, tags with embedded media
- Uses `_embed` parameter for featured images and author data

**RSS/Podcast Service** (`src/lib/rssService.ts`, `src/lib/rssConfig.ts`)
- Handles YouTube playlists (converted to Atom feeds) and Captivate RSS feeds
- Implements singleton pattern with caching (1 hour duration)
- Batch processing (5 feeds at a time) with retry logic and rate limiting
- Proxy fallback system for CORS issues
- Two categories: 'podcast' and 'radionovela'

**External APIs** (in `src/app/api/*`)
- `/api/earthquakes` - Seismic data
- `/api/jps/chances/last` - Lottery results (Chances)
- `/api/jps/loteria/last` - Lottery results (Loteria)
- `/api/rss` - RSS feed proxy
- `/api/standings` - Sports standings

### Context Providers

**PlayerContext** (`src/lib/PlayerContext.tsx`)
- Global audio player state
- Supports two modes: 'radio' (live stream) and 'podcast' (episodes)
- Manages playlist navigation (next/previous episodes)

**SearchContext** (`src/lib/SearchContext.tsx`)
- Global search state

### Component Structure

**Pages** (`src/app/(pages)/*`)
- Uses Next.js 14 App Router with route groups
- Dynamic routes: `/news/[slug]` and `/podcasts/[id]`

**Layout** (`src/app/layout.js`)
- Wraps app with SearchProvider → PlayerProvider
- Includes SplashPage and RadioPlayer globally
- Contains structured data (Schema.org) for RadioStation

**Reusable Components**
- `RadioPlayer.tsx` - Fixed bottom player for radio/podcasts
- `NewsCard.tsx`, `PodcastCard.tsx` - Display cards
- Sidebar widgets in `src/components/news/sidebar/*`

### TypeScript Types

- `src/types/podcast.ts` - RSS feed, podcast shows, episodes
- `src/types/wordpress.ts` - WordPress posts, categories, tags

### Styling

- TailwindCSS v4
- Path alias `@/*` maps to `src/*`
- Global styles in `src/app/globals.css`

## Important Notes

- All podcast RSS feeds are configured in `rssService.ts` in the `PODCAST_RSS_FEEDS` array
- YouTube playlists require custom metadata in `YOUTUBE_PODCAST_CONFIG` (title, description, imageUrl)
- RSS Service includes extensive retry and caching logic - avoid bypassing it
- WordPress posts use `_embed` for performance - always include it in fetch URLs
- Player is persistent across navigation via global context
