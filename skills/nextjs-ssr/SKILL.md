---
name: nextjs-ssr
description: House rule for every web project — build it with Next.js on the App Router and server-render the content, so crawlers, link previews and AI answer engines receive complete HTML on the first request. Use when starting a web project, choosing a framework or rendering strategy, adding a page or route, fetching data for anything that should be indexable, or when a page's content is missing from view-source.
---

# Next.js, server-rendered

Every web project we build is Next.js on the App Router, and everything a visitor
or a crawler should see must be present in the HTML of the first response.

The test is literal: `curl` the URL and the content is in the output. If it only
appears after JavaScript runs, it does not count as server-rendered.

## Rendering rules

- **Server Components by default.** Add `'use client'` only to the leaf component
  that genuinely needs state, effects or browser APIs — never to a page or layout
  so that a whole subtree becomes client-only.
- **Fetch on the server.** Data for anything indexable is fetched in the server
  component or route handler that renders it. Never fetch indexable content in
  `useEffect`, and don't gate it behind a loading spinner that only clears
  client-side.
- **Static where the data allows it.** Use static rendering plus
  `generateStaticParams` for known routes, and `revalidate` for content that
  changes on a schedule. Reach for request-time rendering only when the output
  genuinely differs per request; don't set `dynamic = 'force-dynamic'` to make a
  data-fetching problem go away.
- **Real links.** Primary navigation uses `next/link` or `<a href>` with a real
  URL. No click handlers that navigate via `router.push` alone — a crawler cannot
  follow those.
- **Every page is a route.** Content that deserves to be found gets its own URL,
  not a tab or modal on a single page.

## Crawlability

- `generateMetadata` (or a static `metadata` export) on every route: title,
  description, canonical URL, and Open Graph plus Twitter tags for link previews.
- `app/sitemap.ts` and `app/robots.ts` — generated from the real route list, not
  hand-maintained.
- JSON-LD structured data in the server-rendered HTML for the page's type
  (`Organization` and `LocalBusiness` for client sites, `Article` for posts,
  `Product` where relevant).
- Semantic markup: one `<h1>` per page, headings in order, real `<nav>`, `<main>`
  and `<footer>`, and alt text on every meaningful image.
- `next/image` for images, with explicit dimensions so layout does not shift.

## Verify before calling it done

```bash
# content present without JavaScript
curl -s http://localhost:3000/ | grep -i "<h1"

# metadata and structured data present
curl -s http://localhost:3000/ | grep -iE '<title>|og:title|application/ld\+json'

# routes the crawler will find
curl -s http://localhost:3000/sitemap.xml | head
curl -s http://localhost:3000/robots.txt
```

Run these against a production build (`next build && next start`), since `next dev`
behaves differently. If a check comes back empty, the content is client-rendered —
fix the component, don't paper over it with a prerender service.

For anything interactive, drive the real browser with the `playwright-cli` skill
rather than assuming it works.

## When something else is genuinely better

A pure CLI tool, an internal dashboard behind a login, or an embedded widget has
nothing to crawl, so this rule does not apply — say so explicitly and pick the
simpler option. If a client requires a different stack, follow the client. Do not
quietly substitute a client-only SPA for a site that is meant to be found.
