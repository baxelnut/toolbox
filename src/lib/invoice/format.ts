import type { NumberFormat } from "./types";

const ROMAN_MONTHS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
] as const;

const DAY_MS = 86_400_000;

const DATE_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const MONTH_FORMAT = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function utc(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = utc(value);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function addDays(iso: string, days: number): string {
  if (!isIsoDate(iso)) return iso;
  const date = utc(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function diffDays(from: string, to: string): number {
  if (!isIsoDate(from) || !isIsoDate(to)) return 0;
  return Math.round((utc(to).getTime() - utc(from).getTime()) / DAY_MS);
}

export function formatDate(iso: string): string {
  return isIsoDate(iso) ? DATE_FORMAT.format(utc(iso)) : "";
}

export function formatMonth(iso: string): string {
  return isIsoDate(iso) ? MONTH_FORMAT.format(utc(iso)) : "";
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function finiteOrZero(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export function formatMoney(
  value: number,
  currency: string,
  format: NumberFormat,
): string {
  const rounded = round2(value);
  const locale = format === "comma" ? "en-US" : "id-ID";
  const amount = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(Math.abs(rounded));
  const prefix = currency.trim();
  return `${rounded < 0 ? "- " : ""}${prefix ? `${prefix} ` : ""}${amount}`;
}

export function formatInvoiceNumber(
  pattern: string,
  iso: string,
  seq: number,
): string {
  const base = pattern.includes("{SEQ}") ? pattern : `${pattern}/{SEQ}`;
  const month = Number(iso.slice(5, 7));
  return base
    .replaceAll("{YYYY}", iso.slice(0, 4))
    .replaceAll("{MM}", String(month).padStart(2, "0"))
    .replaceAll("{MMR}", ROMAN_MONTHS[month - 1] ?? "")
    .replaceAll("{SEQ}", String(seq).padStart(4, "0"));
}

export function safeFilename(value: string): string {
  return value
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export function uid(): string {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}
