# Sri Varahi Amma Real Estate 🏡

A premium real estate platform offering verified plots, DTCP/CMDA approved layouts, clear Patta titles, and daily auspicious Subha Horai timings. Built with React, TypeScript, and Express.

**Live Demo:** https://sri-varahi-amma-real-estate.vercel.app

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running Locally](#running-locally)
- [Building & Deployment](#building--deployment)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Troubleshooting](#troubleshooting)

---

## Features

✨ **Core Features:**
- 🔍 Advanced property search & filtering (price, location, type, amenities)
- 💾 Favorites & comparison tools (up to 4 properties)
- 🏠 Detailed property cards with images & agent info
- 📱 Multi-language support (English, Tamil, Telugu, Kannada, Hindi)
- 💬 WhatsApp & phone integration for agent contact
- 🧮 Mortgage/EMI calculator
- 📚 Document wallet for Patta & deed verification
- 🛡️ Escrow deal tracking & milestone management
- 🙏 Divine entrance with auspicious Muhurtham timings
- 🌍 Multi-currency support (INR, USD, AED, GBP, EUR)
- 📊 Property comparison & detailed analytics
- 🔐 User authentication & KYC workflow

---

## Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite 6.2.3 (build tool)
- Tailwind CSS 4.1.14 (styling)
- Lucide React (icons)
- Motion 12.23.24 (animations)

**Backend:**
- Express 4.21.2 (Node.js server)
- Google Gemini API (AI integration)

**Storage & Deployment:**
- IndexedDB (client-side storage)
- localStorage (persistence)
- Vercel (hosting)

**Development:**
- Bun (package manager)
- TypeScript 5.8.2
- ESBuild (bundling)

---

## Installation

### Prerequisites
- Node.js 18+ or Bun 1.0+
- npm, yarn, or bun package manager

### Clone & Setup

```bash
# Clone the repository
git clone https://github.com/harshith175h-glitch/sri-varahi-amma-real-estate.git
cd sri-varahi-amma-real-estate

# Install dependencies
npm install
# or
bun install

# Copy environment variables
cp .env.example .env.local
```

---

## Environment Setup

### `.env.local` Configuration

```env
# Required: Google Gemini API Key
# Get it from: https://aistudio.google.com/app/apikeys
GEMINI_API_KEY=your_actual_api_key_here

# Required: App URL (for self-referential links, OAuth, webhooks)
# Local: http://localhost:3000
# Production: https://sri-varahi-amma-real-estate.vercel.app
APP_URL=http://localhost:3000
```

### Security Notes ⚠️
- **Never commit `.env.local`** - it's already in `.gitignore`
- Only `.env.example` should be in version control
- Use GitHub Secrets for CI/CD deployments
- Rotate API keys regularly

---

## Running Locally

### Development Mode

```bash
# Start the dev server with HMR (Hot Module Replacement)
npm run dev
# or
bun run dev

# Access the app at: http://localhost:3000
```

The development server includes:
- Vite middleware for fast HMR
- TypeScript compilation
- Express static file serving
- Automatic file watching

### Preview Built App Locally

```bash
# Build for production
npm run build

# Start production server
npm run start

# Access at: http://localhost:3000
```

---

## Building & Deployment

### Local Build

```bash
npm run build
```

This generates:
- `dist/` - Vite-built React app
- `dist/server.cjs` - Bundled Express server

### Deploy to Vercel

#### Option 1: GitHub Integration (Recommended)
1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `GEMINI_API_KEY`
   - `APP_URL`
4. Vercel auto-deploys on every push

#### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Environment Variables in Vercel
1. Go to **Project Settings → Environment Variables**
2. Add:
   - `GEMINI_API_KEY` (secure, not exposed to frontend)
   - `APP_URL` (use Vercel deployment URL)

### Deployment Checklist
- [ ] `.env` is in `.gitignore` ✅ (already configured)
- [ ] `GEMINI_API_KEY` added to Vercel secrets
- [ ] `APP_URL` matches deployment domain
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in production

---

## Project Structure

```
sri-varahi-amma-real-estate/
├── src/
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # React entry point
│   ├── index.css                  # Global styles
│   ├── types.ts                   # TypeScript interfaces
│   ├── components/                # React components
│   │   ├── Header.tsx
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyDetailModal.tsx
│   │   ├── ContactAgentModal.tsx
│   │   ├── AddPropertyModal.tsx
│   │   ├── MortgageCalculatorModal.tsx
│   │   ├── DocumentWalletModal.tsx
│   │   ├── DealEscrowTrackerModal.tsx
│   │   ├── AuthAndUserAccountModal.tsx
│   │   ├── BrokerContactSettingsModal.tsx
│   │   ├── CommunicationProfileModal.tsx
│   │   ├── DivineDarshanModal.tsx
│   │   ├── MuhurthamDetailsModal.tsx
│   │   ├── PlatformGuideModal.tsx
│   │   ├── PrivacyPolicyModal.tsx
│   │   ├── SecurityProtocolModal.tsx
│   │   ├── Toast.tsx
│   │   └── [other components]
│   ├── utils/
│   │   ├── imageStorage.ts        # IndexedDB image caching
│   │   ├── currency.ts            # Currency conversion
│   │   ├── areaUnits.ts           # Area unit conversions
│   │   └── panchangam.ts          # Auspicious timing calculations
│   └── data/
│       ├── mockProperties.ts
│       └── deityAsset.ts
├── public/
│   └── deity.jpg                  # Deity image placeholder
├── server.ts                      # Express backend with security
├── index.html                     # HTML entry point
├── package.json                   # Dependencies
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
├── vercel.json                    # Vercel deployment config
└── .env.example                   # Environment template
```

---

## API Documentation

### Backend Endpoints

#### Health Check
```http
GET /api/health
```
**Response:** `{ "status": "ok", "timestamp": "2026-09-03T..." }`

#### Get Deity Image (Cross-Device Sync)
```http
GET /api/deity-image
```
**Response:**
```json
{
  "imageUrl": "data:image/jpeg;base64,...",
  "url": "/deity.jpg"
}
```

#### Upload Deity Image (Cross-Device Sync)
```http
POST /api/deity-image
Content-Type: application/json

{
  "imageUrl": "data:image/jpeg;base64,..."
}
```
**Response:**
```json
{
  "success": true,
  "message": "Deity image synchronized globally across all devices",
  "timestamp": "2026-09-03T..."
}
```

**Validation:**
- `imageUrl` must be a non-empty string
- Must be valid base64 image format
- Max file size: 5MB
- Rate limited: 100 requests per 15 minutes per IP
- Security logging enabled

---

## Security Features

### ✅ Implemented Security Measures

1. **Rate Limiting** ✅
   - 100 requests per 15 minutes per IP
   - Automatic cleanup of expired limits
   - Prevents spam and abuse

2. **Input Validation** ✅
   - Base64 image format validation
   - File size limit: 5MB
   - Path traversal attack prevention

3. **Security Headers** ✅
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   - `Strict-Transport-Security`

4. **Environment Validation** ✅
   - Checks for required API keys on startup
   - Fails fast in production if keys missing

5. **Error Handling** ✅
   - Proper try-catch blocks
   - Graceful error responses
   - Process-level error handlers

6. **Security Logging** ✅
   - All suspicious events logged
   - IP addresses tracked
   - Timestamps for audit trails

7. **HTTPS/SSL**
   - All production traffic encrypted (256-bit)
   - Vercel provides free SSL certificates
   - HSTS headers enabled

8. **Data Persistence**
   - IndexedDB for large image storage (not localStorage)
   - localStorage for structured data only
   - Cache TTL: 1 hour
   - Automatic cache invalidation

### Security Logging Example

```
[SECURITY] INVALID_DEITY_IMAGE_REQUEST {"ip":"127.0.0.1","reason":"Missing or invalid imageUrl"}
[SECURITY] INVALID_DEITY_IMAGE_FORMAT {"ip":"127.0.0.1","reason":"Invalid base64 format...","size":123456}
[SECURITY] DEITY_IMAGE_UPLOADED {"ip":"127.0.0.1","size":1024000,"timestamp":"2026-09-03T..."}
```

---

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill process using port 3000
lsof -i :3000
kill -9 <PID>
```

### GEMINI_API_KEY Not Working
- ✅ Verify key is in `.env.local` (not `.env`)
- ✅ Key format: starts with `AIzaSy...`
- ✅ Check key permissions in Google Cloud Console
- ✅ Ensure billing is enabled in Google Cloud

### localStorage Quota Exceeded
- Images are now stored in IndexedDB (not localStorage)
- Clear old data: DevTools → Application → Clear Site Data
- Restart the application

### Build Fails with TypeScript Errors
```bash
# Check types without building
npm run lint

# Fix common issues
npx tsc --noEmit
```

### Deity Image Not Syncing Across Devices
- Check browser DevTools → Application → IndexedDB
- Verify `/api/deity-image` endpoint is accessible
- Clear browser cache and restart
- Check server logs for validation errors

### Rate Limit Errors (429)
- You've exceeded 100 requests per 15 minutes
- Wait 15 minutes for limit to reset
- Check IP address in logs if unexpected

### Vercel Deployment Fails
1. Check build logs: `vercel logs`
2. Verify environment variables are set
3. Ensure `npm run build` works locally first
4. Check Node version compatibility

---

## Development Tips

### Code Quality
```bash
npm run lint          # TypeScript type checking
npm run build         # Production build
npm run clean         # Clean build artifacts
```

### Performance Optimization
- React DevTools: Monitor component renders
- Lighthouse: Chrome DevTools → Lighthouse tab
- Network tab: Check API response times

### Component Architecture
For refactoring `App.tsx` (1100+ lines):
- Split into `AppState.tsx` (context/state)
- Create `AppLayout.tsx` (layout wrapper)
- Separate feature modules

---

## What's Fixed in This Version

✅ **Rate Limiting** - Prevents API abuse  
✅ **Input Validation** - Validates base64 images, file size (5MB max)  
✅ **Security Headers** - XSS, Clickjacking, MIME-type protections  
✅ **Environment Validation** - Checks required API keys on startup  
✅ **Error Handling** - Graceful error responses with logging  
✅ **Security Logging** - All suspicious events logged  
✅ **Cache TTL** - 1-hour cache expiry (prevents stale data)  
✅ **Improved .gitignore** - All sensitive files protected  
✅ **Documentation** - Comprehensive README & API docs  

---

## License

Proprietary - Sri Varahi Amma Real Estate

---

## Support

- 📧 Email: support@srivarahiammarealestate.com
- 📱 WhatsApp: [Contact info in Broker Settings]
- 🌐 Website: https://srivarahiammarealestate.com

---

**Made with ❤️ for Indian Real Estate & Auspicious Timings**