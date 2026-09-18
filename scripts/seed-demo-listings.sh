#!/usr/bin/env bash
# ============================================================================
# Seed two realistic demo listings through the owner API.
#
#   BASE_URL=http://localhost:3000 BROKER_PIN=4821 bash scripts/seed-demo-listings.sh
#
# Why this exists: listings live in ./data (git-ignored), so they disappear when
# the sandbox/container is rebuilt. Run this to restore demo content instantly.
# It also doubles as documentation of the owner publishing API.
# ============================================================================
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
BROKER_PIN="${BROKER_PIN:-4821}"

echo "Signing in to the owner desk at ${BASE_URL}…"
TOKEN=$(curl -s -X POST "${BASE_URL}/api/auth/broker" \
  -H 'Content-Type: application/json' \
  -d "{\"pin\":\"${BROKER_PIN}\"}" \
  | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))")

if [ -z "${TOKEN}" ]; then
  echo "❌ Could not sign in. Check BROKER_PIN and that the server is running."
  exit 1
fi

publish() {
  local payload="$1"
  local title
  title=$(python3 -c "import json,sys;print(json.loads(sys.argv[1])['title'])" "$payload")
  local code
  code=$(curl -s -o /tmp/seed-listing.json -w '%{http_code}' \
    -X POST "${BASE_URL}/api/properties" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer ${TOKEN}" \
    -d "$payload")
  if [ "$code" = "201" ]; then
    echo "✅ published: ${title}"
  else
    echo "⚠️  ${title} → HTTP ${code}: $(head -c 200 /tmp/seed-listing.json)"
  fi
}

AGENT='{"id":"agent-1","name":"Harshith (Sri Varahi Amma Broker Desk)","phone":"+91 6383040407","whatsapp":"+916383040407","email":"harshith175h@gmail.com","agency":"Sri Varahi Amma Real Estate","rating":4.98,"reviewsCount":220,"experienceYears":12,"verified":true,"languages":["Tamil","English","Kannada"],"region":"india","city":"Hosur"}'

publish "{
  \"title\":\"Bagalur Road 1200 sqft Villa (Fully Built)\",
  \"tagline\":\"Gated villa in a DTCP-approved layout, 2 km from Sipcot Phase 2\",
  \"city\":\"Hosur\",\"locality\":\"Bagalur Road\",\"stateOrProvince\":\"Tamil Nadu\",
  \"country\":\"India\",\"countryCode\":\"IN\",\"region\":\"india\",
  \"propertyType\":\"villa\",\"listingType\":\"sale\",\"priceINR\":12500000,
  \"bedrooms\":4,\"bathrooms\":4,\"areaSqFt\":2400,\"yearBuilt\":2024,
  \"furnishedStatus\":\"Semi-Furnished\",\"parkingSpaces\":2,
  \"images\":[\"https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80\",
             \"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80\"],
  \"description\":\"Ready-to-move 4BHK villa on a 30 ft tar road with panchayat water, underground drainage and a gated compound. Single-owner Patta with 30-year EC available for verification.\",
  \"amenities\":[\"Borewell\",\"Covered Parking\",\"Gated Layout\",\"Rainwater Harvesting\"],
  \"isVerified\":true,\"isReadyToMove\":true,\"isFeatured\":true,\"reraId\":\"TN/DTCP/1188/2024\",
  \"agent\":${AGENT}
}"

publish "{
  \"title\":\"Thally Valley 3 Acre Farm Land\",
  \"tagline\":\"Single-owner Patta land with borewell and tar road frontage\",
  \"city\":\"Hosur\",\"locality\":\"Thally\",\"stateOrProvince\":\"Tamil Nadu\",
  \"country\":\"India\",\"countryCode\":\"IN\",\"region\":\"india\",
  \"propertyType\":\"plot\",\"listingType\":\"sale\",\"priceINR\":8400000,\"areaSqFt\":130680,
  \"images\":[\"/brand/og-cover.jpg\",\"/brand/varahi-amma-deity.png\"],
  \"description\":\"Three-acre agricultural land with clear single-owner Patta, working borewell, compound wall and tar road approach. Survey sketch and 30-year EC ready for lawyer verification.\",
  \"amenities\":[\"Borewell\",\"Tar Road\",\"Compound Wall\",\"Clear Patta\"],
  \"isVerified\":true,\"isReadyToMove\":true,\"reraId\":\"TN/DTCP/1234/2026\",
  \"agent\":${AGENT}
}"

echo ""
echo "Catalogue now served by the API:"
curl -s "${BASE_URL}/api/properties" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"  {data['count']} listing(s)\")
for p in data['properties']:
    print(f\"   • {p['title']} — {p['city']} — ₹{p['priceINR']:,}\")
"
