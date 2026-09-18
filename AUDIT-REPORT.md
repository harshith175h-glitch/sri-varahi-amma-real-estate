# Website Audit & Fix Report
**Project:** Sri Varahi Amma Real Estate (`sri-varahi-amma-real-estate`)
**Audited commit:** `622658a` (branch `main`) → fixes applied on `arena/01a0adf9-sri-varahi-amma-real-estate`
**Date:** 17 September 2026
**Scope:** Vite + React 19 SPA with an Express server (`server.ts`), TypeScript, Tailwind v4, deployable to Vercel.

---

## 1. Executive summary

The site is visually strong and feature-rich on paper (verified plots, escrow tracker, document
wallet, muhurtham calendar), but **most of the trust-critical behaviour was simulated in the
browser**. Three classes of problems were found:

| Severity | Count | Examples |
|---|---|---|
| 🔴 Critical | 6 | No lead ever reached the business, anonymous visitors could replace the site logo, owner PIN + OTP were hard-coded in the client bundle, live preview blocked (403), type-check failing (build gate), logo image broken on every fresh clone |
| 🟠 High | 9 | User data lost on refresh (storage key mismatch), multi-currency + compare features unreachable, no favicon/robots/sitemap/OG image, misleading "KYC Verified"/security claims, `.env.local` never loaded, Vercel rewrote `/api/*` to HTML |
| 🟡 Medium | 10 | Accessibility (no `role="dialog"`, no ESC/trap, `alert()` validation), 615 kB single bundle, 70 hot-linked Unsplash images, static FX rates, duplicate agent contact details, dead code |

**All critical and high issues have been fixed in this branch** and verified with
`npm run typecheck`, `npm run build` and `bash scripts/smoke-test.sh` (16/16 passing).
Section 5 lists what still needs business decisions rather than code.

---

## 2. What was broken, with evidence

### 🔴 C1 — No enquiry ever reached the broker
`App.tsx → handleSubmitInquiry()` wrote the enquiry to **the visitor's own localStorage** and showed
the toast *"Your tour request has been sent to Harshith…"*. There was no `/api/inquiry` endpoint
anywhere in `server.ts`. Every "Site Visit" / "Submit Inquiry" click since launch produced a
confident success message and **zero leads**.

### 🔴 C2 — Anyone could replace the site's logo and artwork
`POST /api/deity-image` had no authentication. Verified during the audit:

```bash
curl -X POST http://localhost:3000/api/deity-image \
  -H 'Content-Type: application/json' \
  -d '{"imageUrl":"data:image/png;base64,iVBORw0KGgo="}'
# → {"success":true,"message":"Deity image synchronized globally across all devices"}
```

The endpoint wrote `public/deity.jpg` + `public/deity-image.json`, and `/api/deity-image` then
served that image to **every device**. A single anonymous request could deface the brand for all
visitors (and burn disk on each upload).

### 🔴 C3 — The owner desk and buyer login were fake
Inside the shipped JavaScript bundle:

```ts
// AuthAndUserAccountModal.tsx (HEAD)
if (otpCode === generatedOtp || otpCode === '7890' || otpCode === '1234' || otpCode.length === 4) { … }
if (brokerPin === '2026' || brokerPin === '1234' || brokerPin === '6383') { … }

// AddPropertyModal.tsx (HEAD)
if (securityPin.trim() !== '7890' && securityPin.trim() !== '1234') {
  setSecurityError('… Please enter authorized Seller PIN (Demo: 7890)');   // PIN printed in the error
}
```

Any 4-digit OTP passed, three master PINs shipped in the bundle (one printed in an error message),
and publishing a listing only required the literal `7890`. A successful phone OTP also granted
`kycStatus: 'Verified'`, which is a KYC claim the product does not actually perform.

### 🔴 C4 — The live preview never loaded (HTTP 403)
`vite`'s dev server rejected the sandbox host:
`Blocked request. This host ("3000-….e2b.app") is not allowed.` — `server.allowedHosts` was never
configured, so the preview showed an error page instead of the site.

