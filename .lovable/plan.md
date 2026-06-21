## Why your site isn't showing in Google yet

Your site `smart-answer-maker.lovable.app` is **verified in Search Console**, but verification ≠ indexing. Google has to *crawl* and *index* the site before it appears in search results. For a brand-new site this typically takes **1–4 weeks**, sometimes longer for a `.lovable.app` subdomain (lower domain authority than a custom domain).

## What I'll do to speed it up

1. **Submit the sitemap to Search Console** via the API
   - Endpoint: `PUT /webmasters/v3/sites/{site}/sitemaps/{feedpath}`
   - Feed: `https://smart-answer-maker.lovable.app/sitemap.xml`
   - This tells Google exactly which URLs to crawl.

2. **Request indexing for the homepage** (URL Inspection / Indexing API where available) — note: Google's Indexing API officially only supports JobPosting/BroadcastEvent, so the reliable path is sitemap submission + waiting. I'll submit the sitemap and confirm it's accepted.

3. **Expand `public/sitemap.xml`** to include more routes so Google discovers the full app:
   - `/`, `/auth`, plus public pages found in `src/App.tsx` routes (Dashboard, Sheets, Analytics, History, Profile, Chat, CreateSheet — only those that should be public/indexable).
   - I'll read `src/App.tsx` first to pick the right set; auth-gated routes will be excluded or kept `noindex`.

4. **Strengthen on-page SEO signals** so when Google does crawl, ranking improves for "smart answer maker" / "smart ai omr analysis":
   - Add the brand phrase "Smart Answer Maker" explicitly into the `<title>` and meta description in `index.html` (currently only "Smart AI OMR Analysis" appears).
   - Add it to `og:title` and the JSON-LD `name` / `alternateName`.

## What you should do

- **Be patient** — even with all of the above, first appearance in Google can take 1–3 weeks.
- **Consider a custom domain** (e.g. `smartanswermaker.com`). Subdomains on shared hosts like `*.lovable.app` rank weaker and slower than your own domain.
- **Get backlinks** — share the URL on social media, forums (Reddit r/NEET, Quora), and student communities. Backlinks are the #1 signal that accelerates indexing.

## Technical details

- Files touched: `index.html` (title/description/JSON-LD), `public/sitemap.xml` (add routes).
- API call: `PUT https://connector-gateway.lovable.dev/google_search_console/webmasters/v3/sites/https%3A%2F%2Fsmart-answer-maker.lovable.app%2F/sitemaps/https%3A%2F%2Fsmart-answer-maker.lovable.app%2Fsitemap.xml`
- No backend or schema changes.

Approve to proceed.
