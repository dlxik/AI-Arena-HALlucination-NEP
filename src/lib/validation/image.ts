const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function parseImageDataUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  const separator = value.indexOf(";base64,");
  if (!value.startsWith("data:") || separator === -1) return;
  return parseInlineImage({ mimeType: value.slice(5, separator), data: value.slice(separator + 8) });
}

// Accept bounded canonical inline images; remote URLs and SVG/HTML are rejected.
export function parseInlineImage(value: unknown): string | undefined {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return;
  const { mimeType, data } = value as Record<string, unknown>;
  if (!["image/png", "image/jpeg", "image/webp"].includes(mimeType as string) ||
      typeof data !== "string" || data.length === 0 || data.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 ||
      data.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) return;
  const bytes = Buffer.from(data, "base64");
  if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES || bytes.toString("base64") !== data) return;
  if (mimeType === "image/png") {
    if (!validPng(bytes)) return;
  } else if (mimeType === "image/jpeg") {
    if (bytes.length < 10 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff ||
        bytes.at(-2) !== 0xff || bytes.at(-1) !== 0xd9) return;
  } else {
    if (bytes.length < 20 || bytes.toString("ascii", 0, 4) !== "RIFF" ||
        bytes.readUInt32LE(4) + 8 !== bytes.length || bytes.toString("ascii", 8, 12) !== "WEBP" ||
        !["VP8 ", "VP8L", "VP8X"].includes(bytes.toString("ascii", 12, 16))) return;
  }
  return `data:${mimeType};base64,${data}`;
}

function validPng(bytes: Buffer): boolean {
  if (bytes.length < 57 || !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return false;
  let offset = 8;
  let imageData = false;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    if (length > bytes.length - offset - 12) return false;
    if (offset === 8 && (type !== "IHDR" || length !== 13 ||
        bytes.readUInt32BE(16) === 0 || bytes.readUInt32BE(20) === 0)) return false;
    if (type === "IDAT" && length > 0) imageData = true;
    offset += length + 12;
    if (type === "IEND") return length === 0 && imageData && offset === bytes.length;
  }
  return false;
}
