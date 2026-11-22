export type BgChoice = "transparent" | "white" | "black" | "custom";
export type BgFormat = "png" | "webp" | "jpeg";

export const BG_OPTIONS: readonly { value: BgChoice; label: string }[] = [
  { value: "transparent", label: "Transparent" },
  { value: "white", label: "White" },
  { value: "black", label: "Black" },
  { value: "custom", label: "Custom color" },
];

export const BG_FORMAT_OPTIONS: readonly { value: BgFormat; label: string }[] =
  [
    { value: "png", label: "PNG" },
    { value: "webp", label: "WebP" },
    { value: "jpeg", label: "JPG" },
  ];

export function extensionFor(format: BgFormat): string {
  switch (format) {
    case "png":
      return "png";
    case "webp":
      return "webp";
    case "jpeg":
      return "jpg";
  }
}

function mimeFor(format: BgFormat): string {
  switch (format) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "jpeg":
      return "image/jpeg";
  }
}

export function backgroundColor(
  choice: BgChoice,
  custom: string,
): string | null {
  switch (choice) {
    case "white":
      return "#ffffff";
    case "black":
      return "#000000";
    case "custom":
      return custom;
    default:
      return null;
  }
}

export async function composeBlob(
  cutout: Blob,
  background: string | null,
  format: BgFormat,
): Promise<Blob> {
  if (format === "png" && background === null) return cutout;

  const bitmap = await createImageBitmap(cutout);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare the image");

    const fill = background ?? (format === "jpeg" ? "#ffffff" : null);
    if (fill) {
      context.fillStyle = fill;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(bitmap, 0, 0);

    const mime = mimeFor(format);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mime, 0.92),
    );
    if (!blob || blob.type !== mime) {
      throw new Error(
        `This browser cannot export ${extensionFor(format).toUpperCase()}`,
      );
    }
    return blob;
  } finally {
    bitmap.close();
  }
}
