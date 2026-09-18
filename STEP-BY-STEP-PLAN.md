# Step-by-Step Plan — Sri Varahi Amma Real Estate

_Last updated: 18 Sep 2026 · Windows: branch `arena/01a0adf9-sri-varahi-amma-real-estate`_

This answers your five questions first (Parts 1–5), then gives the **ordered plan** (Part 6).
Legend: 👤 = you do it · 🤖 = I do it in the code · ⏱ = realistic time.

---

## Part 1 — "Make new enquiries ping your phone": what that means

Your website has **two different things**, people often mix them up:

| | Owner Desk inbox | Phone alert ("ping") |
|---|---|---|
| What it is | A list inside the website | A message that arrives on your phone |
| How you see it | Open site → Owner Desk → Enquiries tab | Phone buzzes by itself |
| Needs to be configured? | No — **already working today** | Yes — **you must connect one channel** |
| Delay | Whenever you next open the site | Seconds after the buyer submits |
| Where the data lives | `data/inquiries.jsonl` on the server | Telegram / WhatsApp / email / your CRM |

**Right now you have only the first one.** If a buyer fills in the "Book a site visit" form, it is saved and appears in Owner Desk, but nothing notifies you. If you don't open the site for two days, you see the lead two days late. That is the problem "ping your phone" fixes.

There are **four alert channels** wired into the server. Configure any one (or several); they all fire in parallel:

| Channel | Cost | Setup difficulty | Notes |
|---|---|---|---|
| **Telegram** ⭐ | Free | 5 minutes | Best first choice. Instant push notification, no approval, no DLT, no monthly bill. |
| **Email (Resend)** | Free tier (3,000/month) | 15 minutes | Good backup / paper trail. |
| **WhatsApp Cloud API** | Free tier, then paid per conversation | 1–2 days | Official Meta API. Needs a WhatsApp Business number + app review. Best long-term if your customers/you live on WhatsApp. |
| **Generic webhook** | Free – paid | 30 minutes | For Zapier / Make / n8n / Google Sheets / a CRM. Sends the full lead as JSON. |

### How to set up Telegram alerts (do this today — 5 minutes)

1. Install **Telegram** on your phone, open it.
2. In the search bar type **@BotFather** → open it → press **START**.
3. Send `/newbot`. It asks for a name (e.g. `Varahi Leads`) and a username ending in `bot` (e.g. `varahi_leads_bot`).
4. BotFather replies with a **token** like `7654321098:AAH...`. Copy it → this is `TELEGRAM_BOT_TOKEN`.
5. Open **your new bot's** chat (BotFather gives you the link) and send it any message, e.g. `hi`.
6. In a browser open: `https://api.telegram.org/bot<PASTE_TOKEN_HERE>/getUpdates`
7. In the response find `"chat":{"id":123456789,...}` → that number is `TELEGRAM_CHAT_ID`.
8. Put both values into the server environment (see Part 6, step 3). On restart the banner prints
   `📩 Lead alerts: Telegram` — done. From then on every enquiry arrives on your phone in seconds,
   formatted like:

   ```
   🏡 New enquiry — Sri Varahi Amma Real Estate

   Property: Thally Valley 3 Acre Farm Land (Hosur)
   Buyer: Ramesh K
   Phone: 9876543210
   Request: site_visit
   Preferred visit: 2026-09-20 10:00
   Message: Please show the survey sketch.
   ```

🤖 The code for all four channels is **already written and tested** (it ships in this branch). I will only ever need the keys from you — never share them in chat; put them in the server config file.

> ⚠️ **File-safety lesson from today:** `data/inquiries.jsonl`, `data/properties.json` and `.env.local` are git-ignored, so they **do not survive a container rebuild** — and the sandbox was rebuilt today, wiping the saved leads and listings. That is fine for demos (I added `scripts/seed-demo-listings.sh` to restore demo content in one command). But **before you go live, your leads must live somewhere permanent** — a real database + `LEAD_NOTIFY_EMAIL`. Part 6 covers this.

---

## Part 2 — MSG91: choose **SMS** or **OTP**? → Choose **OTP**

