# Use a second backend alongside Lovable Cloud

## What stays the same
- The website and Android app keep using the current Lovable Cloud backend for sign-in, exams, CBT, courses, purchases and results. Nothing moves and no data changes.

## What gets added
- A separate connection to the second project ("Smart AI OMR" external project), used only by the features you choose.
- It uses the **project URL and publishable key** only. Both are safe to include in the app.
- The **service role key is never put in the app.** It was shared in chat, so reset it in that project's settings before going further.

## Open decision (needed before building)
- Which feature should use the second project? For example: storing scanned OMR images, a separate leaderboard, or app-only analytics. Student sign-in can't be split across the two backends without account linking, so sign-in stays on Lovable Cloud.

## Technical details
- New `src/integrations/external/client.ts`: a second `createClient(URL, publishableKey)` with its own storage key (`sb-external-auth`), so the two sessions don't overwrite each other.
- The URL and key go in `src/lib/externalBackend.ts` as public constants. They are not stored as secrets because they're safe to ship.
- The chosen feature reads and writes only through this client. The second project needs its own row-level security on those tables.
- Android: the Capacitor build bundles both clients automatically, so Android Studio needs no extra setup. Run `npm run build` and then `npx cap sync android`.
- Record the two-backend rule in `AGENTS.md`.
