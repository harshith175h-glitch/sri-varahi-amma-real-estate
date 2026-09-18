import dotenv from "dotenv";
import express, { Request, Response, NextFunction, RequestHandler } from "express";

// Load .env.local first (documented in .env.example) then .env. Previously no
// dotenv call existed at all, so ".env.local for local development" silently
// did nothing and every optional integration looked unconfigured.
dotenv.config({ path: [".env.local", ".env"], quiet: true });
import path from "path";
import fs from "fs";
import fsp from "fs/promises";
import http from "http";
import crypto from "crypto";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const APP_URL = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, "");

// ============================================================================
// SECURITY: Rate Limiting & Input Validation
// ============================================================================

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// Simple in-memory rate limiter (per IP, per bucket)
const requestCounts = new Map<string, RateLimitRecord>();

function rateLimit(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100, bucket: string = "default"): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = (req.ip || req.socket.remoteAddress || "unknown") as string;
    const key = `${bucket}:${ip}`;
    const now = Date.now();
    const record = requestCounts.get(key);

    if (record && now < record.resetTime) {
      if (record.count >= maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        console.warn(`[Rate Limit] ${bucket} limit reached for ${ip} (${record.count}/${maxRequests})`);
        res.setHeader("Retry-After", String(retryAfter));
        res.status(429).json({ error: "Too many requests. Please try again later." });
        return;
      }
      record.count++;
    } else {
      requestCounts.set(key, { count: 1, resetTime: now + windowMs });
    }

    next();
  };
}

// Cleanup expired rate limit records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now >= record.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000).unref?.();

// ============================================================================
// SECURITY: Input Validation Helpers
// ============================================================================

const ALLOWED_IMAGE_MIME = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

function isValidBase64Image(dataUrl: string): boolean {
  if (typeof dataUrl !== "string") return false;
  const match = /^data:([a-z]+\/[a-z0-9.+-]+);base64,/i.exec(dataUrl);
  if (!match) return false;
  if (!ALLOWED_IMAGE_MIME.includes(match[1].toLowerCase())) return false;
  const maxSize = 5 * 1024 * 1024; // 5MB limit
  return Buffer.byteLength(dataUrl, "utf8") <= maxSize;
}

function sanitizeFilePath(filePath: string): boolean {
  // Prevent path traversal attacks
  const normalizedPath = path.normalize(filePath);
  return !normalizedPath.includes("..") && !normalizedPath.startsWith("/");
}

function logSecurityEvent(event: string, details: Record<string, unknown>): void {
  console.log(`[SECURITY] ${event}`, JSON.stringify(details));
}

/** Trim + cap a user supplied string and strip control characters. */
function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, maxLength);
}