### 🔴 C5 — `npm run lint` (and therefore the deploy gate) failed
```
server.ts(362,44): error TS2769: No overload matches this call.
  Argument of type 'string' is not assignable to parameter of type 'number'.
```
`const PORT = process.env.PORT || 3000` is `string | number`, which does not satisfy
`httpServer.listen(port, host)`. `scripts/pre-deploy.sh` step 3 runs `npm run lint` with `set -e`, so
the documented pre-deploy check could never pass.

### 🔴 C6 — The logo image was broken on every fresh clone
`src/data/deityAsset.ts` exported `DEFAULT_DEITY_PHOTO_URL = '/deity.png'`, but
`.gitignore` contains `public/deity*.png` — the file was never committed, and no `deity.png` existed.
Requests fell through to the SPA fallback, which returned **HTTP 200 with `content-type: text/html`**
(verified with `curl -I /deity.png`), so the `<img>` rendered as a broken/blank logo. The probe in
`imageStorage.ts` had the same defect with a stale `Gemini_Generated_Image_….png` path.

### 🟠 H1 — Saved data disappeared on every refresh
`App.tsx` **read** `terra_properties_v1`, `terra_favorites_v1`, `terra_compare_v1`,
`terra_currency_v1`, but **wrote** `varahi_properties_v2`, `varahi_favorites_v2`,
`varahi_compare_v2`, `varahi_currency_v2`. Nothing ever round-tripped, so shortlists, comparisons,
user-added listings and the currency choice were silently discarded on reload. New visitors were
also pre-seeded with two fake favourites (`['prop-in-1', 'prop-int-1']`).

### 🟠 H2 — Two whole features were unreachable
* `setCurrency()` was **never called anywhere** — the multi-currency engine (`utils/currency.ts`)
  had no UI entry point, and `PropertyCard` hard-coded `formatPrice(price, 'INR')`.
* `setIsCompareOpen(true)` was **never called** — `ComparisonModal` could not be opened, and
  `PropertyCard` ignored the `isCompared` / `onToggleCompare` props it received. The compare
  feature was dead code.

### 🟠 H3 — SEO/social basics missing
`/favicon.ico` → 404, `/robots.txt` and `/sitemap.xml` → the SPA HTML shell, no web manifest,
`og:image`/`twitter:image` hot-linked an Unsplash photo (not brand-owned), `DEFAULT_DEITY…` JSON-LD
logo pointed at the same missing file, and `vercel.json` rewrote **every** path — including
`/api/*` — to `index.html`, so the API answered with HTML on the production domain.

### 🟠 H4 — Claims the product cannot back
The UI asserted "HTTPS 256-Bit SSL Encrypted", "Government Patta & 30-Yr EC Checked",
"Broker Response: < 15 Mins", "RERA & Title Verification Compliant", `kycStatus: 'Verified'` after a
phone OTP, and every card carried a hard-coded "Patta Verified" badge — regardless of the listing's
actual `isVerified` flag. For an Indian real-estate business these are advertising/consumer-law
exposure (ASCI, RERA disclosure, DPDP Act for claims about verification).

### 🟠 H6 — A stray `NODE_ENV=development` shipped React's *development* build
Vite inherits `NODE_ENV` from `.env`/`.env.local` (and from host environment variables), so a single
line silently switched the client bundle to `react-dom/cjs/react-dom-client.development.js` —
unminified, larger, and running React's runtime dev checks in production:

```
npm run build   (with NODE_ENV=development in .env.local) → index.js 643.16 kB │ gzip 171.82 kB
npm run build   (same source, without it)                 → index.js 372.31 kB │ gzip 111.31 kB
```

Measured with `vite build --sourcemap` + a source-size analysis (react-dom dev source: 1,155 kB).
The build now pins `process.env.NODE_ENV` to the Vite mode, so the production bundle can no longer be
poisoned by an env file.

### 🟠 H5 — `.env.local` was never loaded
`.env.example` instructed developers to "use `.env.local` for local development", but no code called
`dotenv`. `GEMINI_API_KEY`/`APP_URL` were demanded by `validateEnvironment()` — which called
`process.exit(1)` in production when they were missing — even though neither variable is used by the
runtime. A deploy could be killed by an unrelated variable.

