import { readString, writeString, removeKey } from './storage';
import type { InquirySubmission } from '../types';

// ============================================================================
// Thin API client.
//
// The site is deployable both as the bundled Express server (full API) and as
// static hosting with no functions (e.g. a plain static Vercel deploy). Every
// call therefore reports whether the server accepted the payload so the UI can
// fall back to WhatsApp / local storage instead of showing a fake success.
// ============================================================================

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  offline?: boolean;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  timeoutMs = 12000
): Promise<ApiResult<T>> {
  if (typeof fetch === 'undefined') {
    return { ok: false, status: 0, data: null, offline: true };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(path, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init.headers || {}),
      },
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? ((await res.json()) as T)
      : null;

    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null, offline: true };
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Leads / inquiries
// ---------------------------------------------------------------------------

export interface InquiryResponse {
  success?: boolean;
  id?: string;
  error?: string;
  deliveredTo?: string[];
}

export async function submitInquiry(inquiry: InquirySubmission): Promise<ApiResult<InquiryResponse>> {
  return request<InquiryResponse>('/api/inquiries', {
    method: 'POST',
    body: JSON.stringify(inquiry),
  });
}

// ---------------------------------------------------------------------------
// Auth (OTP + owner PIN) — verified server-side
// ---------------------------------------------------------------------------

export interface OtpRequestResponse {
  success?: boolean;
  /** Only present in development / demo mode, never in production. */
  devCode?: string;
  message?: string;
  error?: string;
}

export async function requestOtp(phone: string): Promise<ApiResult<OtpRequestResponse>> {
  return request<OtpRequestResponse>('/api/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export interface VerifyResponse {
  success?: boolean;
  token?: string;
  name?: string;
  role?: 'buyer' | 'vendor' | 'landowner' | 'agent';
  error?: string;
}

export async function verifyOtp(phone: string, code: string): Promise<ApiResult<VerifyResponse>> {
  return request<VerifyResponse>('/api/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });
}

export async function verifyBrokerPin(pin: string): Promise<ApiResult<VerifyResponse>> {
  return request<VerifyResponse>('/api/auth/broker', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  });
}

// ---------------------------------------------------------------------------
// Owner desk: listed properties, photo upload, lead inbox
// ---------------------------------------------------------------------------

/** Staff requests prefer the signed owner session, falling back to the admin token. */
function staffHeaders(): Record<string, string> {
  const session = getSessionToken();
  if (session) return { Authorization: `Bearer ${session}` };
  const admin = getAdminToken();
  return admin ? { 'x-admin-token': admin } : {};
}

export interface StoredPropertyRecord {
  id: string;
  [key: string]: unknown;
}

export async function fetchProperties(): Promise<
  ApiResult<{ count: number; properties: StoredPropertyRecord[] }>
> {
  return request('/api/properties');
}

export async function createProperty(
  property: Record<string, unknown>
): Promise<ApiResult<{ success?: boolean; property?: StoredPropertyRecord; error?: string }>> {
  return request('/api/properties', {
    method: 'POST',
    headers: staffHeaders(),
    body: JSON.stringify(property),
  });
}

export async function updateProperty(
  id: string,
  patch: Record<string, unknown>
): Promise<ApiResult<{ success?: boolean; property?: StoredPropertyRecord; error?: string }>> {
  return request(`/api/properties/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: staffHeaders(),
    body: JSON.stringify(patch),
  });
}

export async function deleteProperty(
  id: string
): Promise<ApiResult<{ success?: boolean; error?: string }>> {
  return request(`/api/properties/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: staffHeaders(),
  });
}

export async function uploadImage(
  dataUrl: string
): Promise<ApiResult<{ success?: boolean; url?: string; error?: string }>> {
  return request(
    '/api/uploads',
    {
      method: 'POST',
      headers: staffHeaders(),
      body: JSON.stringify({ dataUrl }),
    },
    30000
  );
}

export interface StoredInquiryRecord {
  id: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyCity?: string;
  propertyPrice?: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  tourType?: string;
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
  status?: 'new' | 'contacted' | 'closed';
  createdAt?: string;
  [key: string]: unknown;
}

export async function fetchInquiries(): Promise<
  ApiResult<{ count: number; inquiries: StoredInquiryRecord[]; error?: string }>
> {
  return request('/api/inquiries', { headers: staffHeaders() });
}

export async function updateInquiryStatus(
  id: string,
  status: 'new' | 'contacted' | 'closed'
): Promise<ApiResult<{ success?: boolean; error?: string }>> {
  return request(`/api/inquiries/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: staffHeaders(),
    body: JSON.stringify({ status }),
  });
}

// ---------------------------------------------------------------------------
// Admin token (used for the protected logo/branding upload)
// ---------------------------------------------------------------------------

export function getSessionToken(): string {
  return readString('session', '');
}

export function setSessionToken(token: string): void {
  if (!token) {
    removeKey('session');
    return;
  }
  writeString('session', token);
}

export function getAdminToken(): string {
  return readString('adminToken', '');
}

export function setAdminToken(token: string): void {
  if (!token) {
    removeKey('adminToken');
    return;
  }
  writeString('adminToken', token.trim());
}
