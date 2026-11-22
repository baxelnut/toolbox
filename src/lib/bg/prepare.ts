import { safeFilename } from "@/lib/invoice/format";

export const MAX_FILE_BYTES = 20_000_000;
const MAX_EDGE = 4096;

export type PreparedImage = {
  blob: Blob;
  name: string;
  width: number;
  height: number;
  resized: boolean;
};

export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    throw new Error("Use a JPG, PNG or WebP image");
  }
  if (file.size > MAX_FILE_BYTES) throw new Error("The image is over 20 MB");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This browser cannot read that image");
  }

  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare the image");
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) throw new Error("Could not prepare the image");

    const base = safeFilename(file.name.replace(/\.[^.]+$/, ""));
    return {
      blob,
      name: base || "image",
      width,
      height,
      resized: scale < 1,
    };
  } finally {
    bitmap.close();
  }
}