### 🟡 Medium findings
* **Accessibility:** no modal had `role="dialog"`/`aria-modal` (verified: zero matches across
  `src/`), no Escape-to-close, no focus trap or focus return; toasts had no `aria-live`; validation
  used blocking `alert()`; `PropertyCard`'s whole card was a clickable `<div>` with no keyboard path.
* **Rules of Hooks:** `ContactAgentModal` and `PropertyDetailModal` returned `null` **before** their
  `useState` calls (invalid; React ≤18 throws *"Rendered more hooks than during the previous render"*).
  On the React 19.3 in this repo a jsdom reproduction did not throw, so this is a latent defect
  rather than a live crash — fixed defensively anyway.
* **Performance:** one 615 kB (159 kB gzip) JS chunk containing all 17 modals; 70 property images and
  6 agent avatars hot-linked from `images.unsplash.com` (third-party dependency, no cache control,
  privacy/GDPR consideration); 12 px scrollbar CSS etc.
* **Content/data:** all four Indian "agents" shared one phone/email; FX rates hard-coded in
  `currency.ts` (no rate source or "indicative rate" disclaimer); escrow/KYC/document-wallet screens
  are UI mock-ups with no provider behind them; `SecurityBanner` component was imported but never
  rendered; `console.log` left in client code; GitHub lockfiles ignored while `package.json` had no
  pinned CI.
* **`MortgageCalculatorModal`** kept the previously opened property's price (`initialPriceINR` was
  only read once by `useState`).
* **`window.open(..., '_blank')`** without `noopener` in 2 places (reverse-tabnabbing).

---

## 3. What was changed (all verified)

### Security & trust
| Fix | File(s) |
|---|---|
| `POST /api/deity-image` now requires `x-admin-token` (`ADMIN_API_TOKEN`), rate-limited 30/15 min, MIME allow-list, 5 MB cap; returns 503 when unconfigured | `server.ts` |
| Owner PIN verified **server-side** against `BROKER_PIN_HASH` (sha256, preferred) or `BROKER_PIN`; fails closed when unset; 8 attempts/15 min | `server.ts`, `AuthAndUserAccountModal.tsx`, `AddPropertyModal.tsx` |
| OTP issued server-side (HMAC-hashed, 5-min TTL, max 5 attempts, lockout); `devCode` only outside production | `server.ts` |
| Signed, tamper-proof session tokens (HMAC-SHA256, 7-day buyer / 12-hour owner) + `GET /api/auth/session`; tampering verified to return 401 | `server.ts`, `utils/api.ts` |
| KYC is no longer auto-set to "Verified" after a phone OTP | `AuthAndUserAccountModal.tsx` |
| Removed `X-Frame-Options: DENY` (it blocked the preview); added CSP with `frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`, COOP, HSTS in production, `x-powered-by` disabled | `server.ts` |
| Central `trust proxy` handling so rate limits see real client IPs | `server.ts` |
| `noopener,noreferrer` on remaining `window.open` calls | `AuspiciousMuhurthamBanner.tsx`, `MuhurthamDetailsModal.tsx` |
| Overstated claims removed/corrected: "HTTPS 256-Bit SSL" → "HTTPS Encrypted Connection"; "Government Patta & 30-Yr EC Checked" → "Patta & EC Documents Checked Listing-Wise"; "< 15 Mins" → "8 AM – 8 PM IST" | `SecurityBanner.tsx` |
| Per-card "Patta Verified" badge now renders only for verified listings and shows the RERA id when present | `PropertyCard.tsx` |