function isValidPhone(value: string): boolean {
  const digits = value.replace(/[^0-9]/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function isValidEmail(value: string): boolean {
  if (!value) return true; // email is optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 200;
}

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================
//
// The previous build called process.exit(1) when GEMINI_API_KEY / APP_URL were
// missing — neither is actually used by the runtime, so a deployment could be
// taken down by an unrelated environment variable. Missing configuration now
// degrades a single feature (with a warning) instead of killing the process.

function validateEnvironment(): void {
  const warnings: string[] = [];

  if (!process.env.ADMIN_API_TOKEN) {
    warnings.push(
      "ADMIN_API_TOKEN is not set — branding/logo uploads and the lead inbox are disabled for everyone."
    );
  }
  if (!process.env.BROKER_PIN && !process.env.BROKER_PIN_HASH) {
    warnings.push("BROKER_PIN / BROKER_PIN_HASH is not set — the owner desk and listing publishing are disabled.");
  }
  if (!process.env.SESSION_SECRET) {
    warnings.push("SESSION_SECRET is not set — signing keys will rotate on every restart, invalidating sessions.");
  }
  const hasLeadChannel = Boolean(
    (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) ||
      process.env.WHATSAPP_TOKEN ||
      process.env.RESEND_API_KEY ||
      process.env.LEAD_WEBHOOK_URL
  );
  if (!hasLeadChannel) {
    warnings.push(
      "No lead alert channel configured — enquiries land in the Owner Desk inbox " +
        "(data/inquiries.jsonl) but nothing pings your phone. Set TELEGRAM_BOT_TOKEN + " +
        "TELEGRAM_CHAT_ID, or WHATSAPP_TOKEN, or RESEND_API_KEY + LEAD_NOTIFY_EMAIL, or LEAD_WEBHOOK_URL."
    );
  }
  if (!process.env.APP_URL) {
    warnings.push(`APP_URL is not set — canonical URLs fall back to ${APP_URL}`);
  }

  if (warnings.length > 0) {
    console.warn("⚠️  Configuration warnings:");
    for (const warning of warnings) console.warn(`   • ${warning}`);
  }
}

validateEnvironment();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Correct client IPs (and therefore rate limiting) behind Vercel / proxies.
app.set("trust proxy", process.env.TRUST_PROXY === "false" ? false : 1);
app.disable("x-powered-by");

app.use(express.json({ limit: "6mb" }));

// Security Headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  // NOTE: X-Frame-Options: DENY used to be sent here, which broke embedding the
  // preview in a host frame. frame-ancestors below expresses the same intent
  // without blocking the platform preview / social embeds.
  res.setHeader("Content-Security-Policy", [
    "default-src 'self'",
    "img-src 'self' data: blob: https:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "script-src 'self' 'unsafe-inline'",
    "connect-src 'self' https: ws: wss:",
    "frame-ancestors 'self' https:",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "));
  if (IS_PRODUCTION) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

// Request logging (skip static asset noise in production)
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (!IS_PRODUCTION || req.path.startsWith("/api/")) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// ============================================================================
// FILE SYSTEM SETUP
// ============================================================================

const publicDir = path.join(process.cwd(), "public");
const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
const inquiriesFile = path.join(dataDir, "inquiries.jsonl");
const propertiesFile = path.join(dataDir, "properties.json");
const uploadsDir = path.join(dataDir, "uploads");

if (process.env.VERCEL) {
  console.warn(
    "⚠️  Running on Vercel: the filesystem is read-only — logo uploads and the " +
      "enquiry log will not persist. Point DATA_DIR at a mounted volume or swap " +
      "persistLead() for a database/KV store before relying on it."
  );
}

for (const dir of [publicDir, dataDir, uploadsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory at ${dir}`);
  }
}

const deityFilePath = path.join(publicDir, "deity.jpg");
const deityMetaPath = path.join(publicDir, "deity-image.json");

// In-memory cache for deity image with TTL
let inMemoryDeityDataUrl: string | null = null;
let deityImageCacheTime: number = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Load deity image from disk on startup
function loadDeityImageFromDisk(): void {
  try {
    if (fs.existsSync(deityMetaPath)) {
      const raw = fs.readFileSync(deityMetaPath, "utf-8");
      const parsed = JSON.parse(raw) as { imageUrl: string; updatedAt: string; version: number };
      if (parsed.imageUrl && isValidBase64Image(parsed.imageUrl)) {
        inMemoryDeityDataUrl = parsed.imageUrl;
        deityImageCacheTime = Date.now();
        console.log("✅ Loaded deity image metadata from disk");
      }
    } else if (fs.existsSync(deityFilePath)) {
      const buffer = fs.readFileSync(deityFilePath);
      inMemoryDeityDataUrl = `data:image/jpeg;base64,${buffer.toString("base64")}`;
      deityImageCacheTime = Date.now();
      console.log("✅ Loaded deity image from disk");
    }
  } catch (err) {
    console.error("⚠️  Failed to load initial deity image:", err);
  }
}

loadDeityImageFromDisk();

// ============================================================================
// ADMIN AUTH + SESSION TOKENS
// ============================================================================

function timingSafeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Returns true when the caller presented the correct admin token. */
function isAdminRequest(req: Request): boolean {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) return false; // no token configured → nobody can write
  const provided = String(req.header("x-admin-token") || "");
  if (!provided) return false;
  return timingSafeEquals(provided, expected);
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!process.env.ADMIN_API_TOKEN) {
    res.status(503).json({
      error: "Admin API is not configured on this deployment (set ADMIN_API_TOKEN).",
    });
    return;
  }
  if (!isAdminRequest(req)) {
    logSecurityEvent("ADMIN_AUTH_FAILED", { ip: req.ip, path: req.path });
    res.status(401).json({ error: "Unauthorised. A valid admin token is required." });
    return;
  }
  next();
}

/**
 * Staff = the admin token (server-to-server / owner bootstrap) or a signed
 * session token issued by POST /api/auth/broker (role "agent"). This lets the
 * owner use the in-browser Owner Desk without pasting the raw admin token.
 */
function getSessionFromRequest(req: Request): SessionPayload | null {
  const header = String(req.header("authorization") || "");
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  return verifySessionToken(token);
}

function isStaffRequest(req: Request): boolean {
  if (isAdminRequest(req)) return true;
  const session = getSessionFromRequest(req);
  return Boolean(session && (session.role === "agent" || session.role === "vendor" || session.role === "landowner"));
}

function requireStaff(req: Request, res: Response, next: NextFunction): void {
  if (isStaffRequest(req)) {
    next();
    return;
  }
  logSecurityEvent("STAFF_AUTH_FAILED", { ip: req.ip, path: req.path });
  res.status(401).json({ error: "Owner authorisation required. Sign in to the owner desk first." });
}

const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

interface SessionPayload {
  sub: string;
  role: "buyer" | "vendor" | "landowner" | "agent";
  exp: number;
  [key: string]: unknown;
}

function signSession(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verifySessionToken(token: string): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  if (!timingSafeEquals(signature, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as SessionPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Owner PIN verification.
 * Configure BROKER_PIN (plain) for local use, or the safer BROKER_PIN_HASH
 * (sha256 hex, e.g. `printf %s 4821 | sha256sum`) in production.
 */
function verifyBrokerPin(pin: string): boolean {
  const hash = process.env.BROKER_PIN_HASH;
  if (hash) {
    const candidate = crypto.createHash("sha256").update(pin).digest("hex");
    return timingSafeEquals(candidate, hash.toLowerCase());
  }
  const plain = process.env.BROKER_PIN;
  if (plain) return timingSafeEquals(pin, plain);
  return false; // fail closed when nothing is configured
}

// ============================================================================
// OTP STORE (in-memory, single instance)
// ============================================================================

interface OtpRecord {
  hash: string;
  expiresAt: number;
  attempts: number;
  sends: number;
}

const otpStore = new Map<string, OtpRecord>();
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

function hashOtp(phone: string, code: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(`${phone}:${code}`).digest("hex");
}

// ============================================================================
// LEAD PERSISTENCE
// ============================================================================

async function persistLead(lead: Record<string, unknown>): Promise<void> {
  await fsp.appendFile(inquiriesFile, `${JSON.stringify(lead)}\n`, "utf-8");
}

/** Human-readable summary used by every notification channel. */
function formatLeadMessage(lead: Record<string, unknown>): string {
  const lines = [
    "🏡 New enquiry — Sri Varahi Amma Real Estate",
    "",
    `Property: ${lead.propertyTitle || "General enquiry"}${lead.propertyCity ? ` (${lead.propertyCity})` : ""}`,
    lead.propertyPrice ? `Listed at: ${lead.propertyPrice}` : "",
    `Buyer: ${lead.userName}`,
    `Phone: ${lead.userPhone}`,
    lead.userEmail ? `Email: ${lead.userEmail}` : "",
    `Request: ${lead.tourType}`,
    lead.preferredDate ? `Preferred visit: ${lead.preferredDate} ${lead.preferredTime}` : "",
    lead.message ? `Message: ${lead.message}` : "",
    "",
    `Lead id: ${lead.id}`,
  ];
  return lines.filter(Boolean).join("\n");
}

/** POST JSON to any URL with a hard timeout, reporting success. */
async function postJson(
  url: string,
  body: unknown,
  headers: Record<string, string> = {}
): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn(`[Lead] ${url.split("?")[0]} responded ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[Lead] Delivery to ${url.split("?")[0]} failed:`, err);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Telegram — free, instant push notification (easiest way to "ping the phone").
 * Create a bot with @BotFather, send it any message, then read your chat id:
 *   https://api.telegram.org/bot<token>/getUpdates
 */
async function notifyTelegram(lead: Record<string, unknown>): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;
  return postJson(`https://api.telegram.org/bot${token}/sendMessage`, {
    chat_id: chatId,
    text: formatLeadMessage(lead),
    disable_web_page_preview: true,
  });
}

/**
 * WhatsApp Cloud API (Meta, official) — needs a WhatsApp Business number,
 * WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID.
 */
async function notifyWhatsApp(lead: Record<string, unknown>): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.LEAD_WHATSAPP_TO;
  if (!token || !phoneNumberId || !to) return false;
  return postJson(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: formatLeadMessage(lead) },
    },
    { Authorization: `Bearer ${token}` }
  );
}

