import { isIsoDate } from "@/lib/invoice/format";

const ROMAN: ReadonlyArray<readonly [number, string]> = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

const LONG_DATE = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function roman(value: number): string {
  let rest = value;
  let out = "";
  for (const [size, symbol] of ROMAN) {
    while (rest >= size) {
      out += symbol;
      rest -= size;
    }
  }
  return out;
}

export function formatLongDate(iso: string): string {
  return isIsoDate(iso) ? LONG_DATE.format(new Date(`${iso}T00:00:00Z`)) : "";
}

export function parseNumber(raw: string): number {
  const cleaned = raw.replace(/rp|%/gi, "").replace(/\s/g, "");
  if (cleaned === "") return 0;

  const hasDot = cleaned.includes(".");
  const hasComma = cleaned.includes(",");
  let normal = cleaned;

  if (hasDot && hasComma) {
    normal =
      cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
        ? cleaned.replaceAll(".", "").replace(",", ".")
        : cleaned.replaceAll(",", "");
  } else if (hasDot) {
    normal = /^-?\d{1,3}(\.\d{3})+$/.test(cleaned)
      ? cleaned.replaceAll(".", "")
      : cleaned;
  } else if (hasComma) {
    normal = /^-?\d{1,3}(,\d{3})+$/.test(cleaned)
      ? cleaned.replaceAll(",", "")
      : cleaned.replace(",", ".");
  }

  const value = Number(normal);
  return Number.isFinite(value) ? value : 0;
}

export function linesOf(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function cellsOf(line: string): string[] {
  return line.split("|").map((cell) => cell.trim());
}

export function fillTokens(
  text: string,
  tokens: Readonly<Record<string, string>>,
  unknown: Set<string>,
): string {
  return text.replace(/\{([a-z_]+)\}/g, (whole, key: string) => {
    const value = tokens[key];
    if (value === undefined) {
      unknown.add(whole);
      return whole;
    }
    return value;
  });
}
