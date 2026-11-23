import { isIsoDate } from "@/lib/invoice/format";
import type { Counters } from "@/lib/invoice/types";
import type { ProposalDraft, ProposalSettings } from "./types";

const KEYS = {
  draft: "toolbox:proposal:draft:v2",
  counters: "toolbox:proposal:counters:v1",
  settings: "toolbox:proposal:settings:v2",
} as const;

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

function isDraft(value: unknown): value is ProposalDraft {
  return (
    isRecord(value) &&
    typeof value.templateId === "string" &&
    typeof value.seq === "number" &&
    typeof value.coverTitle === "string" &&
    typeof value.issueDate === "string" &&
    isIsoDate(value.issueDate) &&
    Array.isArray(value.sections)
  );
}

export function loadDraft(): ProposalDraft | null {
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

export function loadSettings(fallback: ProposalSettings): ProposalSettings {
  const raw = read(KEYS.settings);
  if (!isRecord(raw)) return fallback;
  return {
    numberPattern:
      typeof raw.numberPattern === "string"
        ? raw.numberPattern
        : fallback.numberPattern,
    amountStyle: raw.amountStyle === "comma" ? "comma" : "dot",
  };
}

export function saveDraft(draft: ProposalDraft): boolean {
  return write(KEYS.draft, draft);
}

export function saveCounters(counters: Counters): boolean {
  return write(KEYS.counters, counters);
}

export function saveSettings(settings: ProposalSettings): boolean {
  return write(KEYS.settings, settings);
}