### Functionality
| Fix | File(s) |
|---|---|
| **Real lead capture**: `POST /api/inquiries` (validated, sanitised, rate-limited 12/15 min) persists to `data/inquiries.jsonl` and optionally forwards to `LEAD_WEBHOOK_URL`; `GET /api/inquiries` is the admin inbox | `server.ts` |
| Contact modal awaits delivery and tells the truth: server-confirmed vs "saved on this device — please WhatsApp" | `ContactAgentModal.tsx`, `App.tsx` |
| Versioned storage layer with automatic migration of the old `terra_*` / `varahi_*_v2` keys; corrupt entries no longer break boot; fake pre-seeded favourites removed | `utils/storage.ts`, `App.tsx` |
| Multi-currency switcher added to the header (INR/USD/AED/GBP/EUR) and cards honour the selected currency | `Header.tsx`, `App.tsx`, `PropertyCard.tsx` |
| Comparison is usable: compare toggle on every card + sticky `CompareBar` with "Compare side by side" and clear-all | `PropertyCard.tsx`, `CompareBar.tsx`, `App.tsx` |
| Mortgage calculator re-syncs when opened for a different property | `MortgageCalculatorModal.tsx` |
| Branding upload UI explains the global-sync token and stores it (`setAdminToken`) | `BrokerContactSettingsModal.tsx` |
| Robots + host-aware sitemap served by the server; favicon SVG, web manifest, branded OG image (`public/brand/og-cover.jpg`), local logo/OG in JSON-LD + `PostalAddress`/telephone | `server.ts`, `index.html`, `public/` |
| Vercel config no longer swallows `/api/*` (filesystem routes first) and `api/index.ts` mounts the same Express app as a serverless function | `vercel.json`, `api/index.ts` |
| `dotenv` actually loads `.env.local` → `.env`; missing config degrades one feature instead of `process.exit(1)` | `server.ts` |
| `PORT` typed as `number` → `npm run lint` passes again | `server.ts` |
| Dev server + `vite preview` accept sandbox/proxy hosts (`allowedHosts`), HMR target overridable | `vite.config.ts`, `server.ts` |
| Default artwork moved to the committed `public/brand/varahi-amma-deity.png`; runtime uploads stay git-ignored; HEAD-probe only accepts real `image/*` responses | `data/deityAsset.ts`, `utils/imageStorage.ts`, `.gitignore` |
| `data/*` git-ignored (enquiry log contains personal data) with `.gitkeep` committed | `.gitignore`, `data/.gitkeep` |

### Quality, accessibility, performance
* `useDialogA11y()` hook applied to **all 17 modals**: `role="dialog"`, `aria-modal="true"`,
  Escape to close, Tab focus trap, focus returned to the trigger, body scroll lock.
* Toasts: `role="status"`, `aria-live="polite"`, distinct error styling, labelled dismiss button.
* Contact form: inline `role="alert"` errors instead of `alert()`; busy/spinner state on submit;
  phone/email format validation (client *and* server).
* `PropertyCard`: keyboard-accessible title button, `aria-pressed` on save/compare, labelled icon
  buttons; footer shows the listing's own agent (name + click-to-call).
* Skip-to-content link, visible focus rings, `aria-hidden` on decorative icons.
* **Bundle:** all 17 modals lazily code-split (chunk sizes 9–74 kB, loaded on first open) plus vendor
  `manualChunks`, and `process.env.NODE_ENV` pinned to the Vite mode.
  Main JS: **615 kB → 372 kB (gzip 159 kB → 111 kB)**; CSS 74 kB (gzip 12.4 kB).
* `ContactAgentModal` / `PropertyDetailModal` split into wrapper + inner components so hooks always
  run in the same order (Rules of Hooks).
* New scripts: `npm run typecheck`, `npm run smoke`, `npm run verify`
  (`scripts/smoke-test.sh`: 16 checks, all passing).

---

## 4. Verification performed

```bash
npm run typecheck     # ✅ 0 errors (was: 1 blocking error)
npm run build         # ✅ vite build + esbuild server bundle
ADMIN_TOKEN=… BROKER_PIN=… bash scripts/smoke-test.sh
                      # ✅ 16/16 passing
```

Live checks against the running server:

