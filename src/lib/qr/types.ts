import type { LogoKey } from "./logos";

export type QrValues = Record<string, string>;

export type FieldDef = {
  key: string;
  label: string;
  kind: "text" | "url" | "email" | "tel" | "textarea" | "select";
  placeholder?: string | undefined;
  hint?: string | undefined;
  maxLength?: number | undefined;
  options?: readonly { value: string; label: string }[] | undefined;
};

export const QR_TYPE_IDS = [
  "url",
  "text",
  "wifi",
  "whatsapp",
  "email",
  "social",
  "contact",
] as const;

export type QrTypeId = (typeof QR_TYPE_IDS)[number];

export type QrTypeDef = {
  id: QrTypeId;
  label: string;
  fields: readonly FieldDef[];
  defaults: QrValues;
  build: (values: QrValues) => string;
  brandLogo?: ((values: QrValues) => LogoKey | null) | undefined;
};

const SOCIAL = {
  instagram: { label: "Instagram", base: "https://instagram.com/" },
  x: { label: "X", base: "https://x.com/" },
  github: { label: "GitHub", base: "https://github.com/" },
  telegram: { label: "Telegram", base: "https://t.me/" },
  facebook: { label: "Facebook", base: "https://facebook.com/" },
  linkedin: { label: "LinkedIn", base: "https://linkedin.com/in/" },
  tiktok: { label: "TikTok", base: "https://tiktok.com/@" },
} as const;

type SocialId = keyof typeof SOCIAL;

function isSocialId(value: string): value is SocialId {
  return Object.hasOwn(SOCIAL, value);
}

function clean(values: QrValues, key: string): string {
  return values[key]?.trim() ?? "";
}

function normalizeUrl(raw: string): string {
  if (!raw) return "";
  return /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
}

function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

function escapeVCard(value: string): string {
  return value.replace(/([\\;,])/g, "\\$1").replace(/\n/g, "\\n");
}

function whatsappNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}

