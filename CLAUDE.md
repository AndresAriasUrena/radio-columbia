# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **What belongs in this file:** architecture, conventions and invariants — the things
> that are already evident from reading the source, written down so they don't have to be
> rediscovered. **What must never go in it:** secret values, credentials, capacity limits,
> or descriptions of unfixed weaknesses. See "Security conventions" at the end.

## Project Overview

Radio Columbia is a Next.js 14 application for a Costa Rican radio station. It provides live
radio streaming, news from WordPress, podcasts/radionovelas from RSS feeds, and widgets like
weather, earthquakes, lottery results, and sports standings.

Hosted on Vercel. Content comes from a separate, self-hosted WordPress (LiteSpeed/PHP).

## Commands

### Development
```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

Never run `npm run build` while the dev server is running: both write to `.next/` and emit
incompatible chunk graphs, which produces a misleading `Cannot find module
'./vendor-chunks/*.js'` at runtime. If it happens, clear the compiled output but keep the
caches (losing them means a slow cold start for webpack, optimized images and fetch):

```bash
find .next -mindepth 1 -maxdepth 1 ! -name cache -exec rm -rf {} +
```

## Environment variables

Names only — values live in `.env.local` (gitignored) and in Vercel. See `.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `WORDPRESS_API_URL` | **yes** — the build fails without it | WordPress REST base, no trailing slash |
| `WP_REVALIDATE_SECRET` | no (degrades gracefully) | Shared secret for `/api/revalidate` |

`WORDPRESS_API_URL` deliberately has **no** `NEXT_PUBLIC_` prefix, so it is not inlined into
the browser bundle. Do not add one — see `src/lib/wpOrigin.ts` for why.

## Architecture

### WordPress data flow

This is the most load-sensitive part of the app. The WordPress origin is a single PHP box and
it is the capacity bottleneck for the whole site, so every read is cached.

```
browser ──► /api/wp/[...path] ──► Next.js Data Cache ──► WordPress
                                        ▲
server components ──────────────────────┘  (direct, same cache tags)

WordPress publish ──► /api/revalidate ──► revalidateTag() ──► cache dropped
```

**`src/lib/wordpressService.ts`** — the only place that talks to WordPress. All reads go
through `wpFetch`, which routes by environment: server-side calls hit WordPress directly with
Next's tagged Data Cache; browser-side calls go to `/api/wp`, which owns the caching. Requests
carry `_fields` to trim the payload, which also keeps entries under the 2 MB Data Cache limit.

**`src/app/api/wp/[...path]/route.ts`** — read-only proxy. Allow-lists collections and query
params and clamps `per_page`, because the route is public and would otherwise be an
amplifier toward WordPress. Forwards `X-WP-Total` / `X-WP-TotalPages`, which the pagination
in `getPosts` depends on. Cache headers differ by collection: `posts` are not browser/CDN
cached so that tag purges give immediate freshness; `categories` and `tags` are, since several
components request the same list on every page load.

**`src/app/api/revalidate/route.ts`** — receives the publish webhook from WordPress and drops
the relevant cache entries. Fails closed: with no secret configured it rejects everything, so
deploying without it costs freshness, never safety. Setup is in
[docs/wordpress-revalidate.md](docs/wordpress-revalidate.md).

Cache tags are defined in one place, `WP_TAGS` in `wordpressService.ts`: `wp`, `wp-posts`,
`wp-categories`, `wp-tags`, and `wp-post-<slug>` for individual articles.

### Other data sources

**RSS/Podcast Service** (`src/lib/rssService.ts`, `src/lib/rssConfig.ts`)
- Handles YouTube playlists (converted to Atom feeds) and Captivate RSS feeds
- Singleton with in-memory caching (1 hour)
- Batch processing (5 feeds at a time) with retry logic and rate limiting
- Proxy fallback system for CORS issues
- Two categories: 'podcast' and 'radionovela'

