import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { SemesterSeedDataSchema } from "./schemas/seed.schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const samplePath = join(__dirname, "schemas", "sample.seed.json");

const raw = readFileSync(samplePath, "utf-8");
const json = JSON.parse(raw);

const result = SemesterSeedDataSchema.safeParse(json);

if (!result.success) {
  console.error("Seed data does not match SemesterSeedDataSchema:");
  console.error(result.error.flatten());
  process.exit(1);
}

console.log("sample.seed.json is valid against SemesterSeedDataSchema.");
