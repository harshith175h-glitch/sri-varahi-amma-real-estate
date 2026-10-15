#!/usr/bin/env bash
# ============================================================================
# One-command recovery after a fresh clone / sandbox rebuild.
#
#   bash scripts/dev-bootstrap.sh
#
# Restores everything that is git-ignored and therefore NOT in the repository:
#   • node_modules           (npm install)
#   • .env.local             (sandbox demo secrets — replaced, never committed)
#   • data/ demo listings    (via scripts/seed-demo-listings.sh, once running)
#
# Idempotent: safe to run any number of times.
# ============================================================================
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"

echo "🏡 Bootstrapping $(basename "$ROOT")"
echo "-----------------------------------------------------------"

# --- 1. dependencies --------------------------------------------------------
if [ ! -d node_modules ] || [ ! -f node_modules/.package-lock.json ]; then
  echo "📦 Installing dependencies…"
  npm install --no-audit --no-fund 2>&1 | tail -2
else
  echo "📦 Dependencies present — skipping install"
fi

# --- 2. .env.local (contains secrets: never committed) ----------------------
if [ -f .env.local ]; then
  echo "🔐 .env.local already exists — leaving it untouched"
else
  echo "🔐 Creating .env.local with sandbox demo values…"
  cat > .env.local <<'ENVEOF'
# ============================================================================
# LOCAL / SANDBOX CONFIGURATION — never committed (see .gitignore)
# Created by scripts/dev-bootstrap.sh. Re-run that script to regenerate.
# This file and everything in ./data are git-ignored, so they DO NOT survive a
# container rebuild. On a real server keep them on a mounted volume; on Vercel
# set them in Project → Settings → Environment Variables (read-only filesystem).
# ============================================================================

# NODE_ENV is deliberately unset: a value here is inherited by the Vite build
# and would ship React's development build.
APP_URL=http://localhost:3000

# --- Sandbox demo credentials. REPLACE ALL THREE BEFORE GOING PUBLIC. -------
ADMIN_API_TOKEN=sandbox-demo-admin-token
BROKER_PIN=4821
SESSION_SECRET=change-me-in-production-1f8c9b0d4e5a6b7c8d9e0f1a2b3c4d5e

# --- LEAD ALERTS — "ping my phone on a new enquiry" -------------------------
# Any one (or several) of these. See STEP-BY-STEP-PLAN.md Part 1.
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
LEAD_WHATSAPP_TO=
RESEND_API_KEY=
LEAD_NOTIFY_EMAIL=
LEAD_FROM_EMAIL=enquiries@srivarahiammarealestate.com
LEAD_WEBHOOK_URL=

# --- SMS OTP (MSG91) — needs an approved DLT entity/header/template ---------
MSG91_AUTH_KEY=
MSG91_SENDER_ID=
MSG91_OTP_TEMPLATE_ID=
ENVEOF
fi

# --- 3. data directory ------------------------------------------------------
mkdir -p data/uploads
echo "🗂  data/ ready"

# --- 4. restart hint --------------------------------------------------------
echo "-----------------------------------------------------------"
echo "Next: start the server, then seed the demo listings:"
echo ""
echo "  npm run dev                                            # port 3000"
echo "  bash scripts/seed-demo-listings.sh                     # 2 demo listings"
echo "  BROKER_PIN=4821 ADMIN_TOKEN=sandbox-demo-admin-token \\"
echo "    bash scripts/smoke-test.sh                           # 24 checks"
echo ""
echo "✅ Bootstrap complete"
