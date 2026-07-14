import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(root, "assets", "data", "klar_product_cards_checked.md");
const outputPath = join(root, "assets", "data", "klar_product_cards_checked.js");
const source = readFileSync(sourcePath, "utf8").replace(/^\uFEFF/, "");

writeFileSync(
  outputPath,
  `window.KLAR_PRODUCT_SOURCE = ${JSON.stringify(source)};\n`,
  "utf8"
);

console.log(`Embedded ${source.length} characters in ${outputPath}`);