**External APIs** (in `src/app/api/*`)
- `/api/earthquakes` — Seismic data
- `/api/jps/chances/last` — Lottery results (Chances)
- `/api/jps/loteria/last` — Lottery results (Loteria)
- `/api/rss` — RSS feed proxy
- `/api/standings` — Sports standings
- `/api/weather` — Weather by city

### Context Providers

**PlayerContext** (`src/lib/PlayerContext.tsx`)
- Global audio player state
- Two modes: 'radio' (live stream) and 'podcast' (episodes)
- Manages playlist navigation (next/previous episodes)

**SearchContext** (`src/lib/SearchContext.tsx`)
- Global search state

### Component Structure

**Pages** (`src/app/(pages)/*`, plus `src/app/page.jsx` for the home page)
- Next.js 14 App Router with route groups
- Articles are at the root: `/[slug]`. Podcasts at `/podcasts/[id]`
- Home, `/news` and `/sports` are client components; their HTML shell is a static prerender
  served from Vercel's edge, and the news data is fetched client-side through `/api/wp`

**Layout** (`src/app/layout.js`)
- Wraps app with SearchProvider → PlayerProvider
- Includes SplashPage and RadioPlayer globally
- Contains structured data (Schema.org) for RadioStation

**Reusable Components**
- `RadioPlayer.tsx` — Fixed bottom player for radio/podcasts
- `NewsCard.tsx`, `NewsCardGrid.tsx`, `PodcastCard.tsx` — Display cards
- Sidebar widgets in `src/components/news/sidebar/*`

### TypeScript Types

- `src/types/podcast.ts` — RSS feed, podcast shows, episodes
- `src/types/wordpress.ts` — WordPress posts, categories, tags

### Styling

- TailwindCSS 3.4 (`tailwind.config.js`)
- Path alias `@/*` maps to `src/*`
- Global styles in `src/app/globals.css`

## Invariants

Breaking these re-introduces outages the site has already had. They are not style preferences.

- **Never fetch WordPress from the browser directly.** Every read goes through
  `WordPressService` so it inherits the proxy, the cache tags and the `_fields` trimming. A
  direct client-side `fetch` to the WordPress host means one origin request per visitor,
  which is what used to take the site down during high-traffic events.
- **Never retry a failed WordPress request.** Retrying a saturated origin multiplies load at
  the exact moment it has no capacity. A single attempt and a clean failure is deliberate.
- **Never turn a transport failure into `notFound()`.** `getPostBySlug` throws
  `WordPressUnavailableError` when WordPress is unreachable, and `src/app/(pages)/[slug]`
  lets it propagate on purpose. A 404 would get cached and outlive the outage, telling
  crawlers that real articles don't exist.
- **Keep `_fields` on every query**, and never request `per_page=100` with `_embed` — that
  combination returns megabytes of media and author objects. The sitemap needs `slug` and
  `modified` only; see `getPostSlugs`.
- **Don't fetch per-category in a loop.** `CategoryNewsGrid` requests all categories in the
  batch in one call and groups in memory. The per-category loop it replaced issued one
  serialized request each.
- Podcast RSS feeds are configured in `rssService.ts` (`PODCAST_RSS_FEEDS`); YouTube
  playlists need metadata in `YOUTUBE_PODCAST_CONFIG`
- The RSS Service has its own retry/caching logic — don't bypass it
- The player must stay persistent across navigation via global context

## Security conventions

- **No secret values in the repository**, including this file: no keys, tokens, passwords or
  connection strings. Only variable *names*, documented in `.env.example`.
- `.gitignore` has a blanket `.env*` rule. That protects `.env.local`, and it also means
  `.env.example` needs `git add -f` when it changes.
- `/api/wp` and `/api/revalidate` are public URLs. Treat them as such: the proxy is read-only
  with an allow-list, and revalidation is authenticated with a header secret compared in
  constant time, failing closed when unset.
- **Don't document capacity limits or unfixed weaknesses here.** Architecture is fine — hiding
  it protects nothing, since anyone who can read this file can read the source. But "the
  backend saturates at N concurrent users" is an attack recipe rather than useful context, and
  belongs in internal operational notes, not in a versioned file.
