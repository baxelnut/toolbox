function channel(value: number): number {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number | null {
  const digits = /^#([0-9a-f]{6})$/i.exec(hex)?.[1];
  if (!digits) return null;
  const n = Number.parseInt(digits, 16);
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

export function scanWarning(fg: string, bg: string): string | null {
  const lf = luminance(fg);
  const lb = luminance(bg);
  if (lf === null || lb === null) return null;
  if (lf > lb) {
    return "Light code on a dark background. Some scanners cannot read inverted codes.";
  }
  if ((lb + 0.05) / (lf + 0.05) < 3) {
    return "Low contrast. This code may not scan.";
  }
  return null;
}