/** Email via Resend (simple JSON API, generous free tier). */
async function notifyEmail(lead: Record<string, unknown>): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;
  if (!apiKey || !to) return false;
  return postJson(
    "https://api.resend.com/emails",
    {
      from: process.env.LEAD_FROM_EMAIL || "enquiries@srivarahiammarealestate.com",
      to: [to],
      subject: `New enquiry: ${lead.propertyTitle || "General"} — ${lead.userName}`,
      text: formatLeadMessage(lead),
    },
    { Authorization: `Bearer ${apiKey}` }
  );
}

/** Generic webhook — Zapier / Make / n8n / Google Apps Script / CRM. */
async function notifyWebhook(lead: Record<string, unknown>): Promise<boolean> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return false;
  return postJson(url, lead);
}

/**
 * Deliver a lead to every configured channel, in parallel.
 * Returns the channels that accepted it (the inbox file is always one).
 */
async function forwardLead(lead: Record<string, unknown>): Promise<string[]> {
  const deliveredTo: string[] = ["file"];

  const channels: Array<[string, Promise<boolean>]> = [
    ["telegram", notifyTelegram(lead)],
    ["whatsapp", notifyWhatsApp(lead)],
    ["email", notifyEmail(lead)],
    ["webhook", notifyWebhook(lead)],
  ];

  const results = await Promise.allSettled(channels.map(([, promise]) => promise));

  results.forEach((result, index) => {
    const name = channels[index][0];
    if (result.status === "fulfilled" && result.value) deliveredTo.push(name);
  });

  return deliveredTo;
}

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * Health Check Endpoint
 * Used by deployment platforms to verify app is running
 */
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    env: process.env.NODE_ENV || "development",
  });
});

/**
 * GET /api/deity-image
 * Retrieve deity image for cross-device synchronization
 * Response: { imageUrl: "data:image/...", url: "/deity.jpg" }
 */
app.get("/api/deity-image", (_req: Request, res: Response) => {
  try {
    // Check if cache is still valid
    if (inMemoryDeityDataUrl && Date.now() - deityImageCacheTime < CACHE_TTL_MS) {
      res.json({ imageUrl: inMemoryDeityDataUrl, url: "/deity.jpg" });
      return;
    }

    // Cache expired or not loaded, reload from disk
    if (fs.existsSync(deityFilePath)) {
      const buffer = fs.readFileSync(deityFilePath);
      const dataUrl = `data:image/jpeg;base64,${buffer.toString("base64")}`;
      inMemoryDeityDataUrl = dataUrl;
      deityImageCacheTime = Date.now();
      res.json({ imageUrl: dataUrl, url: "/deity.jpg" });
      return;
    }

    // No image found
    res.status(404).json({ imageUrl: null, message: "No deity image uploaded yet" });
  } catch (err) {
    console.error("❌ Error retrieving deity image:", err);
    res.status(500).json({ error: "Failed to retrieve deity image" });
  }
});

/**
 * GET /api/deity-image/raw
 * Serves the uploaded image itself (HEAD friendly) so clients can probe it
 * without fetching a base64 payload.
 */
