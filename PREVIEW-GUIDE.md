# How to see the website & what to do next
**Sri Varahi Amma Real Estate — preview guide**
(Technical details of every fix: see [AUDIT-REPORT.md](./AUDIT-REPORT.md))

---

## 1. How to open the website preview

The fixed site is **already running** inside this workspace.

**Option A — inside Arena (easiest)**
Look at the **Live Preview** panel of this chat. The process is named **“Website”**. Click it and the
site opens in a new tab. If the panel is closed, open the preview link shown next to the process.

**Option B — direct link**
```
https://3000-<your-sandbox-id>.e2b.app
```
(That is the address Arena shows for port **3000**. It is the same site.)

**If the page looks blank:**
1. Refresh the tab once (the first load compiles the app).
2. Then inside the page press **Ctrl + Shift + R** (hard refresh) to clear old cached files.
3. Make sure the “Website” process is running (it says `🌐 URL: http://localhost:3000`).

> Note: the website is served from the sandbox, so it is a **private preview**, not the public domain
> yet. The public site is still whatever is deployed at `srivarahiammarealestate.com` — the fixes in
> this branch are not live until you deploy them.

---

## 2. Walkthrough — what to click and what you should see

Do this in order; it exercises every fixed feature.

| # | What to click | What should happen |
|---|---|---|
| 1 | Open the site | Header with your deity logo (it loads now), a **currency selector** in the black top bar (INR / USD / AED / GBP / EUR), the muhurtham banner, then the hero search |
| 2 | In the top bar change currency to **USD** | All prices change to dollars **and stay in USD after you refresh** (this was broken before) |
| 3 | Type `Bagalur` in the search box | The listing grid filters instantly |
| 4 | Click the **heart** on a plot card | It becomes red, header counter increases, and the plot is still saved after you refresh |
| 5 | Click the **scale (compare) icon** on 2–3 cards | A black **Compare tray** appears at the bottom → press **“Compare side by side”** (this feature was completely unreachable before) |
| 6 | Click a **property title** | The full property detail modal opens: photos, land area in Cents/Acres, EMI calculator, documents, escrow tab |
| 7 | Press **Site Visit** | The enquiry form opens. Fill name + 10-digit mobile, send it |
| 8 | Read the green confirmation | It now shows the **real** result: “Inquiry Successfully Dispatched” with a reference number (before, it always claimed success even though nothing was sent) |
| 9 | Click **Sign In** (top right) → *Owner desk* tab | Enter the demo **owner PIN `4821`** to open the listing desk. A wrong PIN is rejected |
| 10 | On the same screen, the **buyer OTP** flow | Request a code; in this preview the code is shown on screen (marked *development code*). Any other 4 digits are rejected — the old “any code works” bug is gone |
| 11 | Press **+ List property**, publish with PIN `4821` | The listing appears at the top of the grid and survives a refresh |
| 12 | **Owner Desk** (the new admin screen) — sign in with the owner PIN `4821`, then press the black **“Owner Desk”** button in the header | Two tabs open: **Enquiries** and **Published listings** |
| 13 | Owner Desk → **Enquiries** tab | Every site-visit request with buyer name, phone, message and visit date — plus one-tap **Call**, **WhatsApp reply** (pre-filled message), **Mark contacted** and **Close lead** |
| 14 | Owner Desk → **Published listings** tab | Plots published to the server: edit the price inline, view, or delete. Press **“Publish a new plot / property”** to add one |
| 15 | Add-property form → **Upload site photos** | Pick photos from your phone/computer; they are compressed in the browser and stored on the server when you publish |
| 16 | Refresh the page and look at the grid | Your published plot appears at the top **for every visitor**, not just in your own browser |
| 17 | Scroll to the footer → **Edit Contact Info** | Upload a new logo; paste the demo admin token `sandbox-demo-admin-token` to publish it for everyone |
| 18 | Footer → **Privacy Policy / Security & Deeds** | Press **Esc** — the modal closes (accessibility fix), and it is no longer possible to get “stuck” inside a dialog |

> Two demo listings are already published in this preview (*Bagalur Road 1200 sqft Villa* and
> *Thally Valley 3 Acre Farm Land*) so you can see exactly how an owner-published plot looks to a
> visitor.

Mobile tip: open the same link on your phone. The layout, sticky compare bar and WhatsApp buttons are
all mobile-first.

---

## 3. Proof that enquiries now actually reach you

