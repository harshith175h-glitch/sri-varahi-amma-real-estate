// Safe persistent image storage and cross-device synchronization utility
import { DEITY_FALLBACK_PATHS } from '../data/deityAsset';
import { readString, writeString, removeKey } from './storage';

let memoryImageCache: string | null = null;
let isSyncing = false;

const DB_NAME = 'SriVarahiRealEstateDB_v2';
const STORE_NAME = 'site_assets';
const DEITY_IMAGE_KEY = 'varahi_deity_artwork';

function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve(null);
        return;
      }
      const request = window.indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        try {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        } catch {
          // ignore
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Push the locally chosen artwork to the backend so other devices see it.
 * The endpoint is admin-protected; when no admin token is configured the
 * request is rejected by the server and we keep the image local-only instead
 * of pretending it was synchronised.
 */
async function syncLocalToServer(dataUrl: string): Promise<void> {
  if (isSyncing) return;
  const adminToken = readString('adminToken', '');
  if (!adminToken) return;

  try {
    isSyncing = true;
    const res = await fetch('/api/deity-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken,
      },
      body: JSON.stringify({ imageUrl: dataUrl }),
    });
    if (!res.ok) {
      console.warn('[imageStorage] Server rejected the upload (HTTP %d)', res.status);
      return;
    }
  } catch (err) {
    console.warn('[imageStorage] Server sync warning (will retry on next load):', err);
  } finally {
    isSyncing = false;
  }
}

// Fetch the server-cached artwork if this device has nothing stored yet.
async function fetchImageFromServer(): Promise<string | null> {
  try {
    const res = await fetch('/api/deity-image');
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.imageUrl) {
        return data.imageUrl;
      }
    }
  } catch {
    // ignore
  }

  // Also check committed brand artwork / previously uploaded static images.
  // A HEAD request is used so we never mistake the SPA fallback HTML for an
  // image (the previous implementation asked for a hard-coded Gemini filename
  // that no longer exists and could return index.html with a 200 status).
  for (const candidate of DEITY_FALLBACK_PATHS) {
    try {
      const res = await fetch(candidate, { method: 'HEAD' });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.startsWith('image/')) {
        return candidate;
      }
    } catch {
      // ignore and try the next candidate
    }
  }

  return null;
}

export async function saveDeityImage(dataUrlOrBlob: string): Promise<void> {
  memoryImageCache = dataUrlOrBlob;

  try {
    const db = await openDB();
    if (db) {
      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.put(dataUrlOrBlob, DEITY_IMAGE_KEY);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }
  } catch {
    // ignore
  }

  if (dataUrlOrBlob.length < 2000000) {
    writeString('deityArt', dataUrlOrBlob);
  }

  try {
    window.dispatchEvent(new CustomEvent('deity-image-updated', { detail: dataUrlOrBlob }));
  } catch {
    // ignore
  }

  // Sync to server so any external browser/device sees it (admin token required)
  await syncLocalToServer(dataUrlOrBlob);
}

export async function getDeityImage(): Promise<string | null> {
  if (memoryImageCache) {
    return memoryImageCache;
  }

  // 1. Check IndexedDB
  try {
    const db = await openDB();
    if (db) {
      const result = await new Promise<string | null>((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(DEITY_IMAGE_KEY);
          req.onsuccess = () => resolve((req.result as string) || null);
          req.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      });
      if (result) {
        memoryImageCache = result;
        syncLocalToServer(result);
        return result;
      }
    }
  } catch {
    // ignore
  }

  // 2. Check localStorage (migrated key)
  const local = readString('deityArt', '');
  if (local) {
    memoryImageCache = local;
    syncLocalToServer(local);
    return local;
  }

  // 3. Check server for cross-device synchronization
  const serverImg = await fetchImageFromServer();
  if (serverImg) {
    memoryImageCache = serverImg;
    try {
      window.dispatchEvent(new CustomEvent('deity-image-updated', { detail: serverImg }));
    } catch {
      // ignore
    }
    return serverImg;
  }

  return null;
}

export async function clearDeityImage(): Promise<void> {
  memoryImageCache = null;
  try {
    const db = await openDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(DEITY_IMAGE_KEY);
    }
  } catch {
    // ignore
  }
  removeKey('deityArt');
  try {
    window.dispatchEvent(new CustomEvent('deity-image-updated', { detail: null }));
  } catch {
    // ignore
  }
}