app.get("/api/deity-image/raw", (_req: Request, res: Response) => {
  if (fs.existsSync(deityFilePath)) {
    res.setHeader("Cache-Control", "public, max-age=300");
    res.type("image/jpeg").sendFile(deityFilePath);
    return;
  }
  res.status(404).json({ error: "No deity image uploaded yet" });
});

/**
 * POST /api/deity-image
 * Upload/sync deity image globally across all devices.
 *
 * SECURITY: this used to be a public write endpoint — any anonymous visitor
 * could replace the site logo/artwork for every device (verified during the
 * audit). It now requires the ADMIN_API_TOKEN alongside strict validation.
 */
app.post(
  "/api/deity-image",
  rateLimit(15 * 60 * 1000, 30, "deity-upload"),
  requireAdmin,
  (req: Request, res: Response): void => {
    try {
      const { imageUrl } = req.body as { imageUrl?: string };

      // Validation: Check imageUrl exists
      if (!imageUrl || typeof imageUrl !== "string") {
        logSecurityEvent("INVALID_DEITY_IMAGE_REQUEST", {
          ip: req.ip,
          reason: "Missing or invalid imageUrl",
        });
        res.status(400).json({ error: "Missing or invalid imageUrl parameter" });
        return;
      }

      // Validation: Check format and size
      if (!isValidBase64Image(imageUrl)) {
        logSecurityEvent("INVALID_DEITY_IMAGE_FORMAT", {
          ip: req.ip,
          reason: "Invalid base64 format or exceeds size limit",
          size: Buffer.byteLength(imageUrl, "utf8"),
        });
        res.status(400).json({
          error: "Invalid image format or exceeds 5MB limit. Use PNG, JPEG or WebP data URLs.",
        });
        return;
      }

      // Update in-memory cache
      inMemoryDeityDataUrl = imageUrl;
      deityImageCacheTime = Date.now();

      // Persist to disk
      try {
        // Save metadata JSON
        fs.writeFileSync(
          deityMetaPath,
          JSON.stringify(
            { imageUrl, updatedAt: new Date().toISOString(), version: 1 },
            null,
            2
          ),
          "utf-8"
        );

        // Extract and save binary image if it's a data URL
        const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/i, "");
        fs.writeFileSync(deityFilePath, Buffer.from(base64Data, "base64"));

        logSecurityEvent("DEITY_IMAGE_UPLOADED", {
          ip: req.ip,
          size: Buffer.byteLength(imageUrl, "utf8"),
          timestamp: new Date().toISOString(),
        });

        res.status(200).json({
          success: true,
          message: "Deity image synchronized globally across all devices",
          timestamp: new Date().toISOString(),
        });
      } catch (diskErr) {
        console.error("❌ Failed to persist deity image to disk:", diskErr);
        logSecurityEvent("DISK_WRITE_ERROR", { error: String(diskErr) });
        res.status(500).json({ error: "Failed to persist image to disk" });
      }
    } catch (err) {
      console.error("❌ Unhandled error in deity-image POST:", err);
      logSecurityEvent("UNHANDLED_ERROR", { endpoint: "/api/deity-image", error: String(err) });
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * POST /api/inquiries
 * Captures a site-visit / callback request from a buyer and stores it for the
 * broker desk. This endpoint did not exist before: the contact form only wrote
 * to the visitor's own localStorage, so no enquiry ever reached the business.
 */
app.post(
  "/api/inquiries",
  rateLimit(15 * 60 * 1000, 12, "inquiry"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const body = (req.body || {}) as Record<string, unknown>;

      const lead = {
        id: `inq-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
        propertyId: cleanText(body.propertyId, 80),
        propertyTitle: cleanText(body.propertyTitle, 200),
        propertyCity: cleanText(body.propertyCity, 80),
        propertyPrice: cleanText(body.propertyPrice, 60),
        agentName: cleanText(body.agentName, 120),
        userName: cleanText(body.userName, 120),
        userEmail: cleanText(body.userEmail, 200),
        userPhone: cleanText(body.userPhone, 32),
        userLanguage: cleanText(body.userLanguage, 40),
        tourType: ["in-person", "video", "phone", "message"].includes(String(body.tourType))
          ? String(body.tourType)
          : "message",
        preferredDate: cleanText(body.preferredDate, 40),
        preferredTime: cleanText(body.preferredTime, 40),
        message: cleanText(body.message, 2000),
        pageUrl: cleanText(body.pageUrl, 500),
        status: "new",
        createdAt: new Date().toISOString(),
        ip: req.ip,
        userAgent: cleanText(req.header("user-agent"), 300),
      };

      const errors: string[] = [];
      if (!lead.userName) errors.push("userName is required");
      if (!isValidPhone(lead.userPhone)) errors.push("a valid phone number is required");
      if (!isValidEmail(lead.userEmail)) errors.push("email address looks invalid");
      if (!lead.propertyId) errors.push("propertyId is required");

      if (errors.length > 0) {
        res.status(400).json({ error: errors.join("; ") });
        return;
      }

      await persistLead(lead);
      const deliveredTo = await forwardLead(lead);

      console.log(`📩 Lead captured: ${lead.id} → ${lead.propertyTitle || lead.propertyId}`);

      res.status(201).json({
        success: true,
        id: lead.id,
        deliveredTo,
        message: "Enquiry received. The broker desk will contact you shortly.",
      });
    } catch (err) {
      console.error("❌ Failed to capture enquiry:", err);
      res.status(500).json({ error: "Could not save your enquiry. Please call or WhatsApp us instead." });
    }
  }
);

/**
 * PATCH /api/inquiries/:id — mark a lead as contacted / closed (owner desk).
 */
app.patch(
  "/api/inquiries/:id",
  rateLimit(15 * 60 * 1000, 120, "inquiry-status"),
  requireStaff,
  async (req: Request, res: Response): Promise<void> => {
    const id = cleanText(req.params.id, 80);
    const requested = cleanText((req.body as { status?: string })?.status, 20);
    const status = ["new", "contacted", "closed"].includes(requested) ? requested : "contacted";

    try {
      if (!fs.existsSync(inquiriesFile)) {
        res.status(404).json({ error: "No enquiries stored yet." });
        return;
      }
      const lines = (await fsp.readFile(inquiriesFile, "utf-8")).split("\n").filter(Boolean);
      let found = false;
      const updated = lines.map((line) => {
        try {
          const lead = JSON.parse(line) as Record<string, unknown>;
          if (lead.id === id) {
            found = true;
            return JSON.stringify({ ...lead, status, statusUpdatedAt: new Date().toISOString() });
          }
          return line;
        } catch {
          return line;
        }
      });
      if (!found) {
        res.status(404).json({ error: "Enquiry not found." });
        return;
      }
      await fsp.writeFile(inquiriesFile, `${updated.join("\n")}\n`, "utf-8");
      res.json({ success: true, id, status });
    } catch (err) {
      console.error("❌ Failed to update enquiry:", err);
      res.status(500).json({ error: "Could not update the enquiry." });
    }
  }
);

/**
 * GET /api/inquiries — broker desk inbox (admin only).
 */
app.get("/api/inquiries", requireStaff, async (_req: Request, res: Response) => {
  try {
    if (!fs.existsSync(inquiriesFile)) {
      res.json({ count: 0, inquiries: [] });
      return;
    }
    const raw = await fsp.readFile(inquiriesFile, "utf-8");
    const lines = raw.split("\n").filter(Boolean);
    const inquiries = lines
      .slice(-200)
      .reverse()
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    res.json({ count: inquiries.length, inquiries });
  } catch (err) {
    console.error("❌ Failed to read enquiries:", err);
    res.status(500).json({ error: "Failed to read enquiries" });
  }
});

/**
 * POST /api/auth/otp/request — start a buyer login.
 * The code is hashed in memory; it is only ever returned in the response body
 * outside production so a developer can test without an SMS provider.
 */
app.post(
  "/api/auth/otp/request",
  rateLimit(10 * 60 * 1000, 5, "otp-request"),
  (req: Request, res: Response): void => {
    const phone = cleanText((req.body as { phone?: string })?.phone, 32);
    if (!isValidPhone(phone)) {
      res.status(400).json({ error: "Enter a valid mobile number (10–15 digits)." });
      return;
    }

    const existing = otpStore.get(phone);
    if (existing && existing.sends >= 5 && Date.now() < existing.expiresAt) {
      res.status(429).json({ error: "Too many codes requested for this number. Please try again later." });
      return;
    }

    const code = crypto.randomInt(1000, 10000).toString();
    otpStore.set(phone, {
      hash: hashOtp(phone, code),
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
      sends: (existing ? existing.sends : 0) + 1,
    });

    // An SMS provider (MSG91 / Twilio / Gupshup) plugs in here. Until one is
    // configured we log the code server-side and never leak it in production.
    console.log(`[OTP] Generated code for ${phone.slice(-4).padStart(phone.length, '*')}`);

    res.status(200).json({
      success: true,
      message: "OTP generated.",
      ...(IS_PRODUCTION ? {} : { devCode: code }),
    });
  }
);

/**
 * POST /api/auth/otp/verify — exchange a valid code for a signed session token.
 */
app.post(
  "/api/auth/otp/verify",
  rateLimit(10 * 60 * 1000, 20, "otp-verify"),
  (req: Request, res: Response): void => {
    const body = (req.body || {}) as { phone?: string; code?: string };
    const phone = cleanText(body.phone, 32);
    const code = cleanText(body.code, 8);

    const record = otpStore.get(phone);
    if (!record) {
      res.status(400).json({ error: "Please request a new code." });
      return;
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone);
      res.status(400).json({ error: "That code has expired. Please request a new one." });
      return;
    }
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      otpStore.delete(phone);
      logSecurityEvent("OTP_LOCKOUT", { ip: req.ip });
      res.status(429).json({ error: "Too many incorrect attempts. Please request a new code." });
      return;
    }
    record.attempts += 1;

    if (!timingSafeEquals(hashOtp(phone, code), record.hash)) {
      res.status(401).json({ error: "Incorrect code." });
      return;
    }

    otpStore.delete(phone);
    const token = signSession({
      sub: phone,
      role: "buyer",
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({ success: true, token, role: "buyer" });
  }
);

/**
 * POST /api/auth/broker — owner/broker desk login with the master PIN.
 * Verified against BROKER_PIN_HASH (preferred) or BROKER_PIN. The old build
 * hard-coded '2026', '1234' and '6383' inside the client bundle.
 */
app.post(
  "/api/auth/broker",
  rateLimit(15 * 60 * 1000, 8, "broker-login"),
  (req: Request, res: Response): void => {
    if (!process.env.BROKER_PIN && !process.env.BROKER_PIN_HASH) {
      res.status(503).json({
        error: "Owner desk is not configured on this deployment (set BROKER_PIN or BROKER_PIN_HASH).",
      });
      return;
    }

    const pin = cleanText((req.body as { pin?: string })?.pin, 12);
    if (!/^[0-9]{4,8}$/.test(pin)) {
      res.status(400).json({ error: "PIN must be 4–8 digits." });
      return;
    }

    if (!verifyBrokerPin(pin)) {
      logSecurityEvent("BROKER_PIN_FAILED", { ip: req.ip });
      res.status(401).json({ error: "Incorrect security PIN." });
      return;
    }

    const token = signSession({
      sub: "broker-desk",
      role: "agent",
      exp: Date.now() + 1000 * 60 * 60 * 12,
    });

    res.status(200).json({
      success: true,
      token,
      role: "agent",
      name: process.env.BROKER_NAME || "Broker Desk",
    });
  }
);

/**
 * GET /api/auth/session — validate the caller's session token.
 */
app.get("/api/auth/session", (req: Request, res: Response) => {
  const header = String(req.header("authorization") || "");
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const session = verifySessionToken(token);
  if (!session) {
    res.status(401).json({ error: "Not signed in." });
    return;
  }
  res.json({ success: true, role: session.role, subject: session.sub });
});


// ============================================================================
// PROPERTY STORE (server-side listings)
// ============================================================================
//
// Listings used to exist only in the visitor's browser: an owner-published plot
// was invisible to everyone else and disappeared on cache clear. Listings are
// now stored on the server and served to every visitor, with the bundled demo
// catalogue only used as a fallback when the deployment has no API.

interface StoredProperty {
  id: string;
  [key: string]: unknown;
}

async function readProperties(): Promise<StoredProperty[]> {
  try {
    const raw = await fsp.readFile(propertiesFile, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredProperty[]) : [];
  } catch {
    return [];
  }
}

async function writeProperties(list: StoredProperty[]): Promise<void> {
  await fsp.writeFile(propertiesFile, JSON.stringify(list, null, 2), "utf-8");
}

const PROPERTY_TYPE_VALUES = ["apartment", "villa", "penthouse", "townhouse", "commercial", "plot"];
const LISTING_TYPE_VALUES = ["sale", "rent"];
const FURNISH_VALUES = ["Furnished", "Semi-Furnished", "Unfurnished"];

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : parseFloat(String(value ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

function asStringArray(value: unknown, max: number, itemMax = 120): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .slice(0, max)
    .map((v) => cleanText(v, itemMax));
}

/**
 * Normalise an untrusted property payload into the shape the client expects.
 * Returns an error string when required fields are missing.
 */
function normaliseProperty(body: Record<string, unknown>, existingId?: string): { property?: StoredProperty; error?: string } {
  const title = cleanText(body.title, 160);
  const city = cleanText(body.city, 80);
  const priceINR = asNumber(body.priceINR, 0);
  const propertyType = PROPERTY_TYPE_VALUES.includes(String(body.propertyType))
    ? String(body.propertyType)
    : "plot";
  const listingType = LISTING_TYPE_VALUES.includes(String(body.listingType))
    ? String(body.listingType)
    : "sale";

  if (!title) return { error: "A listing title is required." };
  if (!city) return { error: "A city is required." };
  if (!(priceINR > 0)) return { error: "A positive price is required." };

  const images = asStringArray(body.images, 10, 1000);
  const amenities = asStringArray(body.amenities, 40, 60);
  const region = body.region === "international" ? "international" : "india";

  const property: StoredProperty = {
    id: existingId || `prop-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
    title,
    tagline: cleanText(body.tagline, 240),
    description: cleanText(body.description, 4000),
    region,
    country: cleanText(body.country, 80) || (region === "india" ? "India" : ""),
    countryCode: cleanText(body.countryCode, 4).toUpperCase() || (region === "india" ? "IN" : ""),
    city,
    stateOrProvince: cleanText(body.stateOrProvince, 80),
    address: cleanText(body.address, 240),
    locality: cleanText(body.locality, 120),
    propertyType,
    listingType,
    priceINR,
    bedrooms: Math.max(0, Math.round(asNumber(body.bedrooms, 0))),
    bathrooms: Math.max(0, Math.round(asNumber(body.bathrooms, 0))),
    areaSqFt: Math.max(0, Math.round(asNumber(body.areaSqFt, 0))),
    yearBuilt: Math.round(asNumber(body.yearBuilt, new Date().getFullYear())),
    furnishedStatus: FURNISH_VALUES.includes(String(body.furnishedStatus))
      ? String(body.furnishedStatus)
      : "Unfurnished",
    parkingSpaces: Math.max(0, Math.round(asNumber(body.parkingSpaces, 0))),
    images: images.length > 0 ? images : ["/brand/varahi-amma-deity.png"],
    amenities,
    isFeatured: Boolean(body.isFeatured),
    isVerified: Boolean(body.isVerified),
    isReadyToMove: Boolean(body.isReadyToMove),
    reraId: cleanText(body.reraId, 60),
    addedDate: cleanText(body.addedDate, 40) || new Date().toISOString().split("T")[0],
    isUserAdded: true,
    agent: (typeof body.agent === "object" && body.agent !== null
      ? (body.agent as Record<string, unknown>)
      : {}) as StoredProperty,
    nearbySpots: Array.isArray(body.nearbySpots) ? (body.nearbySpots as unknown[]).slice(0, 12) : [],
  };

  // Keep the agent block present and filled in so cards never render blanks.
  const agent = property.agent as Record<string, unknown>;
  property.agent = {
    id: cleanText(agent.id, 60) || "agent-1",
    name: cleanText(agent.name, 120) || "Sri Varahi Amma Broker Desk",
    photo: cleanText(agent.photo, 1000) || "/brand/varahi-amma-deity.png",
    phone: cleanText(agent.phone, 32) || "+91 6383040407",
    whatsapp: cleanText(agent.whatsapp, 32) || "+916383040407",
    email: cleanText(agent.email, 160) || "harshith175h@gmail.com",
    agency: cleanText(agent.agency, 160) || "Sri Varahi Amma Real Estate",
    rating: asNumber(agent.rating, 4.9),
    reviewsCount: Math.max(0, Math.round(asNumber(agent.reviewsCount, 0))),
    languages:
      asStringArray(agent.languages, 8, 30).length > 0
        ? asStringArray(agent.languages, 8, 30)
        : ["Tamil", "English"],
    experienceYears: Math.max(0, Math.round(asNumber(agent.experienceYears, 0))),
    verified: true,
    region,
    city,
  };

  return { property };
}

/**
 * POST /api/uploads — attach a device photo to a listing (owner desk only).
 * Body: { dataUrl: "data:image/...;base64,..." }
 * Returns: { url: "/uploads/<file>" }
 */
app.post(
  "/api/uploads",
  rateLimit(15 * 60 * 1000, 60, "upload"),
  requireStaff,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { dataUrl } = (req.body || {}) as { dataUrl?: string };
      if (!dataUrl || !isValidBase64Image(dataUrl)) {
        res.status(400).json({ error: "Send a PNG/JPEG/WebP data URL up to 5 MB." });
        return;
      }
      const mime = /^data:(image\/[a-z0-9.+-]+);base64,/i.exec(dataUrl)?.[1]?.toLowerCase() || "image/jpeg";
      const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
      const base64 = dataUrl.replace(/^data:image\/[a-z0-9.+-]+;base64,/i, "");
      const fileName = `upload-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
      await fsp.writeFile(path.join(uploadsDir, fileName), Buffer.from(base64, "base64"));
      res.status(201).json({ success: true, url: `/uploads/${fileName}`, url_thumb: `/uploads/${fileName}` });
    } catch (err) {
      console.error("❌ Upload failed:", err);
      res.status(500).json({ error: "Could not store the image." });
    }
  }
);

/** GET /api/properties — public catalogue (newest first). */
app.get("/api/properties", async (_req: Request, res: Response) => {
  const list = await readProperties();
  res.setHeader("Cache-Control", "no-store");
  res.json({ count: list.length, properties: list });
});

/** POST /api/properties — publish a listing (owner desk only). */
app.post(
  "/api/properties",
  rateLimit(15 * 60 * 1000, 40, "property-write"),
  requireStaff,
  async (req: Request, res: Response): Promise<void> => {
    const { property, error } = normaliseProperty((req.body || {}) as Record<string, unknown>);
    if (!property) {
      res.status(400).json({ error: error || "Invalid listing." });
      return;
    }
    const list = await readProperties();
    list.unshift(property);
    await writeProperties(list);
    console.log(`🏡 Listing published: ${property.id} — ${property.title}`);
    res.status(201).json({ success: true, property });
  }
);

/** PATCH /api/properties/:id — edit an existing listing (e.g. change the price). */
app.patch(
  "/api/properties/:id",
  rateLimit(15 * 60 * 1000, 60, "property-write"),
  requireStaff,
  async (req: Request, res: Response): Promise<void> => {
    const id = cleanText(req.params.id, 80);
    const list = await readProperties();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Listing not found." });
      return;
    }
    const merged = { ...list[index], ...((req.body || {}) as Record<string, unknown>) };
    const { property, error } = normaliseProperty(merged, id);
    if (!property) {
      res.status(400).json({ error: error || "Invalid listing." });
      return;
    }
    list[index] = property;
    await writeProperties(list);
    res.json({ success: true, property });
  }
);

/** DELETE /api/properties/:id — remove a listing (owner desk only). */
app.delete(
  "/api/properties/:id",
  rateLimit(15 * 60 * 1000, 40, "property-write"),
  requireStaff,
  async (req: Request, res: Response): Promise<void> => {
    const id = cleanText(req.params.id, 80);
    const list = await readProperties();
    const next = list.filter((p) => p.id !== id);
    if (next.length === list.length) {
      res.status(404).json({ error: "Listing not found." });
      return;
    }
    await writeProperties(next);
    console.log(`🗑️  Listing removed: ${id}`);
    res.json({ success: true, removed: id });
  }
);

// Any other /api/* path is a 404 — it must never fall through to the SPA shell
// (Vite/static middleware would happily return index.html with a 200 status).
// NOTE: this must stay *after* every app.get/post("/api/...") route.
app.use("/api", (_req: Request, res: Response) => {
  res.status(404).json({ error: "Unknown API endpoint" });
});

// ============================================================================
// SEO: robots.txt & sitemap.xml (served from the real host, not a 404)
// ============================================================================

app.get("/robots.txt", (req: Request, res: Response) => {
  const host = `${req.protocol}://${req.get("host")}`;
  res.type("text/plain").send(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /api/",
      "",
      `Sitemap: ${host}/sitemap.xml`,
      "",
    ].join("\n")
  );
});

app.get("/sitemap.xml", (req: Request, res: Response) => {
  const host = `${req.protocol}://${req.get("host")}`;
  const today = new Date().toISOString().split("T")[0];
  res.type("application/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `  <url><loc>${host}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n` +
      `</urlset>\n`
  );
});

// ============================================================================
// STATIC FILE SERVING
// ============================================================================

// Property photos uploaded from the owner desk. Served with caching and
// nosniff so a stray HTML payload can never be interpreted as a page.
app.use(
  "/uploads",
  express.static(uploadsDir, {
    maxAge: "30d",
    immutable: true,
    index: false,
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  })
);

app.use(
  express.static(publicDir, {
    setHeaders: (res, filePath) => {
      if (/\.(png|jpe?g|webp|svg|woff2?)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=604800, immutable");
      }
    },
  })
);

// ============================================================================
// VITE & SPA ROUTING
// ============================================================================

async function startServer(): Promise<void> {
  try {
    const httpServer = http.createServer(app);

    if (!IS_PRODUCTION) {
      // Development: Use Vite middleware for SPA serving with HMR.
      //
      // Vite's HMR client (@vite/client) opens a WebSocket back to the dev
      // server. Sandbox/preview hosts serve the app over HTTPS through a proxy,
      // so the browser must be told to reach HMR via a secure WebSocket on that
      // proxy port. Override with HMR_PROTOCOL / HMR_CLIENT_PORT when running
      // plain local development (`npm run dev` on http://localhost:3000).
      const hmrDisabled = process.env.DISABLE_HMR === "true";
      const hmrClientPort = Number(process.env.HMR_CLIENT_PORT) || 443;
      const hmrProtocol = process.env.HMR_PROTOCOL || "wss";
      const { createServer: createViteServer } = await import("vite");

      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          // Accept the sandbox/preview hostnames (Vite otherwise answers 403
          // "Blocked request. This host is not allowed." and the preview never
          // loads). Hosts are still restricted to HTTP requests through this
          // single server entry point.
          allowedHosts: true,
          hmr: hmrDisabled
            ? false
            : {
                server: httpServer,
                protocol: hmrProtocol,
                clientPort: hmrClientPort,
              },
        },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log(`✅ Vite middleware enabled (dev mode, HMR ${hmrDisabled ? "off" : "on"})`);
    } else {
      // Production: Serve pre-built static files
      const distPath = path.join(process.cwd(), "dist");
      if (!fs.existsSync(distPath)) {
        console.warn("⚠️  dist directory not found. Run 'npm run build' first.");
      }
      app.use(
        express.static(distPath, {
          setHeaders: (res, filePath) => {
            if (path.basename(filePath) === "index.html") {
              res.setHeader("Cache-Control", "no-cache");
            } else if (/\.(js|css|png|jpe?g|webp|svg|woff2?)$/i.test(filePath)) {
              res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
            }
          },
        })
      );
      console.log("✅ Serving static files from dist/");
    }

    // SPA fallback: Route all unmatched GET requests to index.html
    app.get("*", (req: Request, res: Response) => {
      if (IS_PRODUCTION) {
        res.sendFile(path.join(process.cwd(), "dist", "index.html"), (err) => {
          if (err) {
            console.error("Error sending index.html:", err);
            res.status(500).send("Internal server error");
          }
        });
      } else {
        // In dev mode, Vite handles this
        res.status(404).type("text/plain").send("Not found");
      }
      void req;
    });

    // Centralised error handler (must be last)
    app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
      console.error("❌ Unhandled request error:", err);
      const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
      res.status(status).json({ error: status === 500 ? "Internal server error" : err.message });
    });

    // Start listening
    const server = httpServer.listen(PORT, "0.0.0.0", () => {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🏡 Sri Varahi Amma Real Estate Server");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🛡️  Rate limiting: Enabled (per-route buckets)`);
      console.log(`🔐 Security headers: Enabled (CSP, nosniff, Referrer-Policy)`);
      console.log(`🔑 Admin token: ${process.env.ADMIN_API_TOKEN ? "✅" : "❌ not configured"}`);
      const leadChannels = [
    process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID ? "Telegram" : null,
    process.env.WHATSAPP_TOKEN ? "WhatsApp" : null,
    process.env.RESEND_API_KEY ? "Email" : null,
    process.env.LEAD_WEBHOOK_URL ? "Webhook" : null,
  ].filter(Boolean);
  console.log(
    `📩 Lead alerts: ${
      leadChannels.length > 0 ? leadChannels.join(" + ") : "⚠️  inbox only (set a channel to be pinged)"
    }`
  );
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      console.log(`${signal} received, shutting down gracefully...`);
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
      // Do not hang forever on keep-alive connections.
      setTimeout(() => process.exit(0), 10000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// Start the HTTP listener when this file is executed directly (npm run dev /
// node dist/server.cjs). On serverless platforms the exported `app` is mounted
// by the platform instead.
if (!process.env.VERCEL) {
  startServer();
}

export default app;
export { app, startServer };

// ============================================================================
// ERROR HANDLING
// ============================================================================

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  logSecurityEvent("UNHANDLED_REJECTION", { reason: String(reason) });
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  logSecurityEvent("UNCAUGHT_EXCEPTION", { error: String(error) });
  process.exit(1);
});
