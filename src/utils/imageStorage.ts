// Safe persistent image storage and cross-device synchronization utility
let memoryImageCache: string | null = null;
let isSyncing = false;

const DB_NAME = 'SriVarahiRealEstateDB_v2';
const STORE_NAME = 'site_assets';
const DEITY_IMAGE_KEY = 'varahi_deity_artwork';

function safeGetLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`localStorage save error for ${key}:`, e);
  }
}

function safeRemoveLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`localStorage remove error for ${key}:`, e);
  }
}

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

// Push local image to backend server for global cross-device access
async function syncLocalToServer(dataUrl: string): Promise<void> {
  if (isSyncing) return;
  try {
    isSyncing = true;
    await fetch('/api/deity-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: dataUrl }),
    });
    console.log('[imageStorage] Synchronized deity image to server for global device access');
  } catch (err) {
    console.warn('[imageStorage] Server sync warning (will retry on next load):', err);
  } finally {
    isSyncing = false;
  }
}

// Fetch image from server if missing on current device/browser
async function fetchImageFromServer(): Promise<string | null> {
  try {
    const res = await fetch('/api/deity-image');
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.imageUrl) {
        console.log('[imageStorage] Loaded shared deity image from server');
        return data.imageUrl;
      }
    }
  } catch {
    // ignore
  }

  // Also check direct static /deity.jpg
  try {
    const imgCheck = await fetch('/deity.jpg', { method: 'HEAD' });
    const contentType = imgCheck.headers.get('content-type');
    if (imgCheck.ok && contentType && contentType.includes('image/')) {
      return '/deity.jpg';
    }
  } catch {
    // ignore
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
    safeSetLocalStorage('varahi_custom_deity_art', dataUrlOrBlob);
  }

  try {
    window.dispatchEvent(new CustomEvent('deity-image-updated', { detail: dataUrlOrBlob }));
  } catch {
    // ignore
  }

  // Sync to server so any external browser/device sees it
  syncLocalToServer(dataUrlOrBlob);
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
        // Make sure server has it too
        syncLocalToServer(result);
        return result;
      }
    }
  } catch {
    // ignore
  }

  // 2. Check localStorage
  const local = safeGetLocalStorage('varahi_custom_deity_art');
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
  safeRemoveLocalStorage('varahi_custom_deity_art');
  try {
    window.dispatchEvent(new CustomEvent('deity-image-updated', { detail: null }));
  } catch {
    // ignore
  }
}

// Background auto-sync initialization on startup
if (typeof window !== 'undefined') {
  setTimeout(() => {
    getDeityImage().then((img) => {
      if (img) {
        syncLocalToServer(img);
      } else {
        fetchImageFromServer().then((srvImg) => {
          if (srvImg) {
            memoryImageCache = srvImg;
            window.dispatchEvent(new CustomEvent('deity-image-updated', { detail: srvImg }));
          }
        });
      }
    });
  }, 100);
}
