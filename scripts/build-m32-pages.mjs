import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const srcDir = path.resolve("m32-pages-assets");
const outDir = path.resolve("public/m32");
fs.mkdirSync(outDir, { recursive: true });

if (!fs.existsSync(srcDir)) {
  console.log("No m32-pages-assets directory; skipping.");
  process.exit(0);
}

const names = fs.readdirSync(srcDir);
const groups = new Map();

for (const name of names) {
  const m = name.match(/^(.*\.gz\.b64)\.(\d{3})$/);
  if (!m) continue;
  const key = m[1];
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push({ name, index: Number(m[2]) });
}

for (const [key, parts] of groups) {
  parts.sort((a, b) => a.index - b.index);
  const b64 = parts
    .map((p) => fs.readFileSync(path.join(srcDir, p.name), "utf8").trim())
    .join("");
  const target = key.replace(/\.gz\.b64$/, "");
  const data = zlib.gunzipSync(Buffer.from(b64, "base64"));
  fs.writeFileSync(path.join(outDir, target), data);
  console.log(`rebuilt public/m32/${target}`);
}
