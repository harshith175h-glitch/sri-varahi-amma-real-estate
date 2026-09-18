/**
 * Canonical, committed brand artwork used as the default deity/logo image.
 *
 * NOTE: `public/deity.png` and `public/deity.jpg` are the runtime *upload*
 * locations and are intentionally git-ignored (.gitignore → public/deity*.png).
 * Never point the default constant at them: on a fresh clone the file does not
 * exist, the SPA fallback answers with HTML, and the header logo renders broken.
 */
export const DEFAULT_DEITY_PHOTO_URL = '/brand/varahi-amma-deity.png';

/** Paths probed at runtime (in order) when no custom artwork is stored. */
export const DEITY_FALLBACK_PATHS = [
  '/api/deity-image/raw',
  '/deity.jpg',
  DEFAULT_DEITY_PHOTO_URL,
] as const;
