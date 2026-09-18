# Owner's Guide — read this first 🙏

Plain-language version of the technical report (`AUDIT-REPORT.md`).
Website: **Sri Varahi Amma Real Estate** · Broker desk: +91 63830 40407

---

## 1. Why were there so many errors in the code?

The website was **built to look finished, not to work**. That is the single root cause of almost
every problem found:

| What it looked like | What was actually happening |
|---|---|
| "Your enquiry has been sent to Harshith" | The message was saved in **the visitor's own browser** and thrown away. You received nothing — not one lead. |
| "Sign in with Mobile OTP", "Owner Security PIN" | The codes and PINs were **written inside the code itself** (`1234`, `2026`, `7890`). Anyone who pressed F12 could log in as the owner. |
| "Patta Verified" badge on every card | A fixed picture on the card — it did not check anything. |
| "Escrow", "Document Wallet", "KYC Verified" | Screens with sample data. No bank, no SMS, no documents behind them. |
| Shortlist ❤️ / Compare / Currency switch | The buttons worked, but the saved data was **lost every time the page refreshed** (the code saved under one name and looked for another). Compare could never open at all. |
| Logo (God image) at the top | The image file was **never uploaded to the project**, so it showed as broken. |
| The whole site in one file | 615 kB of JavaScript loaded before the first screen. |

It is not "bad luck" — it is what happens when a demo/prototype is treated as a live business site.
The good news: the design, layout, wording, Tamil/Telugu/Kannada content and the property data are
genuinely good and worth keeping. The engine underneath needed to be rebuilt, and that is what has
now been done.

---

## 2. The "640 kB" thing — what it means

When a visitor opens your site, their phone must download the JavaScript **before** anything appears.

* **Before:** one file — `615 kB` (about `159 kB` compressed). Everything, including 17 pop-up
  windows that most visitors never open, had to download first.
* **Also before:** a mistake in the settings made the build include React's *development* version
  (the debug version used by programmers) — that alone inflated the file to `643 kB`.
* **Now:** the first load is `372 kB` (`111 kB` compressed) and every pop-up loads only when it is
  actually opened (each is a small 9–74 kB file).

Why it matters in your business: on a 4G phone in Hosur, this is the difference between a page that
appears almost instantly and one that keeps spinning — and slow pages lose enquires. Google also uses
loading speed in search ranking, so faster pages rank better for "plots in Hosur" searches.

I could now focus on it because the fix is measurable: build the site, compare the file sizes, and
confirm the debug version is no longer inside. That check is part of `npm run verify`.

---

## 3. How to see the website (three ways)

**A. Live preview (best — everything clickable)**
In this Arena session there is a **Live Preview** panel next to the chat, showing port **3000**.
It is already running; click it and the real site opens: search, filters, property pop-ups, the
site-visit form, the owner sign-in, WhatsApp buttons — all live.

**B. The rendered snapshot file** — `preview-snapshot.html` in the project folder. It is the actual
page (header, listings, trust strip, footer) saved as one file you can open in any browser, even
without the server running. Note: property photos and fonts load from the internet, so open it where
you have normal browsing. Regenerate it any time with
`npx tsx scripts/render-snapshot.tsx preview-snapshot.html`.

**C. On your own computer**

```bash
npm install
cp .env.example .env.local     # then edit the values (see section 5)
npm run dev                    # open http://localhost:3000
```

---

## 4. What has already been fixed (verified)

* **Enquiries now really arrive.** They are validated, saved safely on the server, and can be pushed
  to email / WhatsApp / CRM. The visitor is told the truth about how it was delivered.
* **Nobody can deface your site.** Only someone with the secret admin token can change the logo /
  artwork (before, any stranger could replace it for every visitor).
* **Real login.** Owner PIN and buyer OTP are checked by the server, not stored in the code. Buyer KYC
  is no longer marked "Verified" just because a phone number was entered.
