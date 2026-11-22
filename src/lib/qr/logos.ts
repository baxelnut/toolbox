// Assets
import { Icons } from "@/assets";

export type LogoKey =
  | "facebook"
  | "github"
  | "instagram"
  | "telegram"
  | "whatsapp"
  | "wifi"
  | "x";

const SOURCES: Record<LogoKey, string> = {
  facebook: Icons.Facebook,
  github: Icons.Github,
  instagram: Icons.Instagram,
  telegram: Icons.Telegram,
  whatsapp: Icons.WhatsApp,
  wifi: Icons.WiFi,
  x: Icons.XElon,
};

const MAX_LOGO_BYTES = 1_500_000;

function tint(svg: string, color: string): string {
  const recolored = svg.replace(/fill="(?!none)[^"]*"/g, `fill="${color}"`);

  return recolored.includes("fill=")
    ? recolored
    : recolored.replace("<svg", `<svg fill="${color}"`);
}

export function brandLogoDataUrl(key: LogoKey, color: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    tint(SOURCES[key], color),
  )}`;
}

export function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Pick an image file"));
      return;
    }

    if (file.size > MAX_LOGO_BYTES) {
      reject(new Error("Logo is over 1.5 MB"));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read the file"));
      }
    };

    reader.onerror = () => reject(new Error("Could not read the file"));

    reader.readAsDataURL(file);
  });
}