Every enquiry is stored **server-side** (not in the visitor's browser) and can be pushed to your
email / WhatsApp / CRM.

While the preview is running, the owner inbox can be read with:

```bash
curl -H "x-admin-token: sandbox-demo-admin-token" http://localhost:3000/api/inquiries
```

Real output from the live demo submission (tagged with a property, phone number and visit date):

```json
{"id":"inq-1789626909861-c3f09b","propertyTitle":"Demo Bagalur Road Plot","propertyCity":"Hosur",
 "userName":"Preview Demo Buyer","userPhone":"9876543210","tourType":"in-person",
 "preferredDate":"2026-09-20","message":"Please arrange a site visit on Sunday"}
```

Leads are appended to `data/inquiries.jsonl` (that folder is git-ignored because it holds personal
data). To also receive them by email or WhatsApp, set `LEAD_WEBHOOK_URL` to a Zapier / Make / n8n /
Google Apps Script webhook in `.env.local`.

---

## 4. Before you go live — 3 things to replace

These demo values are in `.env.local` (never committed). Change them on the real server:

| Variable | Demo value now | What to use in production |
|---|---|---|
| `BROKER_PIN` / `BROKER_PIN_HASH` | `4821` | Your real owner PIN, stored as a **sha256 hash**: `printf %s YOURPIN \| sha256sum` |
| `ADMIN_API_TOKEN` | `sandbox-demo-admin-token` | A long random value: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `SESSION_SECRET` | (demo string) | Another random 32-byte value — keeps logins valid across restarts |

Then deploy. **Important for Vercel:** the API is served by `api/index.ts`; keep that file, and set
the same three variables in *Vercel → Project → Settings → Environment Variables*. If you host it as
a normal Node app instead, run `npm run build && npm start`.

---

## 5. What to do next (in business order, not technical order)

**Step 1 — Try the preview above and tell me what you want changed** (colours, photos, text, layout).

**Step 2 — Get leads delivered to your phone.** Set `LEAD_WEBHOOK_URL` so every enquiry lands in
WhatsApp/email immediately. Until this is done, leads only sit in a file on the server.

**Step 3 — ✅ DONE in this update: Owner Desk with real listings + photo upload.** Publish plots with
your own site photos; they are stored on the server and shown to every visitor (see the walkthrough
above).

**Step 4 — ✅ DONE in this update: the leads inbox is inside the website.** Sign in with the owner PIN
and open **Owner Desk → Enquiries** to read, call and WhatsApp buyers from your phone.

> Still open for Step 2: connect `LEAD_WEBHOOK_URL` so a new enquiry also pings your phone
> automatically (email/WhatsApp). The inbox works without it, but you have to open the site to see
> new leads.

**Step 5 — Legal & trust pages for a real brokerage:** RERA/broker registration number, terms of use,
refund/token-advance policy, cookie notice, and a clear “verify documents before paying” note.

**Step 6 — Real SMS OTP** (MSG91 / Twilio / Gupshup) so buyer login works without showing the code on
screen, plus a database for users and listings instead of the browser.

**Step 7 — Growth features:** map search with survey boundaries, saved-search alerts,
Tamil/Telugu/Kannada/Hindi language switch, PDF brochure download, and WhatsApp Business integration.

---

## 6. “Why were there so many errors?” — short answer

The website was built as a **demo/showcase**: the screens, text and numbers were complete, but the
parts that need a server (sending enquiries, logging in, saving listings, uploading photos) were
pretended in the browser. So the faults were not random bugs — they were three groups:

1. **Fake-backend problems** — enquiry “sent” messages with no sending, owner PIN and OTP checks that
   existed only in the page, uploads that anyone could overwrite. (6 critical)
2. **Glue problems** — the page saved data under one name and read it under another, so your
   shortlist/currency/compare reset on every refresh; two finished features (compare, currency) were
   never connected to any button; the app's icon, robots and sitemap files were missing. (9 high)
3. **Polish problems** — accessibility (keyboard/Esc/focus), one huge 615 kB bundle, hard-coded
   claims like “KYC Verified”, demo data shared by four different “agents”, stale debug logs.
   (10 medium)

All of group 1 and 2 and most of group 3 are now fixed and tested (`npm run typecheck`,
`npm run build`, and 16/16 API smoke checks), and the work is committed on the branch
`arena/01a0adf9-sri-varahi-amma-real-estate`.
