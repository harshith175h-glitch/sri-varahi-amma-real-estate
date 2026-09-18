#!/usr/bin/env bash
# ============================================================================
# API smoke test — run against a running server (npm run dev / npm start).
#
#   BASE_URL=http://localhost:3000 ADMIN_TOKEN=your-token BROKER_PIN=4821 \
#     bash scripts/smoke-test.sh
#
# Exits non-zero if any check fails, so it can gate CI or a deploy.
# ============================================================================
set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
ADMIN_TOKEN="${ADMIN_TOKEN:-}"
BROKER_PIN="${BROKER_PIN:-}"
PASS=0
FAIL=0

green() { printf '\033[0;32m%s\033[0m\n' "$1"; }
yellow() { printf '\033[1;33m%s\033[0m\n' "$1"; }
red() { printf '\033[0;31m%s\033[0m\n' "$1"; }

# check <name> <expected-status> <curl args...>
check() {
  local name="$1"; shift
  local expected="$1"; shift
  local code
  code=$(curl -s -o /tmp/smoke-body -w '%{http_code}' "$@")
  if [ "$code" = "$expected" ]; then
    green "PASS  [$code] $name"
    PASS=$((PASS + 1))
  else
    red "FAIL  [$code expected $expected] $name"
    head -c 300 /tmp/smoke-body; echo
    FAIL=$((FAIL + 1))
  fi
}

# content-type check: ensures /brand assets are never the SPA fallback HTML
check_type() {
  local name="$1"; shift
  local expected_type="$1"; shift
  local type
  type=$(curl -s -o /dev/null -w '%{content_type}' "$@")
  case "$type" in
    "$expected_type"*) green "PASS  [$type] $name"; PASS=$((PASS + 1)) ;;
    *) red "FAIL  [$type expected ${expected_type}*] $name"; FAIL=$((FAIL + 1)) ;;
  esac
}

echo "Smoke testing ${BASE_URL}"
echo "----------------------------------------------------------------"

check      "health endpoint"            200 "${BASE_URL}/api/health"
check      "home page"                  200 "${BASE_URL}/"
check      "robots.txt"                 200 "${BASE_URL}/robots.txt"
check      "sitemap.xml"                200 "${BASE_URL}/sitemap.xml"
check      "favicon"                    200 "${BASE_URL}/favicon.svg"
check_type "default deity artwork"      "image/png" "${BASE_URL}/brand/varahi-amma-deity.png"
check      "unknown API returns JSON"   404 "${BASE_URL}/api/does-not-exist"
check      "anonymous branding upload is rejected" 401 \
  -X POST "${BASE_URL}/api/deity-image" -H 'Content-Type: application/json' \
  -d '{"imageUrl":"data:image/png;base64,iVBORw0KGgo="}'
check      "lead inbox requires admin" 401 "${BASE_URL}/api/inquiries"
check      "enquiry validation"        400 \
  -X POST "${BASE_URL}/api/inquiries" -H 'Content-Type: application/json' \
  -d '{"userName":"","userPhone":"12"}'
check      "enquiry accepted"          201 \
  -X POST "${BASE_URL}/api/inquiries" -H 'Content-Type: application/json' \
  -d '{"propertyId":"smoke-1","propertyTitle":"Smoke test plot","propertyCity":"Hosur","userName":"Smoke Test","userPhone":"9876543210","userEmail":"smoke@example.com","tourType":"in-person","message":"automated check"}'
check      "otp request"               200 \
  -X POST "${BASE_URL}/api/auth/otp/request" -H 'Content-Type: application/json' \
  -d '{"phone":"9876543210"}'
check      "otp wrong code rejected"   401 \
  -X POST "${BASE_URL}/api/auth/otp/verify" -H 'Content-Type: application/json' \
  -d '{"phone":"9876543210","code":"0000"}'

if [ -n "$ADMIN_TOKEN" ]; then
  check "lead inbox with admin token" 200 -H "x-admin-token: ${ADMIN_TOKEN}" "${BASE_URL}/api/inquiries"
fi

