## Goal
Boost Google rankings and visibility for **Smart AI OMR Analysis** (smartaiomranalyis.lovable.app) with stronger on-page SEO, richer structured data, and better discoverability.

## What I'll do

### 1. Stronger on-page metadata (`index.html`)
- Rewrite `<title>` with high-intent keywords: "Smart AI OMR Analysis — Free OMR Sheet Checker & Answer Maker Online"
- Expand `<meta name="description">` (~155 chars) with keywords: OMR scanner, answer sheet checker, exam analysis, MCQ test, free.
- Add `<meta name="keywords">` (smart ai omr, omr sheet checker, answer maker, mcq scanner, exam analysis app, etc.)
- Add `<meta name="author">`, `theme-color`, `application-name`.
- Add complete Open Graph + Twitter Card tags (title, description, image, url, type, site_name).
- Add `hreflang="en"` and `<meta name="language">`.

### 2. Richer JSON-LD structured data
- **WebSite** schema with `SearchAction` (Google sitelinks search box).
- **SoftwareApplication** schema (category: EducationalApplication, free, rating).
- **Organization** schema with logo + sameAs.
- **FAQPage** schema answering top queries ("What is Smart AI OMR?", "How to scan OMR sheet?", "Is it free?").
- **BreadcrumbList** for main routes.

### 3. Per-route SEO via existing `SEO` component
- Audit each public page (Auth, Create, Sheets, History, Analytics, Chat, Profile) — ensure unique keyword-rich titles and descriptions targeting long-tail queries.

### 4. Semantic content boost on landing/auth page
- Add an SEO-friendly hidden-but-visible content section (h1, h2, short intro paragraph) describing the product, features, and use cases — gives Google crawlable text. (Frontend only, no business logic change.)

### 5. Sitemap & robots refresh
- Update `public/sitemap.xml` with fresh `lastmod`, priorities, changefreq.
- Confirm `robots.txt` allows crawl + points to sitemap.

### 6. Submit to Google
- Use Search Console connector to resubmit sitemap and request URL inspection/indexing for `/` and `/auth`.

## What I won't touch
- Backend logic, auth, database, payments.
- Existing AdSense / Analytics tags.
- Branding (name stays Smart AI OMR Analysis).

## Expected outcome
- Pages indexed faster with brand + keyword queries (smart ai omr, smart answer maker, omr checker).
- Rich result eligibility (sitelinks search box, FAQ rich snippet, app rating).
- Stronger social previews.

Approve to implement.