* **Saved items stay saved** — shortlist, comparisons and price changes survive a refresh.
* **Two dead features now work** — the currency switcher and side-by-side comparison.
* **Search engine basics added** — favicon, robots.txt, sitemap, share-preview image, correct
  business details in structured data (this is what makes Google show your hours and phone number).
* **Accessibility** — every pop-up closes with Escape, keyboard users can reach every button, forms
  show clear inline errors instead of browser alerts.
* **Honest wording** — claims like "256-bit SSL", "response < 15 mins", "KYC Verified" and the
  automatic "Patta Verified" badge have been corrected so they cannot be called misleading.
* **Faster site** — see section 2.
* **Quality gates** — `npm run typecheck`, `npm run build`, `npm run smoke` (24 automatic API tests,
  all passing).
* **You can now run the business from the site itself** — the new **Owner Desk** (black button in the
  header after signing in with your owner PIN) shows every enquiry with one-tap Call / WhatsApp reply,
  and every published listing with inline price editing and delete.
* **Listings are real** — publish a plot from the site with photos from your phone; it is stored on
  the server and shown to every visitor (before, a "published" plot was visible only in your own
  browser and vanished on refresh).

---

## 5. What you must do next (in this order)

1. **Change the demo secrets before going live.** In `.env.local` (never commit it):
   * `ADMIN_API_TOKEN` — long random value; paste the same one into
     *Edit Contact Info → Global sync admin token* on the site.
   * `BROKER_PIN_HASH` — the owner PIN as a sha256 hash (`printf %s 4821 | sha256sum`).
   * `SESSION_SECRET` — long random value.
   The sandbox currently uses demo values (admin token `sandbox-demo-admin-token`, PIN `4821`) —
   fine for testing, **never** for the public site.
2. **Connect lead delivery so a new enquiry pings your phone.** The in-app **Owner Desk → Enquiries**
   tab already lists every lead with one-tap Call / WhatsApp reply, but you still have to open the
   site to notice a new one. Create a webhook (Zapier / Make / n8n / your email tool / WhatsApp API)
   and set `LEAD_WEBHOOK_URL` to get an instant notification.
3. **Add real SMS OTP** (MSG91 / Twilio / Gupshup) — about half a day of work; the hook is already in
   `POST /api/auth/otp/request`.
4. ✅ **Publishing real listings now works** — open **Owner Desk → Published listings → Publish a new
   plot / property**, add your own site photos from your phone, and it appears at the top of the site
   for every visitor. *(Remaining upgrade: move this from a file on the server into a database —
   Supabase / Postgres — when the number of listings grows or you have several staff.)*
5. **Replace the remaining stock photos.** The two demo listings and the built-in catalogue still use
   Unsplash images. They belong to someone else, load slowly and buyers recognise them as generic —
   re-publish your real plots with your own photos (the upload button now stores them on the server).
6. **Publish compliance pages**: RERA / broker registration number, terms of use, refund & token
   policy, privacy policy (DPDP Act) and a "verify documents before paying" note. Show them in the
   footer next to Security Protocol.
7. **Decide the escrow story.** Either partner with a licensed escrow/bank service, or clearly label
   the escrow screens as "illustrative". Do not let buyers think money is protected when it is not.
8. **Nice-to-have, high return:** map-based plot search, saved-search alerts on WhatsApp, a real
   site-visit calendar, full Tamil/Telugu/Kannada/Hindi interface (the text already exists in the
   code), and a stamp-duty / registration-cost calculator.

---

## 6. Useful commands

```bash
npm run dev        # run the site locally (http://localhost:3000)
npm run verify     # typecheck + build + 16 API tests (run before every deploy)
npm run smoke      # API tests only, against a running server
npx tsx scripts/render-snapshot.tsx preview-snapshot.html   # regenerate the static snapshot
```

Questions to ask a developer (yours or otherwise) before the site takes live money or publishes
listings publicly: *"Where do leads go?", "Where are listings stored?", "How is the owner PIN
verified?", "Which parts are still mock-ups?"* — the answers are all in `AUDIT-REPORT.md`, and
nothing should be a surprise after this.
