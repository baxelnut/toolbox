import type { QrOptions } from "./options";

export type ExportFormat = "png" | "jpeg" | "webp" | "svg";

export const FORMAT_OPTIONS: readonly { value: ExportFormat; label: string }[] =
  [
    { value: "png", label: "PNG" },
    { value: "jpeg", label: "JPG" },
    { value: "webp", label: "WebP" },
    { value: "svg", label: "SVG" },
  ];

export const SIZE_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "512", label: "512 px" },
  { value: "1024", label: "1024 px" },
  { value: "2048", label: "2048 px" },
];

export const FORMAT_EXT: Record<ExportFormat, string> = {
  png: "png",
  jpeg: "jpg",
  webp: "webp",
  svg: "svg",
};

export const CAN_COPY_IMAGE =
  typeof ClipboardItem !== "undefined" &&
  typeof navigator.clipboard?.write === "function";

export const CAN_SHARE_FILES =
  typeof navigator.share === "function" &&
  typeof navigator.canShare === "function";

export async function renderBlob(
  options: QrOptions,
  format: ExportFormat,
): Promise<Blob> {
  const { default: Styling } = await import("qr-code-styling");
  const qr = new Styling({
    ...options,
    type: format === "svg" ? "svg" : "canvas",
  });
  const raw = await qr.getRawData(format);
  if (!(raw instanceof Blob)) throw new Error("Export failed");
  return raw;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyBlob(blob: Blob): Promise<void> {
  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
}

export async function shareBlob(
  blob: Blob,
  filename: string,
): Promise<boolean> {
  const file = new File([blob], filename, { type: blob.type });
  if (!navigator.canShare({ files: [file] })) return false;
  await navigator.share({ files: [file], title: "QR code" });
  return true;
}
