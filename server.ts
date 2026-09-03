import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// SECURITY: Rate Limiting & Input Validation
// ============================================================================

// Simple in-memory rate limiter
const requestCounts: Map<string, { count: number; resetTime: number }> = new Map();

function rateLimit(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || "unknown";
    const now = Date.now();
    const record = requestCounts.get(ip);

    if (record && now < record.resetTime) {
      if (record.count >= maxRequests) {
        console.warn(`[Rate Limit] IP ${ip} exceeded limit (${record.count}/${maxRequests})`);
        res.status(429).json({ error: "Too many requests. Please try again later." });
        return;
      }
      record.count++;
    } else {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    }

    next();
  };
}

// Cleanup expired rate limit records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts.entries()) {
    if (now >= record.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// ============================================================================
// SECURITY: Input Validation Helpers
// ============================================================================

function isValidBase64Image(dataUrl: string): boolean {
  if (!dataUrl.startsWith("data:image/")) return false;
  const maxSize = 5 * 1024 * 1024; // 5MB limit
  return Buffer.byteLength(dataUrl, "utf8") <= maxSize;
}

function sanitizeFilePath(filePath: string): boolean {
  // Prevent path traversal attacks
  const normalizedPath = path.normalize(filePath);
  return !normalizedPath.includes("..") && !normalizedPath.startsWith("/");
}

function logSecurityEvent(event: string, details: Record<string, any>) {
  console.log(`[SECURITY] ${event}`, JSON.stringify(details));
}

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

const requiredEnvVars = ["GEMINI_API_KEY", "APP_URL"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0 && process.env.NODE_ENV === "production") {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(", ")}`);
  console.error("Set them in Vercel → Project Settings → Environment Variables");
  process.exit(1);
}

if (missingEnvVars.length > 0) {
  console.warn(`⚠️  Missing environment variables in development: ${missingEnvVars.join(", ")}`);
  console.warn("Set in .env.local for full functionality");
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(express.json({ limit: "30mb" }));

// Security Headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// FILE SYSTEM SETUP
// ============================================================================

const publicDir = path.join(process.cwd(), "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log(`✅ Created public directory at ${publicDir}`);
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
      const parsed = JSON.parse(raw);
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
// API ROUTES
// ============================================================================

/**
 * Health Check Endpoint
 * Used by deployment platforms to verify app is running
 */
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * GET /api/deity-image
 * Retrieve deity image for cross-device synchronization
 * Response: { imageUrl: "data:image/...", url: "/deity.jpg" }
 */
app.get("/api/deity-image", (_req, res) => {
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
 * POST /api/deity-image
 * Upload/sync deity image globally across all devices
 * Body: { imageUrl: "data:image/jpeg;base64,..." }
 *
 * Validation:
 * - imageUrl must be a non-empty string
 * - Must be valid base64 image format
 * - Max file size: 5MB
 * - Rate limited to 100 requests per 15 minutes
 */
app.post("/api/deity-image", rateLimit(15 * 60 * 1000, 100), (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;

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
        error: "Invalid image format or exceeds 5MB limit. Must be data:image/...",
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
      if (imageUrl.startsWith("data:image/")) {
        const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
        fs.writeFileSync(deityFilePath, Buffer.from(base64Data, "base64"));
        console.log(`✅ Deity image saved (${Buffer.byteLength(base64Data, "utf8")} bytes)`);
      }

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
});

// ============================================================================
// STATIC FILE SERVING
// ============================================================================

app.use(express.static(publicDir));

// ============================================================================
// VITE & SPA ROUTING
// ============================================================================

async function startServer() {
  try {
    if (process.env.NODE_ENV !== "production") {
      // Development: Use Vite middleware for HMR
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("✅ Vite middleware enabled (dev mode)");
    } else {
      // Production: Serve pre-built static files
      const distPath = path.join(process.cwd(), "dist");
      if (!fs.existsSync(distPath)) {
        console.warn("⚠️  dist directory not found. Run 'npm run build' first.");
      }
      app.use(express.static(distPath));
      console.log("✅ Serving static files from dist/");
    }

    // SPA fallback: Route all unmatched requests to index.html
    app.get("*", (_req, res) => {
      const indexPath = path.join(process.cwd(), "dist", "index.html");
      if (process.env.NODE_ENV === "production") {
        res.sendFile(indexPath, (err) => {
          if (err) {
            console.error("Error sending index.html:", err);
            res.status(500).send("Internal server error");
          }
        });
      } else {
        // In dev mode, Vite handles this
        res.status(404).send("Not found");
      }
    });

    // Start listening
    app.listen(PORT, "0.0.0.0", () => {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🏡 Sri Varahi Amma Real Estate Server");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔑 API Key loaded: ${process.env.GEMINI_API_KEY ? "✅" : "❌"}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();

// ============================================================================
// ERROR HANDLING
// ============================================================================

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});
