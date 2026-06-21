## Plan: Verify site in Google Search Console via Lovable connector

The site already has a verification meta tag in `index.html`, a valid `sitemap.xml`, and `robots.txt`. I'll connect your Google Search Console account and run the official verification flow so the site is registered as a property in your account.

### Steps

1. **Link the Google Search Console connector** to this project (you'll be prompted to authorize your Google account).
2. **Request a fresh META verification token** from Google for `https://smart-answer-maker.lovable.app/`.
3. **Add that token as a second `google-site-verification` meta tag** in `index.html` (keeping your existing one untouched so old verifications keep working).
4. **You publish/update the app** so the new tag is live on the production URL.
5. **Call Google's verify endpoint** to confirm ownership.
6. **Add the site as a property** in your Search Console account via the API so it appears in your dashboard.
7. After verification, I'll remind you to **submit `sitemap.xml`** in Search Console → Sitemaps.

### Notes

- Only `index.html` will be edited (one extra `<meta>` tag).
- No backend or app code changes.
- Step 4 requires you to click **Publish → Update** before step 5 — Google fetches the live HTML, not the preview.
