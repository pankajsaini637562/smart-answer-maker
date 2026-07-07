
# Study Material Marketplace

Add a new section where admins upload notes/study material and students buy paid ones via UPI or access free ones instantly. Includes a referral discount system and downloadable receipts.

## New sections in the app

- **Study Materials** (`/materials`) — public catalog of all approved materials, filterable by Free / Paid, subject, class.
- **Material Details** (`/materials/:id`) — description, price, preview, buy / download button.
- **My Library** (`/library`) — user's owned/accessed materials with download links.
- **Refer & Earn** (`/refer`) — user's invite link, referral stats, discount status.
- **Admin Panel** (`/admin`) — visible only to admin emails:
  - Upload material (title, description, subject, class, price, free/paid, file)
  - Pending payments queue → approve / reject with note
  - Purchases & referral overview
- **Profile updates** — new fields: `upi_id_for_payout` (not used yet), and new stat tiles for "Materials owned", "Referrals", "Discount earned"; a "Refer & Earn" quick link and, for admins, an "Admin Panel" button.

## Purchase flow

1. Student opens a paid material → sees price. If they have a valid referral discount, discounted price is shown.
2. Clicks **Buy** → modal shows:
   - UPI ID `7891041852@fam`, amount, a UPI deep-link and QR
   - Fields: **UTR / Transaction ID** (required), optional screenshot upload
3. On submit, a `purchases` row is created with status `pending`.
4. Admin sees it in the pending queue → **Approve** (grants access, generates receipt) or **Reject** (with reason).
5. On approval:
   - Access is granted (row visible in My Library)
   - **Receipt** is generated client-side (PDF) and downloadable immediately from Purchase Details or My Library
   - Referrer (if any) earns their reward

## Referral flow

- Every user gets a unique `referral_code` on signup (stored on profile).
- Invite link: `https://<app>/?ref=CODE` (captured to localStorage on landing; applied at signup).
- **Referred user**: gets a **10% discount** automatically on their first paid purchase.
- **Referrer**: after their referred friend completes a paid purchase (admin-approved), receives a **10% discount credit** usable on their next paid purchase (one credit per successful referral, stackable up to a cap of 50%).
- Free courses do not trigger referral rewards.

## Free vs paid

- Free materials: instant access on click, no approval, no payment, added straight to My Library.
- Paid materials: full UPI + approval flow above.

## Admin access

Admin emails are hardcoded in one config file (`src/lib/adminEmails.ts`). Any authed user whose email matches gets admin UI + policies.

## Receipt

Generated in-browser with `jspdf` using existing app branding (Space Grotesk + purple accent, glassmorphism logo). Contains: receipt no, date, buyer name/email, material title, amount, UTR, discount applied, admin approval timestamp. Downloadable from purchase details and My Library. Also re-downloadable anytime.

---

## Technical details

### Database (new migration)

- `materials`
  - `id uuid pk`, `title text`, `description text`, `subject text`, `class text`, `is_free bool`, `price_inr int`, `file_path text` (in `study-materials` storage bucket), `cover_url text`, `created_by uuid`, `is_published bool default true`, timestamps
- `purchases`
  - `id`, `user_id`, `material_id`, `amount_inr int`, `discount_percent int`, `final_amount_inr int`, `utr text`, `screenshot_path text nullable`, `status text` (`pending|approved|rejected`), `admin_note text`, `approved_by`, `approved_at`, `referrer_user_id nullable`, `receipt_no text`, timestamps
- `referral_credits`
  - `id`, `user_id` (owner of credit), `source_purchase_id`, `percent int`, `used_purchase_id nullable`, `created_at`
- Extend `profiles`: `referral_code text unique`, `referred_by uuid nullable`
- New storage buckets:
  - `study-materials` (private; signed URLs on download; access checked in edge function)
  - `payment-proofs` (private; owner + admin read)

### RLS & roles

- Admin check via SQL function `public.is_admin(uid)` reading a small config table `admin_emails` seeded with `7891041852@fam`'s owner email at first launch — but per user's choice, we hardcode. So `is_admin` reads `auth.users.email` and compares to a fixed list stored in a Postgres function. Simpler: create table `admin_emails(email text pk)` and seed it; `is_admin(uid)` joins on `auth.users.email`.
- Policies:
  - `materials`: everyone can select where `is_published`; only admins insert/update/delete
  - `purchases`: user selects own; admin selects all; user inserts own pending; admin updates status
  - `referral_credits`: user selects own; system inserts via trigger on purchase approval

### Edge function

- `download-material` — validates user has an approved purchase or material is free, returns a signed URL from the private bucket.
- Trigger `on_purchase_approved`: awards referral credit to referrer, marks referred user's discount as consumed.

### Frontend

- New pages under `src/pages/materials/*`, `src/pages/admin/*`, `src/pages/ReferPage.tsx`, `src/pages/LibraryPage.tsx`.
- Add nav entries: "Materials" for everyone; "Admin" only if `useIsAdmin()` true.
- `src/lib/referral.ts` — capture `?ref=CODE` from URL to localStorage, attach at signup.
- `src/lib/receipt.ts` — `jspdf` receipt generator.
- Install: `jspdf`, `qrcode.react`.
- Profile page gets: referral code + copy button, credit balance, admin panel link if admin, new stat tiles.

### Payments

Manual UPI + admin approval as chosen. No payment gateway integration. UPI ID `7891041852@fam` is stored as a constant in `src/lib/paymentsConfig.ts` and shown in the buy modal along with a `upi://pay?pa=...&am=...&tn=...` deep link and QR.

### Files to create / edit (high level)

- Migration: materials, purchases, referral_credits, profiles extension, admin_emails, storage buckets, RLS, trigger
- Edge function: `download-material`
- New pages: MaterialsPage, MaterialDetailPage, LibraryPage, ReferPage, AdminPanelPage, AdminUploadPage, AdminPurchasesPage
- New components: BuyModal, ReceiptPreview, MaterialCard, PendingPurchaseRow
- Edits: `AppHeader.tsx` (nav), `App.tsx` (routes), `AuthPage.tsx` (capture referral on signup), `ProfilePage.tsx` (referral/admin/stats), `LandingPage.tsx` (capture `?ref=`)

## Out of scope

- Automated UPI verification (no gateway)
- Payouts to admin — assumed to be handled outside the app
- Refunds flow
- Marketing emails