In the MSG91 dashboard you will see separate products. For this website, pick the **OTP product** (`SendOTP` / "OTP" service), **not** "Bulk SMS" / "Promotional".

Why:

| | OTP product ✅ | Bulk / Promotional SMS ❌ (for now) |
|---|---|---|
| What it does | Sends one message with a code, on demand | Sends the same message to many numbers |
| What your site needs | Buyer login (mobile + OTP) — **this** | Marketing blasts |
| Cost | ~₹0.12–0.20 per OTP | Per-SMS packs, higher per-message marketing rates |
| Approval | Needs DLT (entity + header + OTP template) | Needs DLT **and** promotional consent rules |
| Speed | Verified in seconds | Notifications/transactional only |

**DLT — the thing that actually slows you down.** Indian law requires every A2P (application-to-person) SMS to come from a DLT-registered *entity*, with a registered *sender header* and an approved *template*:

- Entity (company/proprietorship) registration: **3–7 days**
- Sender header (6 chars, e.g. `VARAHI`): **3–10 days per operator**
- OTP template approval: usually 1–2 days after the above
- Some providers can route OTP internationally without DLT (faster), but that has deliverability and grey-route risks — **don't** rely on it for a business login.

So the realistic sequence: **start DLT registration now** (it runs in the background), and keep using the current system until it clears. Today the site already handles this gracefully: without SMS keys the OTP is printed in the server log and returned as `devCode` in development, so logins are testable immediately — the flow never blocks your launch.

**What to copy from MSG91 when DLT is approved** (3 values, put them in server config; the template IDs are in the MSG91 dashboard, not in this doc):

```
MSG91_AUTH_KEY=            # Dashboard → Auth Key
MSG91_SENDER_ID=           # your approved 6-char DLT header, e.g. VARAHI
MSG91_OTP_TEMPLATE_ID=     # the approved OTP template id
```

They are already documented in `.env.example` under "SMS OTP PROVIDER — MSG91". When you have them, I wire them into `POST /api/auth/otp/request` (~30 minutes) and buyers get real OTPs.

**Decision to make in MSG91 today:** buy the OTP plan (small pack is enough to start) → then immediately begin DLT registration inside the same dashboard.

---

## Part 3 — "Compliance pages before advertising" + what a RERA/TNRERA broker is

### 3a. Compliance pages = the 7 legal pages every website that collects buyer data + takes money must publish

Right now the site has **1 of 7** (the Privacy Policy modal). Missing pieces are the ones Google Ads, Meta Ads and Razorpay/payment gateways check first, and the ones Indian law demands:

| # | Page | Why it exists | Legal basis | Status |
|---|---|---|---|---|
| 1 | **Privacy Policy** | What data you collect (name, phone, email, docs), why, how long, who you share with, how to delete | DPDP Act 2023, IT Act 2000 + SPDI Rules 2011 | ✅ exists (needs DPDP review + full legal entity name) |
| 2 | **Terms & Conditions** | The contract with the user: what the site is, account rules, liability limits, dispute city | IT Act §79 intermediary protection, Indian Contract Act | ❌ |
| 3 | **Refund & Cancellation Policy** | If you take any booking/token/advance or paid service fee — refund windows and process | Consumer Protection (E-Commerce) Rules 2020 | ❌ |
| 4 | **Contact + Grievance Officer** | Full legal name, registered address, working phone, and a named Grievance Officer with a response timeline (48 h) | Consumer Protection (E-Commerce) Rules 2020 | ⚠️ partial (chat/phone exist, no officer/address) |
| 5 | **About / Who we are** | Real business identity behind the brand — advertising platforms require it | Google/Meta ad policy | ❌ |
| 6 | **Property Disclaimer** | "Listings, prices and measurements are indicative; verify title/approvals before paying" — protects you from claims | IT Rules 2021 + RERA advertising rules | ❌ |
| 7 | **Cookie / consent notice** | You already use local storage + analytics; a short consent banner is the clean pattern | DPDP Act 2023 | ❌ |

Also mandatory and easy to forget: **your TNRERA agent registration number on every advertisement** — website header/footer, each listing page, signboards, WhatsApp status/handbills, agreements, letterheads, visiting cards.

