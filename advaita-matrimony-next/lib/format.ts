/**
 * Presentation helpers. Pure functions only — no React, no DOM, no fetch, so
 * they are safe to use from Server and Client Components alike.
 */

/* ==========================================================================
   Numbers
   ========================================================================== */

/**
 * `height_cm` / `weight_kg` are `decimal(5,2)` columns and arrive as strings
 * ("165.00"). Anything unparseable becomes `null` rather than NaN, so callers
 * can distinguish "not provided" from "zero".
 */
export function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** 1234 → "1,234" using Indian digit grouping (1,23,456). */
export function formatCount(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

/** Rupees, no decimals: 1999 → "₹1,999". */
export function formatRupees(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Razorpay quotes paise; humans read rupees. */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * The subscription endpoint returns pre-formatted "used/limit" strings where an
 * unlimited allowance is the literal "∞" character. Parse for progress bars.
 */
export function parseUsage(usage: string): { used: number; limit: number | null } {
  const [usedPart = '0', limitPart = ''] = usage.split('/');
  const used = Number(usedPart.trim()) || 0;
  const trimmedLimit = limitPart.trim();
  if (trimmedLimit === '∞' || trimmedLimit === '-1' || trimmedLimit === '') {
    return { used, limit: null };
  }
  const limit = Number(trimmedLimit);
  return { used, limit: Number.isFinite(limit) ? limit : null };
}

/** -1 means unlimited throughout the subscription API. */
export function formatLimit(limit: number): string {
  return limit === -1 ? 'Unlimited' : formatCount(limit);
}

/* ==========================================================================
   Body & profile
   ========================================================================== */

/** 165 → `5'5" · 165 cm`. Returns null when height is not set. */
export function formatHeight(heightCm: string | number | null | undefined): string | null {
  const cm = toNumber(heightCm);
  if (cm === null || cm <= 0) return null;
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  // Round-up can push inches to 12.
  const displayFeet = inches === 12 ? feet + 1 : feet;
  const displayInches = inches === 12 ? 0 : inches;
  return `${displayFeet}'${displayInches}" · ${Math.round(cm)} cm`;
}

/** Compact form for dense card metadata. */
export function formatHeightShort(heightCm: string | number | null | undefined): string | null {
  const cm = toNumber(heightCm);
  if (cm === null || cm <= 0) return null;
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  return inches === 12 ? `${feet + 1}'0"` : `${feet}'${inches}"`;
}

export function ageFromDate(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDelta = now.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}

/** "Priya Sharma" → "PS". Used by the avatar fallback. */
export function initials(name: string | null | undefined): string {
  if (!name) return '·';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '·';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

/** Only the given name, for greetings. */
export function firstName(name: string | null | undefined): string {
  if (!name) return 'there';
  return name.trim().split(/\s+/)[0] || 'there';
}

/** Joins the non-empty parts of a metadata line: "26 · Bengaluru · Architect". */
export function metaLine(...parts: (string | number | null | undefined)[]): string {
  return parts
    .filter((part) => part !== null && part !== undefined && String(part).trim() !== '')
    .join(' · ');
}

/* ==========================================================================
   Contact masking
   ========================================================================== */

/**
 * The API masks non-premium contact numbers as "9876****10". Detect it so the
 * UI can show an upgrade affordance instead of a broken "call" link.
 */
export function isMaskedPhone(phone: string | null | undefined): boolean {
  return !!phone && phone.includes('*');
}

/** Groups a 10-digit number for readability: "98765 43210". */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  if (isMaskedPhone(phone)) return phone;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  return phone;
}

/* ==========================================================================
   Time
   ========================================================================== */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * "just now" / "12m ago" / "3h ago" / "yesterday" / "12 Mar".
 *
 * Several endpoints already return a human string (`last_active`,
 * `last_message.time`) — prefer the server's value there and use this only for
 * real timestamps such as `created_at`.
 */
export function relativeTime(timestamp: string | null | undefined): string {
  if (!timestamp) return '';
  const then = new Date(timestamp);
  if (Number.isNaN(then.getTime())) return '';

  const delta = Date.now() - then.getTime();
  if (delta < 0) return 'just now';
  if (delta < MINUTE) return 'just now';
  if (delta < HOUR) return `${Math.floor(delta / MINUTE)}m ago`;
  if (delta < DAY) return `${Math.floor(delta / HOUR)}h ago`;
  if (delta < 2 * DAY) return 'yesterday';
  if (delta < 7 * DAY) return `${Math.floor(delta / DAY)}d ago`;

  return then.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    ...(then.getFullYear() === new Date().getFullYear() ? {} : { year: 'numeric' }),
  });
}

/** "12 March 2026" — for expiry dates and other one-off facts. */
export function formatDate(timestamp: string | null | undefined): string {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Clock time for message bubbles: "9:42 pm". */
export function formatClock(timestamp: string | null | undefined): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
}

/** Day separator label inside a conversation. */
export function dayLabel(timestamp: string | null | undefined): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';

  const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const dayDelta = Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY);

  if (dayDelta === 0) return 'Today';
  if (dayDelta === 1) return 'Yesterday';
  if (dayDelta < 7) return date.toLocaleDateString('en-IN', { weekday: 'long' });
  return formatDate(timestamp);
}

/** mm:ss for the OTP resend countdown. */
export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Time-aware greeting. Uses the viewer's own clock, so a member in Bengaluru and
 * one in Toronto each get the right one.
 */
export function greeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 5) return 'Good evening';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ==========================================================================
   Text
   ========================================================================== */

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

/** "3 photos" / "1 photo" without a dozen ternaries at call sites. */
export function pluralise(count: number, singular: string, plural?: string): string {
  return `${formatCount(count)} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}

/** Screen-reader-friendly percentage. */
export function percent(value: number): string {
  return `${Math.round(clamp(value, 0, 100))}%`;
}
