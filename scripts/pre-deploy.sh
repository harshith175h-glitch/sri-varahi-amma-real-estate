#!/bin/bash

# Pre-deployment checks for Sri Varahi Amma Real Estate
# Run this before deploying to production

set -e

echo "================================================================="
echo "Pre-Deployment Verification Script"
echo "================================================================="

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_pass() {
  echo -e "${GREEN}PASS: $1${NC}"
}

check_fail() {
  echo -e "${RED}FAIL: $1${NC}"
  exit 1
}

check_warn() {
  echo -e "${YELLOW}WARN: $1${NC}"
}

echo ""
echo "[1/10] Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
  check_pass "Node.js version"
else
  check_fail "Node.js 18+ required"
fi

echo ""
echo "[2/10] Checking dependencies..."
if [ -d "node_modules" ]; then
  check_pass "Dependencies installed"
else
  check_fail "Run npm install first"
fi

echo ""
echo "[3/10] Checking TypeScript compilation..."
if npm run lint > /dev/null 2>&1; then
  check_pass "No TypeScript errors"
else
  check_fail "TypeScript errors found"
fi

echo ""
echo "[4/10] Building production bundle..."
if npm run build > /dev/null 2>&1; then
  check_pass "Production build successful"
else
  check_fail "Build failed"
fi

echo ""
echo "[5/10] Checking build size..."
BUILD_SIZE=$(du -sh dist/ 2>/dev/null | cut -f1)
echo "  Build size: $BUILD_SIZE"
check_pass "Build size checked"

echo ""
echo "[6/10] Checking Git status..."
if [ -z "$(git status --porcelain)" ]; then
  check_pass "No uncommitted changes"
else
  check_warn "Uncommitted changes detected"
fi

echo ""
echo "[7/10] Checking .gitignore protection..."
if grep -q ".env" .gitignore 2>/dev/null; then
  check_pass ".env files protected"
else
  check_fail ".env files not protected"
fi

echo ""
echo "[8/10] Checking required files..."
if [ -f "package.json" ] && [ -f "server.ts" ] && [ -f "index.html" ]; then
  check_pass "All required files present"
else
  check_fail "Missing required files"
fi

echo ""
echo "[9/10] Checking security headers..."
if grep -q "X-Content-Type-Options" server.ts 2>/dev/null; then
  check_pass "Security headers configured"
else
  check_warn "Security headers not found"
fi

echo ""
echo "[10/10] Checking environment variables..."
if [ -f ".env.local" ]; then
  check_pass "Environment file present"
else
  check_warn ".env.local not found (OK for Vercel)"
fi

echo ""
echo "================================================================="
echo "All checks completed! Ready to deploy"
echo "================================================================="
echo ""
echo "Next steps:"
echo "  1. git push origin main"
echo "  2. vercel --prod (or auto-deploy via GitHub)"
echo "  3. vercel logs (to monitor)"
echo ""
