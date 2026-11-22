import { isIsoDate } from "./format";
import type { Counters, InvoiceDraft, Profile } from "./types";

const KEYS = {
  profile: "toolbox:invoice:profile:v1",
  draft: "toolbox:invoice:draft:v1",
  counters: "toolbox:invoice:counters:v1",
} as const;

type ProfileTextKey = Exclude<keyof Profile, "numberFormat">;

const PROFILE_TEXT_KEYS: readonly ProfileTextKey[] = [
  "name",
  "email",
  "phone",
  "website",
  "bankName",
  "accountNumber",
  "accountName",
  "signerName",
  "signerRole",
  "signature",
  "numberPattern",
  "currency",
];

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDraft(value: unknown): value is InvoiceDraft {
  return (
    isRecord(value) &&
    typeof value.templateId === "string" &&
    typeof value.seq === "number" &&
    typeof value.termDays === "number" &&
    typeof value.issueDate === "string" &&
    isIsoDate(value.issueDate) &&
    Array.isArray(value.items) &&
    Array.isArray(value.adjustments) &&
    Array.isArray(value.blocks) &&
    Array.isArray(value.meta)
  );
}

export function loadProfile(fallback: Profile): Profile {
  const raw = read(KEYS.profile);
  if (!isRecord(raw)) return fallback;
  const next: Profile = { ...fallback };
  for (const key of PROFILE_TEXT_KEYS) {
    const value = raw[key];
    if (typeof value === "string") next[key] = value;
  }
  next.numberFormat = raw.numberFormat === "dot" ? "dot" : "comma";
  return next;
}

export function loadDraft(): InvoiceDraft | null {
  const raw = read(KEYS.draft);
  return isDraft(raw) ? raw : null;
}

export function loadCounters(fallback: Counters): Counters {
  const raw = read(KEYS.counters);
  if (!isRecord(raw)) return fallback;
  const stored: Counters = {};
  for (const [year, value] of Object.entries(raw)) {
    if (typeof value === "number" && Number.isFinite(value))
      stored[year] = value;
  }
  return { ...fallback, ...stored };
}

export function saveProfile(profile: Profile): boolean {
  return write(KEYS.profile, profile);
}

export function saveDraft(draft: InvoiceDraft): boolean {
  return write(KEYS.draft, draft);
}

export function saveCounters(counters: Counters): boolean {
  return write(KEYS.counters, counters);
}
