// ============================================================================
// Safe, versioned localStorage access with automatic legacy-key migration.
//
// Background: the app previously READ from `terra_*_v1` keys but WROTE to
// `varahi_*_v2` keys (and vice-versa), so every refresh silently discarded the
// visitor's shortlist, comparisons, currency choice and user-added listings.
// All persistence now goes through this single module.
// ============================================================================

const STORAGE_PREFIX = 'varahi';

export const STORAGE_KEYS = {
  properties: `${STORAGE_PREFIX}_properties_v3`,
  favorites: `${STORAGE_PREFIX}_favorites_v3`,
  compare: `${STORAGE_PREFIX}_compare_v3`,
  currency: `${STORAGE_PREFIX}_currency_v3`,
  userAccount: `${STORAGE_PREFIX}_user_account_v3`,
  commProfile: `${STORAGE_PREFIX}_comm_profile_v3`,
  brokerConfig: `${STORAGE_PREFIX}_broker_config_v3`,
  inquiries: `${STORAGE_PREFIX}_inquiries_v3`,
  adminToken: `${STORAGE_PREFIX}_admin_token`,
  deityArt: `${STORAGE_PREFIX}_custom_deity_art`,
  session: `${STORAGE_PREFIX}_session`,
} as const;

/** Legacy keys that older builds wrote or read. Migrated once, then removed. */
const LEGACY_KEYS: Record<keyof typeof STORAGE_KEYS, string[]> = {
  properties: ['terra_properties_v1', 'varahi_properties_v2'],
  favorites: ['terra_favorites_v1', 'varahi_favorites_v2'],
  compare: ['terra_compare_v1', 'varahi_compare_v2'],
  currency: ['terra_currency_v1', 'varahi_currency_v2'],
  userAccount: ['varahi_user_account_v2'],
  commProfile: ['varahi_comm_profile_v2'],
  brokerConfig: ['terra_broker_config_v1'],
  inquiries: ['terra_inquiries_v1'],
  adminToken: [],
  deityArt: ['varahi_custom_deity_art'],
  session: [],
};

export function readJSON<T>(key: keyof typeof STORAGE_KEYS, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  const primary = STORAGE_KEYS[key];
  const candidates = [primary, ...LEGACY_KEYS[key]];

  for (const candidate of candidates) {
    try {
      const raw = localStorage.getItem(candidate);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as T;
      // Migrate forward: persist under the canonical key on first read.
      if (candidate !== primary) {
        writeJSON(key, parsed);
        try {
          localStorage.removeItem(candidate);
        } catch {
          /* ignore */
        }
      }
      return parsed;
    } catch {
      // Corrupt entry: skip it instead of crashing the app boot.
    }
  }

  return fallback;
}

export function readString(key: keyof typeof STORAGE_KEYS, fallback: string): string {
  if (typeof window === 'undefined') return fallback;

  const primary = STORAGE_KEYS[key];
  const candidates = [primary, ...LEGACY_KEYS[key]];

  for (const candidate of candidates) {
    try {
      const raw = localStorage.getItem(candidate);
      if (raw === null || raw === '') continue;
      // Values may have been written as bare strings or JSON strings.
      let value = raw;
      if (raw.startsWith('"') && raw.endsWith('"')) {
        value = JSON.parse(raw) as string;
      }
      if (candidate !== primary) writeString(key, value);
      return value;
    } catch {
      /* ignore */
    }
  }

  return fallback;
}

export function writeJSON(key: keyof typeof STORAGE_KEYS, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
  } catch (err) {
    // QuotaExceededError must never break the UI.
    console.warn(`[storage] Unable to persist "${key}"`, err);
  }
}

export function writeString(key: keyof typeof STORAGE_KEYS, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS[key], value);
  } catch (err) {
    console.warn(`[storage] Unable to persist "${key}"`, err);
  }
}

export function removeKey(key: keyof typeof STORAGE_KEYS): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS[key]);
  } catch {
    /* ignore */
  }
}