| Check | Result |
|---|---|
| `GET /` | `200`, CSP present, **no** `X-Frame-Options` |
| `GET /brand/varahi-amma-deity.png` | `200 image/png` (was HTML fallback) |
| `POST /api/deity-image` anonymous / wrong token | `401` (was `200 success`) |
| `POST /api/deity-image` with token | `200` |
| `POST /api/inquiries` valid / invalid | `201` / `400`; row appended to `data/inquiries.jsonl` |
| `GET /api/inquiries` without token | `401` |
| OTP request → wrong code → correct code | `200` / `401` / signed token |
| `GET /api/auth/session` with tampered token | `401` |
| `POST /api/auth/broker` correct / wrong PIN | `200` / `401` |
| `GET /api/does-not-exist` | `404 JSON` (was the SPA HTML shell) |
| `/robots.txt`, `/sitemap.xml`, `/favicon.svg`, `/site.webmanifest` | real content, correct types |
| Production build served by `node dist/server.cjs` (NODE_ENV=production, PORT=3100) | `200` shell, `200` health, `404 JSON` for unknown API, owner login issues a token |
| Bundle composition (`vite build --sourcemap` source analysis) | no `react-dom.development` in the shipped entry chunk |

Not verifiable here: real-browser rendering (no headless browser in this environment), real SMS
delivery, and Lighthouse/Core Web Vitals numbers.

---

## 4b. Follow-up build (this update): Owner Desk, server listings, photo upload

The first round stopped at "leads reach the server". This round gives the owner the screens to work
with — everything below is implemented and covered by the smoke tests (24/24):

| Added | Detail |
|---|---|
| **Server-side listing store** | `data/properties.json` via `GET/POST/PATCH/DELETE /api/properties`. Publishing is staff-only (owner session or admin token); payloads are normalised and clamped (title/city/price required, enums, array caps, sanitised strings). The bundled demo catalogue stays as a fallback when no API is present. |
| **Photo upload** | `POST /api/uploads` stores owner photos in `data/uploads/`, served at `/uploads/<file>` with `max-age=30d` + `nosniff`. The listing form compresses device photos (max 1600px, JPEG q0.85) in the browser and swaps in the served URL on publish. |
| **Owner Desk (in-app)** | New `OwnerDeskModal`: **Enquiries** tab (buyer name/phone/message/visit date, filters by status, one-tap Call, WhatsApp reply with a pre-filled message, Mark contacted, Close lead) and **Listings** tab (inline price edit, view, delete, publish). Reached from the header when signed in as owner, or from the account modal. |
| **Staff auth** | `requireStaff` accepts the admin token *or* a signed owner session, so the owner never has to paste a token into the browser. Verified: anonymous listing publish → `401`, owner session → `201`. |
| **Lead status tracking** | `PATCH /api/inquiries/:id` marks leads `new → contacted → closed`, so the inbox doubles as a follow-up list. |
| **Anti-regression guard** | The `/api/*` 404 handler is documented as needing to stay *after* every API route (it silently masked the new routes when it was placed first — caught by the smoke test). |

## 5. What should still be added to make this actually effective

### 5.1 Move from browser-only to a real backend (highest business impact)
1. **Property database.** Owner-published listings are now real (server-side JSON store with photo
   upload + CRUD, see §4b), but they live in a file on one instance. Move the same endpoints onto
   Postgres (Neon/Supabase) or MongoDB, push images to S3/Cloudinary, and add draft→published states
   plus multi-user roles.
2. **Real lead delivery *pushed* to you.** Enquiries persist to `data/inquiries.jsonl` and are
   readable in the in-app Owner Desk, and any webhook in `LEAD_WEBHOOK_URL` receives them. Still to
   do: connect that webhook to email (Resend/Postmark) and WhatsApp Business API so a new lead pings
   your phone without opening the site.
3. **Real SMS OTP + real sessions.** Plug MSG91 / Twilio / Gupshup into
   `POST /api/auth/otp/request`; store users in the database with hashed PINs and rotate
   `SESSION_SECRET` via a secrets manager. Add rate-limit persistence (Redis/Upstash) — the current
   limiter is per-instance, so it resets on deploy and does not work across serverless instances.
