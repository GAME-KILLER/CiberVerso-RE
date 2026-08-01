/**
 * assets-manifest-generator.mjs — Gera manifest.json a partir de uma pasta de assets.
 * USO: node scripts/assets-manifest-generator.mjs <assetsDir> [outputFile]
 * Fica versionado aqui; copiar para o CiberVerso-RE e rodar sobre a pasta assets/.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const assetsDir = process.argv[2];
if (!assetsDir) {
  console.error("Uso: node assets-manifest-generator.mjs <assetsDir> [outputFile]");
  process.exit(1);
}
const outputFile = process.argv[3] || path.join(path.resolve(assetsDir, ".."), "manifest.json");

function walk(dir, base, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, base, acc);
    else acc.push(path.relative(base, full).replace(/\\/g, "/"));
  }
  return acc;
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

const files = walk(assetsDir, assetsDir).map((relativePath) => {
  const full = path.join(assetsDir, relativePath);
  const buffer = fs.readFileSync(full);
  return { path: relativePath, sha256: sha256(buffer), size: buffer.length };
});

const manifest = {
  version: process.env.MANIFEST_VERSION || "1.0.0",
  generatedAt: new Date().toISOString(),
  files,
};

fs.writeFileSync(outputFile, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`✅ Manifest gerado: ${outputFile} (${files.length} arquivos)`);
