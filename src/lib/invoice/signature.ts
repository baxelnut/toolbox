const MAX_WIDTH = 640;
const MAX_BYTES = 5_000_000;

export async function signatureFromFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Pick an image file");
  if (file.size > MAX_BYTES) throw new Error("Image is over 5 MB");

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Could not process the image");
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/png");
}