4. **Document vault with real storage.** `DocumentWalletModal` is a mock. Upload to private object
   storage with signed, expiring URLs, virus scanning, version history and an audit log — Patta /
   Chitta / EC documents are sensitive personal data under India's DPDP Act.
5. **Escrow/payment reality.** The "escrow" tracker shows mock milestones. Integrate a licensed
   escrow/bank partner (or Razorpay/Stripe for tokens) and label un-integrated screens as
   "illustrative" so no one mistakes them for a live ledger.

### 5.2 Trust, legal and compliance (a real-estate brokerage lives on this)
6. **RERA disclosure block**: agent/broker registration number, RERA project IDs per listing, and a
   grievance-officer contact. Currently `reraId` exists in the data model but nothing enforces it.
7. **Legal pages**: terms of use, refund/cancellation policy, cookie consent banner, DPDP-compliant
   privacy notice with data-retention periods, and a documented "verify before you pay" disclaimer.
8. **Verified-listing workflow**: an internal checklist (EC, Patta/Chitta, survey number, parent
   document chain, encumbrance, litigation) with reviewer + date attached to each badge, so
   "Verified" means something and can be defended.
9. **Fair-practice review of marketing copy** ("zero brokerage", "guaranteed", response-time
   promises) against ASCI/RERA advertising norms.

### 5.3 Product features buyers of land actually need
10. **Map-first search** (Mapbox/Google Maps) with polygon drawing on survey boundaries, road
    frontage and nearby-amenity layers — for land, location beats a card grid.
11. **Saved searches + alerts** (email/WhatsApp when a matching plot is listed), price-per-cent /
    per-acre comparison, and "similar plots nearby".
12. **Site-visit scheduling** with a real calendar (Google Calendar/Calendly), confirmation and
    reminder messages, plus owner-side visit assignment.
13. **True multi-language UI (i18n)** — the site has beautiful Tamil/Telugu/Kannada/Hindi content
    strings inside components, but no i18n framework; extract to `react-i18next` with a language
    switcher (huge for the Hosur/Krishnagiri NRI + local buyer mix).
14. **Document checklist generator** per property (what to verify, what to bring to the SRO) and a
    downloadable PDF brochure instead of a hot-linked image set.
15. **EMI/eligibility with bank partners**, stamp-duty + registration-cost calculator per state, and
    GST treatment notes — Indian buyers expect this on the listing page.

### 5.4 Engineering & operations
16. **CI** (GitHub Actions): `npm ci && npm run typecheck && npm run build && npm run smoke` on every
    PR; commit `package-lock.json` (it is currently git-ignored — only `bun.lock` is tracked).
17. **Tests**: Vitest + React Testing Library for units (`currency`, `areaUnits`, `panchangam`,
    `storage`), Playwright for the critical flows (search → detail → enquiry; login; publish).
18. **Observability**: error tracking (Sentry), structured logs with request IDs, uptime checks on
    `/api/health`, and a daily "leads received" digest.
19. **Performance & assets**: self-host property imagery (ImageKit/Cloudinary with `srcset`+AVIF/WebP),
    `content-visibility` for long grids, virtualised listing list at 100+ items, and remove the
    remaining `console.log` calls from client code.
20. **Live FX rates**: replace the hard-coded table in `utils/currency.ts` with a daily rate feed plus
    an "indicative conversion" disclaimer and a date stamp.
21. **PWA**: the manifest exists; add a service worker + offline shell and "install on home screen"
    hint — most traffic for this niche arrives on mobile from WhatsApp shares.
22. **Analytics & conversion**: privacy-friendly analytics (Plausible/Umami), funnel events
    (search → filter → detail → WhatsApp/call → enquiry) and click-to-call/WhatsApp attribution.

---

## 6. How to run the fixed project

```bash
npm install
cp .env.example .env.local     # set ADMIN_API_TOKEN, BROKER_PIN_HASH, SESSION_SECRET
npm run dev                    # http://localhost:3000
npm run verify                 # typecheck + build + API smoke tests
```

Sandbox defaults already present in `.env.local` (git-ignored): admin token
`sandbox-demo-admin-token`, owner PIN `4821`. Replace both before going live.
