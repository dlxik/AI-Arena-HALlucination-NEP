export const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j8l8AAAAASUVORK5CYII=";
export const IMAGE_URL = `data:image/png;base64,${PNG}`;
export function imageResponse() {
  return { candidates: [{ finishReason: "STOP", content: { parts: [
    { text: "private upstream commentary" }, { inlineData: { mimeType: "image/png", data: PNG } },
  ] } }] };
}