if [ -n "$BROKER_PIN" ]; then
  # The owner login is deliberately rate limited (8 attempts / 15 min), so a
  # repeated local run can hit the guard. Treat that as "skipped", not failed.
  broker_status=$(curl -s -o /tmp/smoke-broker -w '%{http_code}' \
    -X POST "${BASE_URL}/api/auth/broker" -H 'Content-Type: application/json' \
    -d "{\"pin\":\"${BROKER_PIN}\"}")

  if [ "$broker_status" = "429" ]; then
    yellow "SKIP  owner login is rate limited (wait ~15 min or restart the server, then re-run)"
  else
    if [ "$broker_status" = "200" ]; then
      green "PASS  [200] broker login with pin"
      PASS=$((PASS + 1))
    else
      red "FAIL  [$broker_status expected 200] broker login with pin"
      FAIL=$((FAIL + 1))
    fi

    check "broker login with wrong pin" 401 \
      -X POST "${BASE_URL}/api/auth/broker" -H 'Content-Type: application/json' \
      -d '{"pin":"0000"}'
  fi
fi

# ---------------------------------------------------------------------------
# Owner desk: listings, photo upload and lead inbox
# ---------------------------------------------------------------------------
if [ -n "$BROKER_PIN" ]; then
  TOKEN=$(curl -s -X POST "${BASE_URL}/api/auth/broker" -H 'Content-Type: application/json' \
    -d "{\"pin\":\"${BROKER_PIN}\"}" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

  if [ -n "$TOKEN" ]; then
    AUTH="Authorization: Bearer ${TOKEN}"

    check "listing cannot be published anonymously" 401 \
      -X POST "${BASE_URL}/api/properties" -H 'Content-Type: application/json' \
      -d '{"title":"should fail","city":"Hosur","priceINR":100}'

    # NOTE: capture the id from the response so cleanup only removes the row this
    # test created (an earlier version deleted whichever listing came first).
    listing_id=$(curl -s -o /tmp/smoke-listing -w '%{http_code}' \
      -X POST "${BASE_URL}/api/properties" -H 'Content-Type: application/json' -H "$AUTH" \
      -d '{"title":"Smoke Test Plot","city":"Hosur","locality":"Bagalur Road","priceINR":4500000,"propertyType":"plot","listingType":"sale","areaSqFt":4356,"images":["/brand/varahi-amma-deity.png"],"isVerified":true,"isReadyToMove":true}' \
      | sed 's/^/STATUS:/')
    if [ "$listing_id" = "STATUS:201" ]; then
      green "PASS  [201] listing published by owner"
      PASS=$((PASS + 1))
    else
      red "FAIL  [$listing_id expected STATUS:201] listing published by owner"
      FAIL=$((FAIL + 1))
    fi
    listing_id=$(sed -n 's/.*"id":"\(prop-[^"]*\)".*/\1/p' /tmp/smoke-listing)

    check "listing validation rejects missing city" 400 \
      -X POST "${BASE_URL}/api/properties" -H 'Content-Type: application/json' -H "$AUTH" \
      -d '{"title":"No city","priceINR":100}'

    check "public catalogue is readable" 200 "${BASE_URL}/api/properties"

    photo_url=$(curl -s -X POST "${BASE_URL}/api/uploads" -H 'Content-Type: application/json' -H "$AUTH" \
      -d '{"dataUrl":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg=="}' \
      | sed -n 's/.*"url":"\([^"]*\)".*/\1/p')

    if [ -n "$photo_url" ]; then
      check_type "uploaded photo is served" "image/png" "${BASE_URL}${photo_url}"
    else
      red "FAIL  uploaded photo did not return a URL"
      FAIL=$((FAIL + 1))
    fi

    if [ -n "$listing_id" ]; then
      check "owner can edit a listing price" 200 \
        -X PATCH "${BASE_URL}/api/properties/${listing_id}" -H 'Content-Type: application/json' -H "$AUTH" \
        -d '{"priceINR":4750000}'
      check "owner can delete a listing" 200 \
        -X DELETE "${BASE_URL}/api/properties/${listing_id}" -H "$AUTH"
    fi

    check "lead inbox works with an owner session" 200 -H "$AUTH" "${BASE_URL}/api/inquiries"
  else
    red "FAIL  could not obtain an owner session token (check BROKER_PIN)"
    FAIL=$((FAIL + 1))
  fi
fi

echo "----------------------------------------------------------------"
echo "passed: ${PASS}   failed: ${FAIL}"
[ "$FAIL" -eq 0 ] || exit 1