An important precedent: a Chennai builder was fined **₹20 lakh total for a single advertisement missing the RERA registration number**. Missing pages are paperwork; a missing registration number is money.

🤖 I can write all 6 missing pages (as content, in your site's design) in one sitting. You then only need a **lawyer/CA to read them once** (~₹2–5k) before publishing. They are not legal advice until someone qualified signs off.

### 3b. What a RERA / TNRERA broker (real estate agent) is

**RERA** = the Real Estate (Regulation and Development) Act, 2016 — the national law that regulates property dealing in India. In Tamil Nadu it is implemented by **TNRERA** (Tamil Nadu Real Estate Regulatory Authority), based in Chennai, portal: `tnrera.tn.gov.in`.

Two completely different registrations exist under TNRERA — don't confuse them:

| | **Promoter / project registration** | **Agent (broker) registration** ← **your case** |
|---|---|---|
| Who | Builder / land owner launching a project | Broker, agency, marketing firm that *sells or buys* property for a commission |
| When | Before advertising or selling the project | **Before earning any commission or advertising any listing** |
| Trigger | Land > 500 sq.m **or** ≥ 8 units | Applies to **every** agent, no size threshold |
| Fee | ₹5–25 per sq.m of FSI / plotted area | **₹25,000 (individual)** / ₹50,000 (firm, company, partnership) |
| Validity | 5 years | **5 years**, renewal ₹5,000 (individual) / ₹50,000 (other), apply in Form J at least 30–90 days before expiry |
| Forms | A–D | Apply **Form G**, certificate **Form H**, renewal **Form J** |

**What you need to apply (individual agent):** PAN card, Aadhaar, photograph, address proof (home **and** office), business-identity proof (proprietorship declaration / firm deed / MOA-AOA), ITR for the last 3 years, bank details. TNRERA reviews in about **30 days** and issues a certificate with a unique TN registration number.

**Penalties if you operate without it** (in force, and graded from 1 July 2026): ₹50,000–₹5,00,000 fine, plus suspension or cancellation of the licence, and the agent cannot legally recover commission. Major violations ₹2–5 lakh; minor up to ₹1 lakh.

**What changes for the website once you have the number:** every listing page shows your agent registration number in the "Verified & Registered" block (the field is already built into the data model as `reraId` and displayed on listing cards/details). It is also the fastest trust signal on the page — buyers verify brokers in seconds.

**Order matters here:** TNRERA agent registration is a **prerequisite** for advertising. Do it in parallel with DLT in Part 2 — both are waiting-on-a-government-portal tasks, not work tasks.

---

## Part 4 — Republishing the plots with your own photos and catalog

You said you will upload the catalogs and your real photos. Yes — that is exactly what the Owner Desk is for, and it works today.

### The click path (per property, ~3 minutes)

1. Open the site → click **Owner Desk** (top-right black button) → enter your PIN (**4821** in this sandbox; we will change it before going live).
2. **Listings** tab → you will see the two demo listings (Thally Valley, Bagalur Road). These are placeholders — delete them once your real ones are up (trash icon → confirm).
3. Click **Publish new** → fill the form:
   - Title, city, locality, price (**required**), property type, area, bedrooms/bathrooms, description
   - **Photos:** click the upload area → pick your real photos from the phone/computer. They are compressed in the browser (max 1600 px, JPEG) and stored on the server, served from `/uploads/…`. You can add up to 12 per property; the first one is the cover.
   - Optional: `reraId` → put the **project's** RERA number here when the builder gives it, or your **agent** registration number for resale plots.
4. **Publish** → it goes live immediately for every visitor (server-side storage, not "only on my device").
5. Later edits: **Owner Desk → Listings → pencil icon** (quick price edit), or delete and republish if you want to change the whole listing. Photo swap on an existing listing = delete + republish today; a full "edit everything" screen is on the roadmap (Part 6, Phase C).

### Photo guidance (so listings look professional, not like phone dumps)

- **6–10 photos per property**, this order: wide cover shot (front/gate/land corner) → road approach → boundaries (all four corners for land) → water source (borewell/well) → documents on a table (patta, EC — blur the numbers) → surroundings/landmark.
- **Land plots:** shoot in the morning, from chest height, in **landscape** orientation. Walk the boundary and photograph each corner so the buyer sees the shape.
- Fix nothing with filters — buyers trust plain daylight photos.
- **Do not** use photos from other property sites or handbills. Copyright strikes and "this is not the actual plot" complaints are the fastest way to lose a buyer's trust and break your ad account.
- If your catalog is a PDF/printed sheet: photograph it flat, good light, or send me the PDF and I will extract the text into draft listings for you.

🤖 What I do: nothing blocking — you can start uploading today. If you'd rather send me the catalog + photos (a folder in the workspace, or zipped), I will pre-fill all listings for you, you only review and hit Publish.

---

## Part 5 — Map search (approved ✅)

You approved this. Here is what "map search" will actually be:

1. **Map view toggle** on the catalogue page: List ⇄ Map.
2. Pins for every listing; clicking a pin opens a mini-card (photo, price, area) → "View details".
3. **Search this area** button — pan the map, reload listings for the visible box.
4. **Radius / near-me filter** — "within 5 / 10 / 25 km of my location" and a city dropdown.
5. Cluster pins when zoomed out, so Hosur/Thally/Bagalur don't overlap.
6. Camera on the **listing detail page** showing the plot location + "Get directions" (opens Google Maps).

**Technical choice (recommended):** Leaflet + OpenStreetMap tiles.
- Free, **no API key, no billing account, no credit card** — unlike Google Maps.
- Draws polygons too, so later we can outline plot boundaries.
- Listing data needs two new optional fields, `latitude` / `longitude`. Cheapest way to fill them: paste a **Google Maps share link** into the publish form and the server extracts the coordinates automatically — no typing numbers.

🤖 Size: ~1–2 days of work, then a mobile pass (map must not break the one-thumb layout). It is Phase B in the plan below, after compliance — because a pretty map cannot sell a plot you are not legally allowed to advertise.

---

## Part 6 — The ordered plan

> Rule of thumb: **government-portal tasks first** (they run in the background for days), then **legal pages**, then **your real content**, then **features**. Advertising starts only when the first three are done.

### PHASE A — Foundations (start today; mostly waiting on portals)

| # | Step | Who | Time | Notes |
|---|---|---|---|---|
| 1 | Buy the **MSG91 OTP** plan, then start **DLT registration** (entity → header → OTP template) inside the dashboard | 👤 | 30 min now, 1–2 weeks waiting | Part 2. Nothing else can be done until this is submitted. |
| 2 | Start **TNRERA agent registration** (Form G): PAN, Aadhaar, photos, address proof (home + office), business proof, 3 yrs ITR, bank details, ₹25,000 | 👤 (CA can file) | 1–2 hr prep, ~30 days waiting | Part 3b. Do it **before** any advertising. |
| 3 | Set **Telegram** lead alerts (5 min, per Part 1) — put `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` in server config | 👤 (I guide) | 5 min | 🤖 channel code: **already built & tested** |
| 4 | Change the three sandbox secrets: `ADMIN_API_TOKEN`, `BROKER_PIN` (or `BROKER_PIN_HASH`), `SESSION_SECRET` | 👤 + 🤖 | 15 min | 🤖 I generate strong values and wire them. |
| 5 | Decide the legal entity: proprietorship or private limited, and the **registered address + working phone** to print on the site | 👤 | — | Needed for every compliance page. |

### PHASE B — Legal pages & safe advertising (1 week)

| # | Step | Who | Time | Notes |
|---|---|---|---|---|
| 6 | Write the **6 missing compliance pages** (Terms, Refund & Cancellation, Contact + Grievance Officer, About, Property Disclaimer, Cookie notice) into the design, linked from the footer | 🤖 | half a day | Part 3a. |
| 7 | Review those pages + Privacy Policy with a **lawyer/CA** | 👤 | 2–5 days | ~₹2–5k. They become legal the moment a qualified person signs off. |
| 8 | Add **TNRERA number display** block everywhere it is required once the certificate arrives (site footer, each listing, letterhead/agreements if you print any) | 🤖 | 1 hr | Field `reraId` already exists; I just surface your agent number site-wide. |
| 9 | **Before/after photos + honest copy pass** — replace the demo text (`mockProperties`) with real content: correct distances, real amenities, no "TerraGlobal Escrow" style foreign-plumbing wording | 👤 content / 🤖 wiring | 1 day | Fixes trust and avoids ad-policy rejections. |

### PHASE C — Your real catalog goes live (1 week, can overlap B)

| # | Step | Who | Time | Notes |
|---|---|---|---|---|
| 10 | Upload your real properties (Part 4 click path), delete the 2 demo listings | 👤 | 3 min each | Works today. |
| 11 | **Full "edit listing" screen** (change title, description, photos, amenities without deleting) + drag-to-reorder photos | 🤖 | 1 day | Today only price is editable inline. |
| 12 | **Move listings & leads to a real database + real host** (so a rebuild can never wipe them again — it happened today) | 🤖 | 1–2 days | Postgres/Supabase + object storage for photos; deploy on a paid host with a volume. |
| 13 | **Domain + email**: point `srivarahiammarealestate.com` (or your final domain) at the host, SPF/DKIM for enquiry emails | 👤 domain / 🤖 config | half a day | Needed before ad landing pages. |

### PHASE D — Growth features (after Phase B is signed off)

| # | Step | Who | Time | Notes |
|---|---|---|---|---|
| 14 | **Map search** (Part 5) — Leaflet + OSM, coordinates from pasted Google Maps links | 🤖 | 1–2 days | You approved; free tiles, no API key. |
| 15 | **Real SMS OTP login** with the MSG91 keys once DLT clears | 🤖 | 1 hr | Then buyers log in by phone. |
| 16 | **WhatsApp alerts** (optional upgrade of step 3) if you prefer WhatsApp over Telegram | 👤 keys / 🤖 wire | 1–2 days | Meta business app + number. |
| 17 | **WhatsApp click-to-chat on every listing** (`wa.me/916383040407?text=…`) + shared-shortlink so WhatsApp Status/Instagram traffic converts | 🤖 | 1 day | High-ROI, cheap. |
| 18 | **Seller/owner login** (separate from the buyer PIN) so owners can upload their own plots and you only verify | 🤖 | 3–5 days | Also lets you scale beyond your own listings. |
| 19 | **Auto-post to Facebook/Instagram/Google Business** for each new listing | 🤖 | 2–3 days | Needs Meta app + Google Business profile. |
| 20 | **Analytics**: which listings get views, which source sends buyers (WhatsApp vs Google vs Instagram) | 🤖 | 1 day | Decides where the ad money goes. |
| 21 | **Lead follow-up automation** — auto-WhatsApp to the buyer ("Thanks Ramesh, we'll call in 10 minutes"), reminder to you if a lead stays "new" > 2 h | 🤖 | 2 days | Stops the classic "we lost the lead because we replied late". |

### What NOT to do yet

- Don't run **Google/Meta ads** before steps 6–8: your RERA number must be displayed and the privacy/terms pages must exist, or the ad account gets rejected/limited.
- Don't promise buyers a **"TerraGlobal Escrow"**-style protection you don't actually run (the current demo copy mentions it) — the refund/terms pages must describe what you really do.
- Don't buy **bulk SMS** packs before DLT clears; the money sits idle.

---

### The 5 things you can do today

1. Buy the MSG91 **OTP** plan and start **DLT** registration (background wait = 1–2 weeks).
2. Start **TNRERA agent registration** (₹25,000, ~30 days) — before any advertising.
3. Set up **Telegram alerts** (5 minutes, Part 1) → your phone starts buzzing on every enquiry.
4. Tell me your **entity name + registered address + working phone** so I can write the 6 compliance pages.
5. Start uploading **real photos** into Owner Desk (Part 4) — delete the 2 demo listings as you go.

While you do 1–3, I will do 6 / 11 / 14 (compliance pages, listing editor, map search) in order, and show you a preview after each.