export const QR_TYPES: Record<QrTypeId, QrTypeDef> = {
  url: {
    id: "url",
    label: "URL",
    fields: [
      { key: "url", label: "Website", kind: "url", placeholder: "example.com" },
    ],
    defaults: { url: "" },
    build: (v) => normalizeUrl(clean(v, "url")),
  },
  text: {
    id: "text",
    label: "Text",
    fields: [
      {
        key: "text",
        label: "Text",
        kind: "textarea",
        placeholder: "Anything you want to encode",
        maxLength: 1000,
      },
    ],
    defaults: { text: "" },
    build: (v) => clean(v, "text"),
  },
  wifi: {
    id: "wifi",
    label: "WiFi",
    fields: [
      { key: "ssid", label: "Network name", kind: "text" },
      { key: "password", label: "Password", kind: "text" },
      {
        key: "security",
        label: "Security",
        kind: "select",
        options: [
          { value: "WPA", label: "WPA / WPA2 / WPA3" },
          { value: "WEP", label: "WEP" },
          { value: "nopass", label: "None" },
        ],
      },
      {
        key: "hidden",
        label: "Hidden network",
        kind: "select",
        options: [
          { value: "no", label: "No" },
          { value: "yes", label: "Yes" },
        ],
      },
    ],
    defaults: { ssid: "", password: "", security: "WPA", hidden: "no" },
    build: (v) => {
      const ssid = clean(v, "ssid");
      if (!ssid) return "";
      const security = clean(v, "security") || "WPA";
      const password = clean(v, "password");
      const parts = [`T:${security}`, `S:${escapeWifi(ssid)}`];
      if (security !== "nopass" && password) {
        parts.push(`P:${escapeWifi(password)}`);
      }
      if (clean(v, "hidden") === "yes") parts.push("H:true");
      return `WIFI:${parts.join(";")};;`;
    },
    brandLogo: () => "wifi",
  },
  whatsapp: {
    id: "whatsapp",
    label: "WhatsApp",
    fields: [
      {
        key: "number",
        label: "Number",
        kind: "tel",
        placeholder: "628123456789",
        hint: "Country code first. A leading 0 is read as +62.",
      },
      {
        key: "message",
        label: "Message (optional)",
        kind: "textarea",
        maxLength: 500,
      },
    ],
    defaults: { number: "", message: "" },
    build: (v) => {
      const number = whatsappNumber(clean(v, "number"));
      if (!number) return "";
      const message = clean(v, "message");
      return `https://wa.me/${number}${
        message ? `?text=${encodeURIComponent(message)}` : ""
      }`;
    },
    brandLogo: () => "whatsapp",
  },
  email: {
    id: "email",
    label: "Email",
    fields: [
      {
        key: "to",
        label: "To",
        kind: "email",
        placeholder: "name@example.com",
      },
      { key: "subject", label: "Subject (optional)", kind: "text" },
      {
        key: "body",
        label: "Body (optional)",
        kind: "textarea",
        maxLength: 500,
      },
    ],
    defaults: { to: "", subject: "", body: "" },
    build: (v) => {
      const to = clean(v, "to");
      if (!to) return "";
      const params: Array<[string, string]> = [
        ["subject", clean(v, "subject")],
        ["body", clean(v, "body")],
      ];
      const query = params
        .filter(([, value]) => value !== "")
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");
      return `mailto:${to}${query ? `?${query}` : ""}`;
    },
  },
  social: {
    id: "social",
    label: "Social",
    fields: [
      {
        key: "platform",
        label: "Platform",
        kind: "select",
        options: Object.entries(SOCIAL).map(([value, item]) => ({
          value,
          label: item.label,
        })),
      },
      {
        key: "handle",
        label: "Username or link",
        kind: "text",
        placeholder: "@username",
      },
    ],
    defaults: { platform: "instagram", handle: "" },
    build: (v) => {
      const handle = clean(v, "handle");
      if (!handle) return "";
      if (/^https?:\/\//i.test(handle)) return handle;
      const platform = clean(v, "platform");
      const base = SOCIAL[isSocialId(platform) ? platform : "instagram"].base;
      return `${base}${encodeURIComponent(handle.replace(/^@/, ""))}`;
    },
    brandLogo: (v) => {
      const platform = clean(v, "platform");
      return platform === "instagram" ||
        platform === "x" ||
        platform === "github" ||
        platform === "telegram" ||
        platform === "facebook"
        ? platform
        : null;
    },
  },
  contact: {
    id: "contact",
    label: "Contact",
    fields: [
      { key: "first", label: "First name", kind: "text" },
      { key: "last", label: "Last name", kind: "text" },
      { key: "org", label: "Company", kind: "text" },
      { key: "title", label: "Job title", kind: "text" },
      { key: "phone", label: "Phone", kind: "tel" },
      { key: "email", label: "Email", kind: "email" },
      { key: "website", label: "Website", kind: "url" },
    ],
    defaults: {
      first: "",
      last: "",
      org: "",
      title: "",
      phone: "",
      email: "",
      website: "",
    },
    build: (v) => {
      const first = clean(v, "first");
      const last = clean(v, "last");
      const org = clean(v, "org");
      const title = clean(v, "title");
      const phone = clean(v, "phone");
      const email = clean(v, "email");
      const website = clean(v, "website");
      if (!first && !last && !phone && !email) return "";

      const name = [first, last].filter(Boolean).join(" ");
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${escapeVCard(last)};${escapeVCard(first)};;;`,
        `FN:${escapeVCard(name || org || phone || email)}`,
      ];
      if (org) lines.push(`ORG:${escapeVCard(org)}`);
      if (title) lines.push(`TITLE:${escapeVCard(title)}`);
      if (phone) lines.push(`TEL;TYPE=CELL:${escapeVCard(phone)}`);
      if (email) lines.push(`EMAIL:${escapeVCard(email)}`);
      if (website) lines.push(`URL:${escapeVCard(normalizeUrl(website))}`);
      lines.push("END:VCARD");
      return lines.join("\r\n");
    },
  },
};

export const QR_TYPE_LIST: readonly QrTypeDef[] = QR_TYPE_IDS.map(
  (id) => QR_TYPES[id],
);

export function initialValues(): Record<QrTypeId, QrValues> {
  return {
    url: { ...QR_TYPES.url.defaults },
    text: { ...QR_TYPES.text.defaults },
    wifi: { ...QR_TYPES.wifi.defaults },
    whatsapp: { ...QR_TYPES.whatsapp.defaults },
    email: { ...QR_TYPES.email.defaults },
    social: { ...QR_TYPES.social.defaults },
    contact: { ...QR_TYPES.contact.defaults },
  };
}
