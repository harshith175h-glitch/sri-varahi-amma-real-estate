# DEPLOYMENT GUIDE - Sri Varahi Amma Real Estate

Complete guide for deploying the application to Vercel and maintaining it in production.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Local Setup](#local-setup)
4. [Building for Production](#building-for-production)
5. [Deploying to Vercel](#deploying-to-vercel)
6. [Environment Configuration](#environment-configuration)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Monitoring & Logging](#monitoring--logging)
9. [Troubleshooting](#troubleshooting)
10. [Rollback Procedure](#rollback-procedure)

---

## Quick Start

```bash
# Clone and setup
git clone https://github.com/harshith175h-glitch/sri-varahi-amma-real-estate.git
cd sri-varahi-amma-real-estate
npm install
cp .env.example .env.local

# Add API keys to .env.local
echo "GEMINI_API_KEY=AIzaSy..." >> .env.local
echo "APP_URL=http://localhost:3000" >> .env.local

# Test locally
npm run dev

# Deploy to Vercel
vercel --prod
```

---

## Prerequisites

### Required Tools

- **Git** (v2.30+)
  ```bash
  git --version  # Should be 2.30 or higher
  ```

- **Node.js** (v18 or v20)
  ```bash
  node --version  # Should be v18.x or v20.x
  npm --version   # Should be v9 or higher
  ```

- **Vercel CLI**
  ```bash
  npm install -g vercel
  vercel --version
  ```

### Required Accounts

1. **GitHub Account**
   - Create free account at https://github.com
   - Add SSH key for authentication

2. **Google Cloud Account**
   - Create free account at https://console.cloud.google.com
   - Generate Gemini API key at https://aistudio.google.com/app/apikeys

3. **Vercel Account**
   - Create free account at https://vercel.com
   - Connect to GitHub

---

## Local Setup

### Step 1: Clone Repository

```bash
# Via HTTPS
git clone https://github.com/harshith175h-glitch/sri-varahi-amma-real-estate.git
cd sri-varahi-amma-real-estate

# Via SSH (recommended)
git clone git@github.com:harshith175h-glitch/sri-varahi-amma-real-estate.git
cd sri-varahi-amma-real-estate
```

### Step 2: Install Dependencies

```bash
# Using npm (recommended)
npm install

# Or using bun (faster)
bun install

# Or using yarn
yarn install
```

**Verify installation:**
```bash
npm ls express react vite typescript
# Should show all packages installed
```

### Step 3: Configure Environment

```bash
# Copy example file
cp .env.example .env.local

# Edit and add your keys
nano .env.local
# or
code .env.local
```

**Required variables:**
```env
GEMINI_API_KEY=AIzaSy...  # From Google Cloud
APP_URL=http://localhost:3000
```

### Step 4: Verify Setup

```bash
# Type checking
npm run lint

# Start dev server
npm run dev

# Should output:
# 🏡 Sri Varahi Amma Real Estate Server
# 🌐 URL: http://localhost:3000
# 🔑 API Key loaded: ✅
```

Visit http://localhost:3000 in your browser.

---

## Building for Production

### Step 1: Local Build Test

```bash
# Clean previous builds
npm run clean

# Build for production
npm run build

# Should generate:
# dist/
# ├── index.html
# ├── assets/
# └── server.cjs
```

**Check build size:**
```bash
du -sh dist/
# Should be < 5MB for optimal Vercel deployment
```

### Step 2: Test Production Build Locally

```bash
# Start production server
npm run start

# Visit http://localhost:3000
# Should load the app without hot reload
```

### Step 3: Type Check

```bash
npm run lint
# Should have 0 errors
```

---

## Deploying to Vercel

### Method 1: GitHub Integration (Recommended)

**Benefits:**
- Auto-deploys on every push
- Preview deployments for PRs
- Easy rollback from UI

**Setup:**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Select "Import Git Repository"
   - Choose your repo
   - Click "Import"

3. **Configure Environment Variables**
   - Project Settings → Environment Variables
   - Add `GEMINI_API_KEY` (mark as Sensitive)
   - Add `APP_URL` (use your Vercel domain)
   - Select "Production" environment
   - Click "Add"

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit deployment URL

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to staging
vercel

# Deploy to production
vercel --prod
```

**First deployment:**
```bash
# Vercel will ask:
# ? Set up and deploy "~/repo"? [Y/n] y
# ? Which scope? (select your account)
# ? Link to existing project? [y/N] N
# ? What's your project's name? sri-varahi-amma-real-estate
# ? In which directory is your code? ./
# ? Want to override the settings above? [y/N] N
```

---

## Environment Configuration

### Vercel Dashboard Setup

1. **Go to Project Settings**
   ```
   https://vercel.com/dashboard → Your Project → Settings
   ```

2. **Add Environment Variables**
   ```
   Environment Variables → Add New
   
   Name: GEMINI_API_KEY
   Value: AIzaSy...
   Environments: Production, Preview, Development
   Save
   
   Name: APP_URL
   Value: https://sri-varahi-amma-real-estate.vercel.app
   Environments: Production
   Save
   ```

3. **Verify Domains**
   ```
   Domains → Add Domain
   - Vercel default: sri-varahi-amma-real-estate.vercel.app ✅
   - Custom domain: yourdomain.com (optional)
   ```

### Production Checklist

- [ ] `GEMINI_API_KEY` set as Sensitive
- [ ] `APP_URL` matches deployment domain
- [ ] Environment variables set for Production
- [ ] HTTPS enabled (automatic)
- [ ] Automatic deployments enabled
- [ ] Preview deployments enabled

---

## Post-Deployment Verification

### Step 1: Health Check

```bash
# Test health endpoint
curl https://sri-varahi-amma-real-estate.vercel.app/api/health

# Response should be:
# {"status":"ok","timestamp":"2026-09-03T..."}
```

### Step 2: API Test

```bash
# Test deity image endpoint
curl https://sri-varahi-amma-real-estate.vercel.app/api/deity-image

# Response should be:
# {"imageUrl":null,"message":"No deity image uploaded yet"}
```

### Step 3: Security Headers

```bash
# Check security headers
curl -I https://sri-varahi-amma-real-estate.vercel.app

# Should include:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=31536000
```

### Step 4: Performance Check

```bash
# Check page load with Lighthouse
# In Chrome DevTools → Lighthouse → Analyze page load

# Target scores:
# Performance: > 80
# Accessibility: > 90
# Best Practices: > 90
# SEO: > 90
```

### Step 5: Browser Test

Visit https://sri-varahi-amma-real-estate.vercel.app
- [ ] Page loads without errors
- [ ] All images load
- [ ] Forms are interactive
- [ ] Navigation works
- [ ] Mobile responsive
- [ ] No console errors (F12)

---

## Monitoring & Logging

### Vercel Logs

```bash
# View real-time logs
vercel logs

# Filter by status code
vercel logs --status 500

# Follow logs (tail)
vercel logs --follow
```

### Common Log Patterns

```
Success:
[2026-09-03T10:47:26Z] GET /api/health 200 2ms

Rate Limit:
[Rate Limit] IP 203.0.113.42 exceeded limit (101/100)

Error:
Unhandled error in deity-image POST: TypeError: Cannot read property 'imageUrl'
```

### Set Up Alerts

**In Vercel Dashboard:**
1. Settings → Integrations → Slack
2. Connect Slack workspace
3. Select notifications:
   - Deployment completed
   - Deployment failed
   - Runtime errors

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module 'express'"**
```bash
# Solution: Install dependencies
npm install
```

**Error: "GEMINI_API_KEY is not set"**
```bash
# Solution 1: Add to .env.local for local builds
echo "GEMINI_API_KEY=AIzaSy..." >> .env.local

# Solution 2: Add to Vercel Environment Variables
# Vercel Settings → Environment Variables → Add
```

**Error: "Build exceeds 50MB"**
```bash
# Solution: Check dist size
du -sh dist/

# Remove unused dependencies
npm list
npm prune

# Check for large files in node_modules
find node_modules -size +5M
```

### Runtime Errors

**Error: "PORT is already in use"**
```bash
# Kill process using port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

**Error: "Cannot read property 'imageUrl' of undefined"**
```bash
# Check request body
# POST /api/deity-image expects: { "imageUrl": "data:image/..." }

# Debug with curl
curl -X POST http://localhost:3000/api/deity-image \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "data:image/jpeg;base64,iVBORw0K..."}'
```

**Error: "EACCES: permission denied" when writing to public/**
```bash
# On Vercel, this is expected (read-only filesystem)
# Use environment variables or Vercel KV storage instead
```

### Performance Issues

**Slow API responses:**
```bash
# Check rate limiting
# Each request limited to 100 per 15 minutes

# Check cache TTL
# Deity image cached for 1 hour

# Increase cache TTL in server.ts:
// const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
// Change to: 3 * 60 * 60 * 1000; // 3 hours
```

**High memory usage:**
```bash
# Monitor with Vercel Analytics
# Settings → Analytics → Memory usage

# Potential causes:
# - Large cached images
# - Memory leak in component
# - Too many concurrent requests

# Solution: Deploy again to restart
vercel deploy --prod
```

---

## Rollback Procedure

### Rollback to Previous Deployment

**Using Vercel Dashboard:**

1. Go to Deployments page
2. Find previous successful deployment
3. Click "..." menu
4. Select "Promote to Production"
5. Confirm action

**Using Vercel CLI:**

```bash
# List recent deployments
vercel ls

# Promote specific deployment
vercel promote <deployment-id>
```

### Rollback Git Changes

If deployment was from bad code:

```bash
# View recent commits
git log --oneline -10

# Revert to previous commit
git revert <commit-hash>
git push origin main

# Vercel will auto-redeploy from new commit
```

### Emergency: Take Down Site

```bash
# Temporarily disable deployment
vercel remove <deployment-id> --yes

# Will show error page until redeployed
```

---

## Maintenance

### Weekly Tasks

- [ ] Check deployment logs
- [ ] Monitor API response times
- [ ] Review error rate
- [ ] Check uptime (99.9% expected)

### Monthly Tasks

- [ ] Update dependencies: `npm update`
- [ ] Security audit: `npm audit`
- [ ] Review Vercel analytics
- [ ] Test all API endpoints
- [ ] Verify backups

### Quarterly Tasks

- [ ] Rotate API keys
- [ ] Review security settings
- [ ] Audit access logs
- [ ] Load testing
- [ ] Disaster recovery drill

---

## Performance Optimization

### Enable Caching

```bash
# Already configured:
# - Deity image cache: 1 hour (server.ts:59)
# - Browser caching via Vercel defaults
```

To adjust:

```typescript
// server.ts
const CACHE_TTL_MS = 60 * 60 * 1000; // Increase from 1 to 3 hours
```

### Enable Compression

Vercel enables gzip compression by default.

Verify with:
```bash
curl -H "Accept-Encoding: gzip" -I \
  https://sri-varahi-amma-real-estate.vercel.app
# Should show: Content-Encoding: gzip
```

### Optimize Images

Already using:
- Vite image optimization
- Tailwind CSS (lightweight)
- Lucide icons (SVG, minimal)

---

## Support & Documentation

- README: `/README.md`
- Security Guide: `/SECURITY.md`
- API Docs: See README.md section
- Issues: https://github.com/harshith175h-glitch/sri-varahi-amma-real-estate/issues

---

## Contact

- Email: support@srivarahiammarealestate.com
- Slack: #deployment-alerts
- On-call: Check Vercel dashboard

---

**Last Updated:** September 3, 2026
**Version:** 1.0
**Maintainers:** Development Team