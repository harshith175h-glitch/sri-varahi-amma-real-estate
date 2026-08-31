import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "30mb" }));

// Ensure public directory exists
const publicDir = path.join(process.cwd(), "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const deityFilePath = path.join(publicDir, "deity.jpg");
const deityMetaPath = path.join(publicDir, "deity-image.json");

// In-memory cache for speed
let inMemoryDeityDataUrl: string | null = null;

// Read on startup if exists
try {
  if (fs.existsSync(deityMetaPath)) {
    const raw = fs.readFileSync(deityMetaPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed.imageUrl) {
      inMemoryDeityDataUrl = parsed.imageUrl;
    }
  } else if (fs.existsSync(deityFilePath)) {
    const buffer = fs.readFileSync(deityFilePath);
    inMemoryDeityDataUrl = `data:image/jpeg;base64,${buffer.toString("base64")}`;
  }
} catch (err) {
  console.error("Failed to load initial deity photo:", err);
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// GET deity image (for cross-device synchronization)
app.get("/api/deity-image", (_req, res) => {
  if (inMemoryDeityDataUrl) {
    res.json({ imageUrl: inMemoryDeityDataUrl, url: "/deity.jpg" });
  } else if (fs.existsSync(deityFilePath)) {
    res.json({ imageUrl: "/deity.jpg", url: "/deity.jpg" });
  } else {
    res.status(404).json({ imageUrl: null });
  }
});

// POST deity image (syncs across all devices & browsers globally)
app.post("/api/deity-image", (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl || typeof imageUrl !== "string") {
    res.status(400).json({ error: "Missing or invalid imageUrl" });
    return;
  }

  inMemoryDeityDataUrl = imageUrl;

  try {
    // Save metadata JSON
    fs.writeFileSync(deityMetaPath, JSON.stringify({ imageUrl, updatedAt: new Date().toISOString() }), "utf-8");

    // Also extract and write binary to public/deity.jpg if it's a data URL
    if (imageUrl.startsWith("data:image/")) {
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
      fs.writeFileSync(deityFilePath, Buffer.from(base64Data, "base64"));
    }

    res.json({ success: true, message: "Deity image synchronized globally across all devices" });
  } catch (err) {
    console.error("Failed to save deity image to disk:", err);
    res.status(500).json({ error: "Failed to persist image" });
  }
});

// Serve static deity files directly
app.use(express.static(publicDir));

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sri Varahi Amma Real Estate server running on http://localhost:${PORT}`);
  });
}

startServer();
