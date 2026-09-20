import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const garmentsDirectory = join(process.cwd(), "data", "garments");
const requiredKeys = [
  "id",
  "name",
  "summary",
  "recognizable_features",
  "preserve_rules",
  "flexible_elements",
  "compatible_occasions",
  "source_ids",
  "status",
] as const;

for (const file of readdirSync(garmentsDirectory).filter((name) => name.endsWith(".json"))) {
  const path = join(garmentsDirectory, file);
  const record = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
  const missing = requiredKeys.filter((key) => !(key in record));

  if (missing.length > 0) {
    throw new Error(`${file} is missing: ${missing.join(", ")}`);
  }

  if (!["draft", "needs_review", "approved"].includes(String(record.status))) {
    throw new Error(`${file} has an invalid status.`);
  }
}

console.log("Cultural garment placeholders are structurally valid.");
